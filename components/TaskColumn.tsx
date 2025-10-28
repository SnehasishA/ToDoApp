
import React from 'react';
import { Task, Status, User } from '../types';
import TaskCard from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface TaskColumnProps {
  status: Status;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, newStatus: Status) => void;
  onPushDeadline: (taskId: string) => void;
  currentUser: User;
  isCalendarConnected: boolean;
}

const statusConfig = {
    [Status.TODO]: { titleColor: 'text-blue-400', bgColor: 'bg-blue-900/20' },
    [Status.IN_PROGRESS]: { titleColor: 'text-yellow-400', bgColor: 'bg-yellow-900/20' },
    [Status.DONE]: { titleColor: 'text-green-400', bgColor: 'bg-green-900/20' },
};

const TaskColumn: React.FC<TaskColumnProps> = ({ status, tasks, onEditTask, onDeleteTask, onUpdateStatus, onPushDeadline, currentUser, isCalendarConnected }) => {
    const config = statusConfig[status];
    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <div className={`rounded-xl flex flex-col ${config.bgColor}`}>
            <h2 className={`text-xl font-bold p-4 border-b border-slate-700 ${config.titleColor}`}>
                {status} <span className="text-sm font-normal text-slate-400 ml-2">{tasks.length}</span>
            </h2>
            <SortableContext id={status} items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div
                    ref={setNodeRef}
                    className={`flex-1 p-4 space-y-4 overflow-y-auto rounded-b-xl transition-colors ${isOver ? 'bg-slate-800/50' : ''}`}
                    style={{ minHeight: '200px' }}
                >
                    {tasks.map((task) => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            onEdit={() => onEditTask(task)} 
                            onDelete={() => onDeleteTask(task.id)}
                            onUpdateStatus={onUpdateStatus}
                            onPushDeadline={onPushDeadline}
                            currentUser={currentUser}
                            isCalendarConnected={isCalendarConnected}
                        />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
};

export default TaskColumn;
