
import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import { Bell, Moon, Sun, Menu, X, Clock, Trash2 } from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  notifications: {id: string, text: string, time: number, seen: boolean}[];
  clearNotifications: () => void;
  markNotifsAsSeen: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onOpenMenu: () => void;
  onGoToAccount: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  user, notifications, clearNotifications, markNotifsAsSeen, isDarkMode, toggleTheme, onOpenMenu, onGoToAccount 
}) => {
  const [showNotifs, setShowNotifs] = useState(false);

  const hasUnseen = useMemo(() => notifications.some(n => !n.seen), [notifications]);

  const toggleNotifs = () => {
    if (!showNotifs) markNotifsAsSeen();
    setShowNotifs(!showNotifs);
  };

  return (
    <header className={`sticky top-0 z-50 px-4 py-3 shadow-sm flex items-center justify-between transition-colors border-b ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-pink-100'}`}>
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenMenu}
          className="p-2 -ml-2 text-pink-600 hover:bg-pink-50 dark:hover:bg-slate-700 rounded-xl transition-colors active:scale-90"
        >
          <Menu size={28} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-pink-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-pink-200">MI</div>
          <h1 className={`font-black text-lg hidden sm:block italic tracking-tight ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>MANAGER</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={toggleTheme}
          className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-700 text-yellow-400' : 'bg-pink-50 text-pink-600'}`}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {user.role === 'USER' && (
          <div className="relative">
            <button 
              onClick={toggleNotifs}
              className="p-2.5 relative transition-transform active:scale-90"
            >
              <Bell className={`w-6 h-6 ${hasUnseen ? 'text-pink-500 fill-pink-100' : isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              {hasUnseen && (
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full animate-ping"></span>
              )}
            </button>

            {showNotifs && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)}></div>
                <div className={`absolute right-0 mt-2 w-72 rounded-[28px] shadow-2xl overflow-hidden z-50 border transition-all transform animate-in fade-in slide-in-from-top-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-pink-50'}`}>
                  <div className="p-4 bg-pink-600 text-white flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest">Recent Activity</span>
                    <button onClick={clearNotifications} className="p-1 hover:bg-white/20 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-4 border-b last:border-0 relative ${isDarkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-50 hover:bg-pink-50/50'}`}>
                          {!n.seen && <div className="absolute top-4 left-2 w-1.5 h-1.5 bg-pink-500 rounded-full"></div>}
                          <p className={`text-xs font-bold pl-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{n.text}</p>
                          <div className="flex flex-col items-start gap-0.5 text-[9px] text-slate-400 mt-2 pl-3">
                            <span className="flex items-center gap-1">
                                <Clock size={10} />
                                {new Date(n.time).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <button 
          onClick={onGoToAccount}
          className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all active:scale-90 ${isDarkMode ? 'border-slate-700' : 'border-pink-100'}`}
        >
          {user.profileImage ? (
            <img src={user.profileImage} alt="Me" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-sm font-black ${isDarkMode ? 'bg-slate-700 text-pink-400' : 'bg-pink-50 text-pink-600'}`}>
              {user.name.charAt(0)}
            </div>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
