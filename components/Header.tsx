
import React from 'react';
import { User, AccountType, CalendarProvider } from '../types';
import { Plus, Users, LogOut, Calendar, CheckCircle } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onAddTask: () => void;
  onLogout: () => void;
  onManageTeam: () => void;
  onConnectCalendar: () => void;
  calendarProvider: CalendarProvider;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onAddTask, onLogout, onManageTeam, onConnectCalendar, calendarProvider }) => {
  const isCalendarConnected = calendarProvider !== CalendarProvider.NONE;
  
  return (
    <header className="bg-slate-900/70 backdrop-blur-sm border-b border-slate-700 p-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8 text-indigo-400"
        >
          <path
            fillRule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
            clipRule="evenodd"
          />
        </svg>
        <h1 className="text-2xl font-bold text-white">IntelliTask</h1>
      </div>
      <div className="flex items-center gap-4">
        <button
            onClick={onConnectCalendar}
            disabled={isCalendarConnected}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isCalendarConnected ? 'bg-green-500/20 text-green-400 cursor-default' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
        >
            {isCalendarConnected ? <CheckCircle size={16} /> : <Calendar size={16} />}
            <span>{isCalendarConnected ? 'Calendar Connected' : 'Connect Calendar'}</span>
        </button>
        {currentUser.accountType === AccountType.TEAM && currentUser.role === 'admin' && (
           <button
             onClick={onManageTeam}
             className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-slate-700 text-slate-300 hover:bg-slate-600"
           >
             <Users size={16} />
             <span>Manage Team</span>
           </button>
        )}
        <button
          onClick={onAddTask}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
        >
          <Plus size={18} />
          Add Task
        </button>
        <div className="flex items-center gap-3">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full border-2 border-indigo-400" />
            <span className="hidden md:block font-semibold">{currentUser.name}</span>
        </div>
         <button
          onClick={onLogout}
          title="Logout"
          className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
