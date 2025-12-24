
import React, { useState } from 'react';

interface NotificationProviderProps {
  children: React.ReactNode;
  notifications: string[];
  clearNotifications: () => void;
}

const NotificationProvider: React.FC<NotificationProviderProps> = ({ children, notifications, clearNotifications }) => {
  return (
    <>
      {children}
      {notifications.length > 0 && (
        <div className="fixed bottom-24 right-4 z-[100] max-w-[250px] space-y-2 animate-bounce">
          <div className="bg-pink-600 text-white p-3 rounded-2xl shadow-2xl border-2 border-white flex flex-col gap-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest">New Alerts</span>
              <button onClick={clearNotifications} className="text-[10px] opacity-70">Clear</button>
            </div>
            <p className="text-xs font-medium truncate">{notifications[0]}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationProvider;
