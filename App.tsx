
import React, { useState, useEffect } from 'react';
import { Task, Status, User, AccountType, CalendarProvider } from './types';
import { MOCK_INITIAL_USERS, INITIAL_TASKS } from './constants';
import Header from './components/Header';
import TaskColumn from './components/TaskColumn';
import TaskModal from './components/TaskModal';
import AiPanel from './components/AiPanel';
import LoginScreen from './components/LoginScreen';
import TeamManagementModal from './components/TeamManagementModal';
import CalendarSyncModal from './components/CalendarSyncModal';
import Toast from './components/Toast';
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent, closestCenter } from '@dnd-kit/core';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_INITIAL_USERS);
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState<boolean>(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [calendarProvider, setCalendarProvider] = useState<CalendarProvider>(CalendarProvider.NONE);
  const [toastMessage, setToastMessage] = useState<string | null>(null);


  useEffect(() => {
    // Check for overdue tasks
    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach(task => {
        if (new Date(task.dueDate) < now && task.status !== Status.DONE) {
          // In a real app, you might trigger a more visible notification
          console.log(`Task "${task.title}" is overdue!`);
        }
      });
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }

  const handleLogin = (email: string, password: string):boolean => {
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      setAuthenticatedUser(user);
      return true;
    }
    return false;
  };
  
  const handleSignUp = (newUser: Omit<User, 'id'>): boolean => {
    if (allUsers.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
        alert("An account with this email already exists.");
        return false;
    }

    const userToCreate: User = {
        ...newUser,
        id: `user-${Date.now()}`,
    };
    
    setAllUsers(prev => [...prev, userToCreate]);
    setAuthenticatedUser(userToCreate);
    return true;
  }

  const handleLogout = () => {
    setAuthenticatedUser(null);
    setCalendarProvider(CalendarProvider.NONE); // Disconnect calendar on logout
  };
  
  const handleAddTeamMember = (newMember: Omit<User, 'id' | 'accountType' | 'teamId'>) => {
      if (!authenticatedUser || authenticatedUser.accountType !== AccountType.TEAM) return;

      if (allUsers.some(u => u.email.toLowerCase() === newMember.email.toLowerCase())) {
        alert("An account with this email already exists.");
        return;
      }
      
      const userToAdd: User = {
        ...newMember,
        id: `user-${Date.now()}`,
        accountType: AccountType.TEAM,
        role: 'user',
        teamId: authenticatedUser.teamId,
      };
      setAllUsers(prev => [...prev, userToAdd]);
  };


  const handleOpenModal = (task: Task | null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTask(null);
    setIsModalOpen(false);
  };

  const handleSaveTask = (taskToSave: Omit<Task, 'id' | 'status'> & { id?: string }) => {
    if (taskToSave.id) {
      setTasks(tasks.map(task => (task.id === taskToSave.id ? { ...task, ...taskToSave } as Task : task)));
    } else {
      const newTask: Task = {
        ...taskToSave,
        id: `task-${Date.now()}`,
        status: Status.TODO,
      };
      setTasks([...tasks, newTask]);
    }

    if (calendarProvider !== CalendarProvider.NONE) {
      showToast(`Task saved. Add it to your calendar from the task card.`);
    }

    handleCloseModal();
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };
  
  const handleUpdateTaskStatus = (taskId: string, newStatus: Status) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task));
  };

  const handlePushDeadline = (taskId: string) => {
    setTasks(tasks.map(task => {
        if (task.id === taskId) {
            const currentDueDate = new Date(task.dueDate);
            // Push deadline by 24 hours
            const newDueDate = new Date(currentDueDate.getTime() + 24 * 60 * 60 * 1000);
            return { ...task, dueDate: newDueDate.toISOString() };
        }
        return task;
    }));
    if (calendarProvider !== CalendarProvider.NONE) {
        showToast(`Deadline updated. Re-add to your calendar if needed.`);
    }
  };

  const handleConnectCalendar = (provider: CalendarProvider) => {
    setCalendarProvider(provider);
    setIsCalendarModalOpen(false);
    showToast(`Connected to ${provider}! You can now add tasks to your calendar.`);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
        setTasks((items) => {
            const activeIndex = items.findIndex(item => item.id === active.id);
            const overId = over.id as Status | string;

            // Check if dropping on a column
            if (Object.values(Status).includes(overId as Status)) {
                 if (items[activeIndex].status !== overId) {
                    items[activeIndex].status = overId as Status;
                    return [...items];
                }
            }
            // Add logic for reordering within a column if needed
            return items;
        });
    }
  };

  if (!authenticatedUser) {
    return <LoginScreen onLogin={handleLogin} onSignUp={handleSignUp} />;
  }
  
  const getVisibleTasks = () => {
      if (authenticatedUser.accountType === AccountType.INDIVIDUAL) {
          return tasks.filter(task => task.assignee.id === authenticatedUser.id);
      }
      if (authenticatedUser.accountType === AccountType.TEAM) {
          if (authenticatedUser.role === 'admin') {
              // Admin sees all tasks for their team
              return tasks.filter(task => task.assignee.teamId === authenticatedUser.teamId);
          } else {
              // Team member sees only their tasks
              return tasks.filter(task => task.assignee.id === authenticatedUser.id);
          }
      }
      return [];
  }
  
  const visibleTasks = getVisibleTasks();
  const teamMembers = authenticatedUser.teamId 
    ? allUsers.filter(u => u.teamId === authenticatedUser.teamId) 
    : [authenticatedUser];


  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex flex-col h-screen font-sans">
        <Header 
          currentUser={authenticatedUser} 
          onAddTask={() => handleOpenModal(null)}
          onLogout={handleLogout}
          onManageTeam={() => setIsTeamModalOpen(true)}
          onConnectCalendar={() => setIsCalendarModalOpen(true)}
          calendarProvider={calendarProvider}
        />
        <main className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                <TaskColumn status={Status.TODO} tasks={visibleTasks.filter(t => t.status === Status.TODO)} onEditTask={handleOpenModal} onDeleteTask={handleDeleteTask} onUpdateStatus={handleUpdateTaskStatus} onPushDeadline={handlePushDeadline} currentUser={authenticatedUser} isCalendarConnected={calendarProvider !== CalendarProvider.NONE} />
                <TaskColumn status={Status.IN_PROGRESS} tasks={visibleTasks.filter(t => t.status === Status.IN_PROGRESS)} onEditTask={handleOpenModal} onDeleteTask={handleDeleteTask} onUpdateStatus={handleUpdateTaskStatus} onPushDeadline={handlePushDeadline} currentUser={authenticatedUser} isCalendarConnected={calendarProvider !== CalendarProvider.NONE} />
                <TaskColumn status={Status.DONE} tasks={visibleTasks.filter(t => t.status === Status.DONE)} onEditTask={handleOpenModal} onDeleteTask={handleDeleteTask} onUpdateStatus={handleUpdateTaskStatus} onPushDeadline={handlePushDeadline} currentUser={authenticatedUser} isCalendarConnected={calendarProvider !== CalendarProvider.NONE} />
            </div>
            </div>
            <AiPanel tasks={visibleTasks} setTasks={setTasks} currentUser={authenticatedUser} teamMembers={teamMembers} />
        </main>
        {isModalOpen && <TaskModal task={editingTask} onSave={handleSaveTask} onClose={handleCloseModal} currentUser={authenticatedUser} teamMembers={teamMembers}/>}
        {isTeamModalOpen && <TeamManagementModal teamMembers={teamMembers} onAddMember={handleAddTeamMember} onClose={() => setIsTeamModalOpen(false)} />}
        {isCalendarModalOpen && <CalendarSyncModal onConnect={handleConnectCalendar} onClose={() => setIsCalendarModalOpen(false)} />}
        <Toast message={toastMessage} />
        </div>
    </DndContext>
  );
};

export default App;
