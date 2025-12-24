
import React from 'react';
import { UserRole, UserProfile } from '../types';
import { 
  Package, Edit3, Home, ShoppingBag, Box, BarChart2, 
  User as UserIcon, LogOut, X, ChevronRight, Settings 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  onLogout: () => void;
  user: UserProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, onClose, role, activeTab, setActiveTab, isDarkMode, onLogout, user 
}) => {
  const isAdmin = role === UserRole.ADMIN;

  const menuItems = isAdmin ? [
    { id: 'STOCK', label: 'Live Stock Point', icon: <Package size={22} /> },
    { id: 'MANAGE', label: 'Manage Products', icon: <Edit3 size={22} /> },
  ] : [
    { id: 'STOCK', label: 'Live Stock', icon: <Home size={22} /> },
    { id: 'BILLING', label: 'Billing/Buy', icon: <ShoppingBag size={22} /> },
    { id: 'INVENTORY', label: 'Inventory', icon: <Box size={22} /> },
    { id: 'ANALYTICS', label: 'Reports & Analytics', icon: <BarChart2 size={22} /> },
    { id: 'ACCOUNT', label: 'My Account', icon: <UserIcon size={22} /> },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className={`fixed top-0 left-0 bottom-0 w-80 z-[70] transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isDarkMode ? 'bg-slate-800 border-r border-slate-700' : 'bg-white border-r border-pink-100'} shadow-2xl flex flex-col`}>
        {/* Profile Header in Sidebar */}
        <div className={`p-8 ${isDarkMode ? 'bg-slate-900/50' : 'bg-pink-50/50'} relative`}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-pink-600 transition-colors">
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 ${isDarkMode ? 'border-slate-700' : 'border-white'} shadow-lg`}>
              {user.profileImage ? (
                <img src={user.profileImage} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="w-full h-full bg-pink-100 flex items-center justify-center text-pink-600 font-black text-xl">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <p className={`font-black text-lg truncate w-40 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{user.name}</p>
              <p className="text-[10px] font-bold text-pink-600 tracking-widest uppercase">{user.idNumber}</p>
            </div>
          </div>
          
          <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full inline-block ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-pink-100 text-pink-600'}`}>
            {isAdmin ? 'System Administrator' : 'Direct Seller'}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); onClose(); }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                activeTab === item.id 
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' 
                : isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-pink-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`${activeTab === item.id ? 'text-white' : 'text-pink-500'}`}>{item.icon}</span>
                <span className="font-bold tracking-tight text-sm uppercase">{item.label}</span>
              </div>
              <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === item.id ? 'hidden' : ''}`} />
            </button>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className={`p-6 border-t ${isDarkMode ? 'border-slate-700 bg-slate-900/30' : 'border-pink-50 bg-slate-50/50'}`}>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95"
          >
            <LogOut size={18} /> Sign Out Account
          </button>
          <p className="text-center text-[9px] font-bold text-slate-400 mt-4 uppercase tracking-[0.3em]">MI Business Suite v2.5</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
