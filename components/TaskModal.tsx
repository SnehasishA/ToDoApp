
import React, { useState } from 'react';
import { Task, Priority, User, Frequency } from '../types';
import { X } from 'lucide-react';

interface TaskModalProps {
  task: Task | null;
  onSave: (taskData: Omit<Task, 'status'> & {id?: string}) => void;
  onClose: () => void;
  currentUser: User;
  teamMembers: User[];
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onSave, onClose, currentUser, teamMembers }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || Priority.MEDIUM);
  const [frequency, setFrequency] = useState(task?.frequency || Frequency.ONE_TIME);
  // Format for datetime-local input: YYYY-MM-DDTHH:mm
  const [dueDate, setDueDate] = useState(task?.dueDate ? new Date(new Date(task.dueDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');
  const [assignee, setAssignee] = useState(task?.assignee.id || currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    
    // When creating a new Date from the input, it's parsed as local time.
    // toISOString() converts it to UTC, which is what we want for consistent storage.
    onSave({
      id: task?.id,
      title,
      description,
      priority,
      frequency,
      dueDate: new Date(dueDate).toISOString(),
      assignee: teamMembers.find(u => u.id === assignee)!,
    });
  };

  const canEditSensitiveFields = currentUser.role === 'admin';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700 m-4">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold">{task ? 'Edit Task' : 'Add New Task'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="e.g., Finalize Q3 report"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 h-24 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="Add more details about the task..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label htmlFor="priority" className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              >
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-slate-300 mb-1">Frequency</label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as Frequency)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              >
                {Object.values(Frequency).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-slate-300 mb-1">Due Date & Time</label>
              <input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${!canEditSensitiveFields && task ? 'opacity-50 cursor-not-allowed' : ''}`}
                required
                disabled={!canEditSensitiveFields && !!task}
              />
              {!canEditSensitiveFields && !!task && <p className="text-xs text-slate-500 mt-1">Admin required to change due date.</p>}
            </div>
            <div>
              <label htmlFor="assignee" className="block text-sm font-medium text-slate-300 mb-1">Assignee</label>
              <select
                id="assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className={`w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${!canEditSensitiveFields ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!canEditSensitiveFields}
              >
                {teamMembers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
               {!canEditSensitiveFields && <p className="text-xs text-slate-500 mt-1">Admin required to change assignee.</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500 font-semibold transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 font-semibold transition-colors">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
