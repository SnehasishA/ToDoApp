
import React from 'react';
import { Task, User, Frequency, Status } from '../types';
import { PRIORITY_COLORS } from '../constants';
import { Calendar, Edit, Trash2, Flag, Repeat, CheckCircle, Clock, CalendarPlus } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateStatus: (taskId: string, newStatus: Status) => void;
  onPushDeadline: (taskId: string) => void;
  currentUser: User;
  isCalendarConnected: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onUpdateStatus, onPushDeadline, currentUser, isCalendarConnected }) => {
  const priorityConfig = PRIORITY_COLORS[task.priority];
  
  const now = new Date();
  const dueDate = new Date(task.dueDate);
  const isOverdue = dueDate < now && task.status !== Status.DONE;
  const hoursRemaining = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isUrgent = hoursRemaining > 0 && hoursRemaining < 2 && task.status !== Status.DONE;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleAddToCalendar = () => {
    const formatDateForICS = (date: Date): string => {
        return date.toISOString().replace(/-|:|\.\d{3}/g, '');
    };

    const startDate = new Date(task.dueDate);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1-hour duration

    const escapeICSString = (str: string): string => {
        return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//IntelliTask//EN
BEGIN:VEVENT
UID:${task.id}@intellitask.app
DTSTAMP:${formatDateForICS(new Date())}
DTSTART:${formatDateForICS(startDate)}
DTEND:${formatDateForICS(endDate)}
SUMMARY:${escapeICSString(task.title)}
DESCRIPTION:${escapeICSString(task.description)}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const safeFilename = task.title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, '_');
    link.download = `${safeFilename}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
  };
  
  const canEdit = currentUser.role === 'admin' || currentUser.id === task.assignee.id;

  return (
    <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700 transition-all transform hover:shadow-indigo-500/20 hover:-translate-y-1 ${isOverdue ? 'border-red-500/50' : 'hover:border-indigo-500/50'} ${isDragging ? 'ring-2 ring-indigo-500 shadow-2xl opacity-75' : ''} ${isUrgent ? 'ring-2 ring-amber-500/80 animate-pulse' : ''}`}
    >
        <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg text-slate-100 pr-2">{task.title}</h3>
            <div className="flex items-center gap-2">
                 <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${priorityConfig.bg} ${priorityConfig.text}`}>
                    <Flag size={12} />
                    <span>{task.priority}</span>
                </div>
            </div>
        </div>
        <p className="text-slate-400 text-sm my-2">{task.description}</p>
        <div className="flex items-center mt-4">
            <img src={task.assignee.avatar} alt={task.assignee.name} title={task.assignee.name} className="w-8 h-8 rounded-full border-2 border-slate-600" />
            <div className="ml-3 flex-1">
                <div className={`flex items-center justify-between`}>
                    <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                        <Calendar size={16} />
                        <span>{formatDate(task.dueDate)}</span>
                    </div>
                     {isCalendarConnected && (
                        <button onClick={handleAddToCalendar} title="Add to Calendar" className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 hover:bg-green-500/20 px-2 py-1 rounded-md transition-colors">
                            <CalendarPlus size={14} />
                            <span>Add to Cal</span>
                        </button>
                    )}
                </div>
                {task.frequency !== Frequency.ONE_TIME && (
                    <div className="flex items-center gap-1.5 text-xs text-cyan-400 mt-1" title={`Repeats ${task.frequency.toLowerCase()}`}>
                        <Repeat size={12} />
                        <span>{task.frequency}</span>
                    </div>
                )}
            </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-700">
            <div className="flex items-center gap-2">
                 {task.status !== Status.DONE && (
                    <button onClick={() => onUpdateStatus(task.id, Status.DONE)} title="Mark as Complete" className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 hover:bg-green-500/20 px-2 py-1 rounded-md transition-colors">
                        <CheckCircle size={14} />
                        Complete
                    </button>
                 )}
                 {isUrgent && canEdit && (
                    <button onClick={() => onPushDeadline(task.id)} title="Push Deadline by 24h" className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-md transition-colors">
                        <Clock size={14} />
                        Push
                    </button>
                 )}
            </div>
            <div className="flex items-center gap-2">
                {canEdit && (
                    <button onClick={onEdit} className="text-slate-400 hover:text-blue-400 p-1.5 rounded-md hover:bg-slate-700 transition-colors">
                        <Edit size={16} />
                    </button>
                )}
                {canEdit && (
                    <button onClick={onDelete} className="text-slate-400 hover:text-red-400 p-1.5 rounded-md hover:bg-slate-700 transition-colors">
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};

export default TaskCard;
