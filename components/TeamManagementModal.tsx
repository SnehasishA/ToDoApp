
import React, { useState } from 'react';
import { User } from '../types';
import { X, UserPlus, Trash2 } from 'lucide-react';

interface TeamManagementModalProps {
  teamMembers: User[];
  onAddMember: (newMember: Omit<User, 'id' | 'accountType' | 'teamId'>) => void;
  onClose: () => void;
}

const TeamManagementModal: React.FC<TeamManagementModalProps> = ({ teamMembers, onAddMember, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < 8 || password.length > 15) {
            setError("Password must be between 8 and 15 characters.");
            return;
        }
        if (!name.trim() || !email.trim()) {
            setError("Name and email are required.");
            return;
        }

        onAddMember({
            name,
            email,
            password,
            avatar: `https://i.pravatar.cc/150?u=${email}`,
            role: 'user',
        });

        // Reset form
        setName('');
        setEmail('');
        setPassword('');
    };


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-700 m-4">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold">Manage Team</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add new member form */}
            <div className="border-r border-slate-700 pr-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-indigo-400"><UserPlus size={20}/> Add New Member</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded-md">{error}</p>}
                    <div>
                        <label htmlFor="new-member-name" className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                        <input id="new-member-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 outline-none transition" required />
                    </div>
                     <div>
                        <label htmlFor="new-member-email" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                        <input id="new-member-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 outline-none transition" required />
                    </div>
                     <div>
                        <label htmlFor="new-member-password" className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                        <input id="new-member-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 outline-none transition" required placeholder="8-15 characters" />
                    </div>
                    <button type="submit" className="w-full px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 font-semibold transition-colors">Add Member</button>
                </form>
            </div>
            {/* Team members list */}
            <div>
                 <h3 className="text-lg font-semibold mb-3">Current Members</h3>
                 <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {teamMembers.map(member => (
                        <div key={member.id} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-md">
                            <div className="flex items-center gap-3">
                                <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-semibold text-white">{member.name}</p>
                                    <p className="text-xs text-slate-400">{member.email}</p>
                                </div>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${member.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-600 text-slate-300'}`}>
                                {member.role}
                            </span>
                        </div>
                    ))}
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TeamManagementModal;
