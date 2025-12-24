
import React, { useState } from 'react';
import { Phone, Lock, ArrowRight, ShieldCheck, User as UserIcon, UserPlus, Coins, UserCircle } from 'lucide-react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (credential: string, pass: string, role: UserRole) => void;
  onSignup: (userData: any) => void;
  isDarkMode: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSignup, isDarkMode }) => {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Signup fields
  const [signupData, setSignupData] = useState({
    name: '',
    idNumber: '',
    mobile: '',
    investedAmount: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSigningUp) {
      if (!signupData.name || !signupData.idNumber || !signupData.mobile || !signupData.investedAmount || !signupData.password) {
        alert("Please fill all fields");
        return;
      }
      onSignup(signupData);
      setIsSigningUp(false);
    } else {
      onLogin(credential, password, role);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-pink-50'}`}>
      <div className={`w-full max-w-md rounded-[40px] shadow-2xl p-8 space-y-8 border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-pink-100'}`}>
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-pink-600 rounded-[28px] flex items-center justify-center text-white text-4xl font-black mx-auto shadow-xl shadow-pink-200">
            MI
          </div>
          <h1 className={`text-2xl font-black pt-4 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>MI Business Suite</h1>
          <p className="text-slate-500 text-sm font-medium italic">
            {isSigningUp ? 'Join the distribution network' : 'Empowering your distribution journey'}
          </p>
        </div>

        {!isSigningUp && (
          <div className={`flex p-1 rounded-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-pink-50'}`}>
            <button 
              type="button"
              onClick={() => setRole(UserRole.USER)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all ${role === UserRole.USER ? 'bg-white dark:bg-slate-700 text-pink-600 shadow-md' : 'text-slate-500 hover:text-pink-400'}`}
            >
              <UserIcon size={18} /> User Login
            </button>
            <button 
              type="button"
              onClick={() => setRole(UserRole.ADMIN)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all ${role === UserRole.ADMIN ? 'bg-white dark:bg-slate-700 text-pink-600 shadow-md' : 'text-slate-500 hover:text-pink-400'}`}
            >
              <ShieldCheck size={18} /> Admin Access
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSigningUp ? (
            <div className="space-y-4">
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" size={20} />
                <input 
                  type="text" 
                  placeholder="Full Name"
                  className={`w-full border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-pink-500/20 transition-all font-black ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                  value={signupData.name}
                  onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                />
              </div>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" size={20} />
                <input 
                  type="text" 
                  placeholder="MI ID (e.g. MI-12345)"
                  className={`w-full border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-pink-500/20 transition-all font-black ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                  value={signupData.idNumber}
                  onChange={(e) => setSignupData({...signupData, idNumber: e.target.value})}
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" size={20} />
                <input 
                  type="text" 
                  placeholder="Mobile Number"
                  className={`w-full border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-pink-500/20 transition-all font-black ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                  value={signupData.mobile}
                  onChange={(e) => setSignupData({...signupData, mobile: e.target.value})}
                />
              </div>
              <div className="relative">
                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" size={20} />
                <input 
                  type="number" 
                  placeholder="Initial Investment (₹)"
                  className={`w-full border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-pink-500/20 transition-all font-black ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                  value={signupData.investedAmount}
                  onChange={(e) => setSignupData({...signupData, investedAmount: e.target.value})}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" size={20} />
                <input 
                  type="password" 
                  placeholder="Set Password"
                  className={`w-full border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-pink-500/20 transition-all font-black ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                  value={signupData.password}
                  onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" size={20} />
                <input 
                  type="text" 
                  placeholder={role === UserRole.ADMIN ? "Admin Username" : "MI ID or Mobile Number"}
                  className={`w-full border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-pink-500/20 transition-all font-black ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" size={20} />
                <input 
                  type="password" 
                  placeholder="Secure Password"
                  className={`w-full border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-pink-500/20 transition-all font-black ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black py-4 rounded-3xl shadow-2xl shadow-pink-300 flex items-center justify-center gap-2 transform active:scale-95 transition-all uppercase tracking-widest text-sm"
          >
            {isSigningUp ? "Create User Account" : "Enter Dashboard"} <ArrowRight size={20} />
          </button>
        </form>

        <div className="text-center pt-4 space-y-4">
          {!isSigningUp && role === UserRole.USER && (
            <button 
              onClick={() => setIsSigningUp(true)}
              className="text-pink-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:underline"
            >
              <UserPlus size={16} /> New User? Sign Up Here
            </button>
          )}
          {isSigningUp && (
            <button 
              onClick={() => setIsSigningUp(false)}
              className="text-slate-500 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:underline"
            >
              Already have an account? Login
            </button>
          )}
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Secure Enterprise Encryption Active
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
