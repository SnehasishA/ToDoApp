
import React, { useState } from 'react';
import { CalendarProvider } from '../types';
import { X, Loader } from 'lucide-react';

interface CalendarSyncModalProps {
  onConnect: (provider: CalendarProvider) => void;
  onClose: () => void;
}

const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({ onConnect, onClose }) => {
    const [loadingProvider, setLoadingProvider] = useState<CalendarProvider | null>(null);

    const handleConnectClick = (provider: CalendarProvider) => {
        setLoadingProvider(provider);
        // Simulate API call for OAuth
        setTimeout(() => {
            onConnect(provider);
            setLoadingProvider(null);
        }, 1500);
    };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700 m-4">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold">Connect a Calendar</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
            <p className="text-slate-400 text-center mb-6">Sync your tasks and due dates with your favorite calendar to stay organized everywhere.</p>
            <div className="space-y-4">
                <button 
                    onClick={() => handleConnectClick(CalendarProvider.GOOGLE)}
                    disabled={!!loadingProvider}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                    {loadingProvider === CalendarProvider.GOOGLE ? <Loader className="animate-spin" size={20}/> : <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5"/>}
                    <span className="font-semibold">Connect Google Calendar</span>
                </button>
                <button 
                    onClick={() => handleConnectClick(CalendarProvider.OUTLOOK)}
                    disabled={!!loadingProvider}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                    {loadingProvider === CalendarProvider.OUTLOOK ? <Loader className="animate-spin" size={20}/> : <img src="https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.001/assets/brand-icons/product/svg/Outlook_32x1.svg" alt="Outlook" className="w-5 h-5"/>}
                    <span className="font-semibold">Connect Outlook Calendar</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarSyncModal;
