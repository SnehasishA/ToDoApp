
import React, { useState } from 'react';
import { User, AccountType } from '../types';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => boolean;
  onSignUp: (newUser: Omit<User, 'id'>) => boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignUp }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Sign In State
  const [signInEmail, setSignInEmail] = useState('admin@team.com');
  const [signInPassword, setSignInPassword] = useState('password123');
  
  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState<AccountType>(AccountType.INDIVIDUAL);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = onLogin(signInEmail, signInPassword);
    if (!success) {
      setError("Invalid email or password.");
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (signUpPassword !== signUpConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (signUpPassword.length < 8 || signUpPassword.length > 15) {
        setError("Password must be between 8 and 15 characters.");
        return;
    }

    const newUser: Omit<User, 'id'> = {
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword,
        avatar: `https://i.pravatar.cc/150?u=${signUpEmail}`,
        role: accountType === AccountType.TEAM ? 'admin' : 'admin',
        accountType: accountType,
        teamId: accountType === AccountType.TEAM ? `team-${Date.now()}` : undefined,
    }
    
    onSignUp(newUser);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
      <div className="w-full max-w-md mx-auto bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
        <div className="flex flex-col items-center pt-8 pb-4">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-indigo-400 mb-3">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
            <h2 className="text-3xl font-bold text-center text-white">Welcome to IntelliTask</h2>
        </div>
        
        <div className="border-b border-slate-700 flex">
            <button onClick={() => setActiveTab('signin')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'signin' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}>Sign In</button>
            <button onClick={() => setActiveTab('signup')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'signup' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}>Sign Up</button>
        </div>
        
        <div className="p-8">
            {error && <div className="bg-red-500/20 text-red-400 text-sm p-3 rounded-md mb-4 text-center">{error}</div>}
            
            {activeTab === 'signin' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email-signin" className="block mb-2 text-sm font-medium text-slate-300">Email</label>
                        <input id="email-signin" type="email" value={signInEmail} onChange={e => setSignInEmail(e.target.value)} className="w-full px-4 py-2.5 text-white bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div>
                        <label htmlFor="password-signin" className="block mb-2 text-sm font-medium text-slate-300">Password</label>
                        <input id="password-signin" type="password" value={signInPassword} onChange={e => setSignInPassword(e.target.value)} className="w-full px-4 py-2.5 text-white bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <button type="submit" className="w-full px-4 py-3 mt-4 text-lg font-semibold text-white transition-colors duration-300 transform bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none">Sign In</button>
                    <p className="text-xs text-slate-500 text-center pt-2">Hint: Use admin@team.com or casey@individual.com with password `password123`</p>
                </form>
            )}

            {activeTab === 'signup' && (
                 <form onSubmit={handleSignUpSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name-signup" className="block mb-2 text-sm font-medium text-slate-300">Full Name</label>
                        <input id="name-signup" type="text" value={signUpName} onChange={e => setSignUpName(e.target.value)} className="w-full px-4 py-2.5 text-white bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div>
                        <label htmlFor="email-signup" className="block mb-2 text-sm font-medium text-slate-300">Email</label>
                        <input id="email-signup" type="email" value={signUpEmail} onChange={e => setSignUpEmail(e.target.value)} className="w-full px-4 py-2.5 text-white bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                     <div>
                        <label htmlFor="password-signup" className="block mb-2 text-sm font-medium text-slate-300">Password</label>
                        <input id="password-signup" type="password" value={signUpPassword} onChange={e => setSignUpPassword(e.target.value)} className="w-full px-4 py-2.5 text-white bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                     <div>
                        <label htmlFor="confirm-password-signup" className="block mb-2 text-sm font-medium text-slate-300">Confirm Password</label>
                        <input id="confirm-password-signup" type="password" value={signUpConfirmPassword} onChange={e => setSignUpConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 text-white bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                     <div>
                        <label className="block mb-2 text-sm font-medium text-slate-300">Account Type</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="radio" name="accountType" value={AccountType.INDIVIDUAL} checked={accountType === AccountType.INDIVIDUAL} onChange={() => setAccountType(AccountType.INDIVIDUAL)} className="form-radio bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500" /> Individual</label>
                            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="radio" name="accountType" value={AccountType.TEAM} checked={accountType === AccountType.TEAM} onChange={() => setAccountType(AccountType.TEAM)} className="form-radio bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500" /> Team</label>
                        </div>
                    </div>
                    <button type="submit" className="w-full px-4 py-3 mt-4 text-lg font-semibold text-white transition-colors duration-300 transform bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none">Create Account</button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
