
import React, { useState, useRef, useMemo } from 'react';
import { UserProfile, Transaction, InventoryItem, Product, InventoryStatus } from '../types';
import { Camera, Upload, Wallet, ShoppingCart, User as UserIcon, TrendingUp, MinusCircle, Briefcase, FileSpreadsheet, Calendar } from 'lucide-react';
import { generateCSV } from '../utils/exportUtils';

interface UserAccountProps {
  user: UserProfile;
  setUser: (u: UserProfile) => void;
  transactions: Transaction[];
  inventory: InventoryItem[];
  products: Product[];
  isDarkMode: boolean;
}

const UserAccount: React.FC<UserAccountProps> = ({ user, setUser, transactions, inventory, products, isDarkMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setUser(editedUser);
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditedUser(prev => ({ ...prev, profileImage: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const lifecycleSummary = useMemo(() => {
    const invested = user.investedAmount;
    const purchased = user.spentAmount; 
    let soldAmt = 0;
    let personalAmt = 0;
    let profitRealized = 0;
    let profitForegone = 0;

    inventory.forEach(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (!p) return;
      
      const unitDist = p.distributorPrice;
      const unitRetail = p.retailPrice;
      const unitProfit = unitRetail - unitDist;

      if (item.status === InventoryStatus.SOLD) {
        soldAmt += (unitRetail * item.quantity);
        profitRealized += (unitProfit * item.quantity);
      } else if (item.status === InventoryStatus.PERSONAL) {
        personalAmt += (unitDist * item.quantity);
        profitForegone += (unitProfit * item.quantity);
      }
    });

    return { invested, purchased, soldAmt, personalAmt, profitRealized, profitForegone };
  }, [inventory, products, user]);

  const lifecycleHistory = useMemo(() => {
    const dates: Record<string, any> = {};

    const ensureDate = (ts: number) => {
      const d = new Date(ts).toISOString().split('T')[0];
      if (!dates[d]) {
        dates[d] = { 
          date: d, 
          purchased: 0, 
          sold: 0, 
          personal: 0, 
          profitRealized: 0, 
          profitForegone: 0 
        };
      }
      return d;
    };

    transactions.forEach(tx => {
      const d = ensureDate(tx.timestamp);
      dates[d].purchased += tx.totalDP;
    });

    inventory.forEach(item => {
      const d = ensureDate(item.timestamp);
      const p = products.find(prod => prod.id === item.productId);
      if (!p) return;
      
      const cost = p.distributorPrice * item.quantity;
      const retail = p.retailPrice * item.quantity;
      const profit = retail - cost;

      if (item.status === InventoryStatus.SOLD) {
        dates[d].sold += retail;
        dates[d].profitRealized += profit;
      } else if (item.status === InventoryStatus.PERSONAL) {
        dates[d].personal += cost;
        dates[d].profitForegone += profit;
      }
    });

    return Object.values(dates).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, inventory, products]);

  const handleExportCSVHistory = () => {
    const data = lifecycleHistory.map(row => ({
      Date: row.date,
      'Total Invested': user.investedAmount,
      Purchased: row.purchased,
      Sold: row.sold,
      Personal: row.personal,
      'Profit Realized': row.profitRealized,
      'Profit Foregone': row.profitForegone
    }));
    generateCSV(data, `MI_LIFECYCLE_HISTORY_${user.idNumber}.csv`);
  };

  const achievement = (lifecycleSummary.profitRealized / user.salesTarget) * 100;

  return (
    <div className="space-y-6 pb-12">
      <div className={`rounded-[48px] p-8 shadow-2xl border relative overflow-hidden transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-pink-50'}`}>
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32 opacity-10 blur-3xl ${isDarkMode ? 'bg-pink-400' : 'bg-pink-500'}`}></div>
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="relative group">
            <div className={`w-36 h-36 rounded-[44px] border-4 p-1 overflow-hidden shadow-2xl transition-all ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-white bg-pink-50'}`}>
              {editedUser.profileImage ? (
                <img src={editedUser.profileImage} className="w-full h-full object-cover rounded-[38px]" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-pink-600">
                  <UserIcon size={48} />
                </div>
              )}
            </div>
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-pink-600/60 rounded-[44px] flex flex-col items-center justify-center text-white font-black text-[10px] uppercase tracking-widest backdrop-blur-sm"
              >
                <Upload size={24} className="mb-1" /> Change
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>
          <div className="text-center">
            <h2 className={`text-2xl font-black italic tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{user.name}</h2>
            <p className="text-xs font-black text-pink-600 tracking-[0.3em] uppercase mt-1">{user.idNumber}</p>
          </div>
        </div>
      </div>

      <div className={`rounded-[40px] p-8 shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-pink-50'}`}>
        <div className="flex justify-between items-center mb-10">
          <h3 className="font-black text-xs uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3">
            <Briefcase size={18} className="text-pink-600" /> Business Lifecycle
          </h3>
          <button onClick={() => { if(isEditing) handleSave(); else setIsEditing(true); }} className="text-[10px] font-black uppercase tracking-widest px-5 py-3 bg-pink-600 text-white rounded-2xl shadow-xl shadow-pink-200 active:scale-95 transition-all">
            {isEditing ? 'COMMIT UPDATES' : 'EDIT PROFILE'}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="NAME" value={editedUser.name} onChange={v => setEditedUser({...editedUser, name: v})} isDarkMode={isDarkMode} />
              <InputField label="MOBILE" value={editedUser.mobile} onChange={v => setEditedUser({...editedUser, mobile: v})} isDarkMode={isDarkMode} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="MI ID" value={editedUser.idNumber} onChange={v => setEditedUser({...editedUser, idNumber: v})} isDarkMode={isDarkMode} />
              <InputField label="INVESTMENT (₹)" type="number" value={editedUser.investedAmount} onChange={v => setEditedUser({...editedUser, investedAmount: Number(v)})} isDarkMode={isDarkMode} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="PROFIT TARGET (₹)" type="number" value={editedUser.salesTarget} onChange={v => setEditedUser({...editedUser, salesTarget: Number(v)})} isDarkMode={isDarkMode} />
              <InputField label="SLOGAN" value={editedUser.motivationLogo || ''} onChange={v => setEditedUser({...editedUser, motivationLogo: v})} isDarkMode={isDarkMode} />
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
               <LifecycleItem label="Total Invested" val={`₹${lifecycleSummary.invested.toLocaleString()}`} icon={<Wallet size={12}/>} isDarkMode={isDarkMode} />
               <LifecycleItem label="Purchased" val={`₹${lifecycleSummary.purchased.toLocaleString()}`} icon={<ShoppingCart size={12}/>} isDarkMode={isDarkMode} />
               <LifecycleItem label="Sold" val={`₹${lifecycleSummary.soldAmt.toLocaleString()}`} icon={<TrendingUp size={12}/>} isDarkMode={isDarkMode} />
               <LifecycleItem label="Personal" val={`₹${lifecycleSummary.personalAmt.toLocaleString()}`} icon={<UserIcon size={12}/>} isDarkMode={isDarkMode} />
               <LifecycleItem label="Profit Realized" val={`₹${lifecycleSummary.profitRealized.toLocaleString()}`} highlight isDarkMode={isDarkMode} />
               <LifecycleItem label="Profit Foregone" val={`₹${lifecycleSummary.profitForegone.toLocaleString()}`} icon={<MinusCircle size={12}/>} color="text-red-500" isDarkMode={isDarkMode} />
            </div>

            <div className="space-y-4 pt-6 border-t dark:border-slate-700">
              <div className="flex justify-between items-end px-1">
                <span className="text-[10px] font-black uppercase text-slate-400">Profit Realization Reach</span>
                <span className="text-sm font-black text-pink-600 italic">{achievement.toFixed(1)}% REACHED</span>
              </div>
              <div className={`h-4 rounded-full overflow-hidden p-1 ${isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-pink-50 border border-pink-100'}`}>
                <div className="h-full bg-pink-600 rounded-full shadow-lg transition-all duration-1000" style={{ width: `${Math.min(100, achievement)}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`rounded-[40px] p-8 shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-pink-50'}`}>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h3 className="font-black text-xs uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3">
            <Calendar size={18} className="text-pink-600" /> Business Lifecycle Log
          </h3>
          <div className="flex gap-2">
            <button onClick={handleExportCSVHistory} className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-pink-200">
              <FileSpreadsheet size={14} /> Print CSV
            </button>
            <button onClick={() => window.print()} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-colors ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
               Print Report
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] report-font">
            <thead>
              <tr className="border-b-4 border-slate-950 text-slate-950 font-bold uppercase dark:text-pink-600">
                <th className="py-4 px-2 bg-slate-100 dark:bg-slate-900/50">Date</th>
                <th className="py-4 px-2 bg-slate-100 dark:bg-slate-900/50">Invested</th>
                <th className="py-4 px-2 bg-slate-100 dark:bg-slate-900/50">Purchased</th>
                <th className="py-4 px-2 bg-slate-100 dark:bg-slate-900/50">Sold</th>
                <th className="py-4 px-2 bg-slate-100 dark:bg-slate-900/50">Personal</th>
                <th className="py-4 px-2 bg-slate-100 dark:bg-slate-900/50">Profit Realized</th>
                <th className="py-4 px-2 bg-slate-100 dark:bg-slate-900/50">Profit Foregone</th>
              </tr>
            </thead>
            <tbody className={`divide-y-2 ${isDarkMode ? 'divide-slate-700' : 'divide-slate-300'} font-medium`}>
              {lifecycleHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic uppercase tracking-widest">No transaction data yet</td>
                </tr>
              ) : (
                lifecycleHistory.map((row, i) => (
                  <tr key={i} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>
                    <td className="py-4 px-2 font-black whitespace-nowrap">{row.date}</td>
                    <td className="py-4 px-2 font-bold">₹{user.investedAmount.toLocaleString()}</td>
                    <td className="py-4 px-2 font-bold">₹{row.purchased.toLocaleString()}</td>
                    <td className="py-4 px-2 font-bold">₹{row.sold.toLocaleString()}</td>
                    <td className="py-4 px-2 font-bold">₹{row.personal.toLocaleString()}</td>
                    <td className="py-4 px-2 text-green-600 font-black">₹{row.profitRealized.toLocaleString()}</td>
                    <td className="py-4 px-2 text-red-600 font-black">₹{row.profitForegone.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, value, onChange, type = "text", isDarkMode }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} className={`w-full p-4 rounded-2xl font-black text-sm focus:ring-4 focus:ring-pink-500/10 outline-none transition-all ${isDarkMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-100 text-slate-900'}`} />
  </div>
);

const LifecycleItem = ({ label, val, highlight, icon, color, isDarkMode }: any) => (
  <div className={`p-5 rounded-[32px] border transition-all transform hover:scale-[1.02] ${highlight ? 'bg-pink-600 border-none shadow-2xl shadow-pink-300' : isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
    <div className="flex items-center gap-1.5 mb-2">
        <span className={highlight ? 'text-pink-100' : 'text-pink-600'}>{icon}</span>
        <p className={`text-[8px] font-black uppercase tracking-widest leading-none ${highlight ? 'text-pink-100' : 'text-slate-400'}`}>{label}</p>
    </div>
    <p className={`text-sm font-black italic ${highlight ? 'text-white' : color || (isDarkMode ? 'text-slate-100' : 'text-slate-950')}`}>{val}</p>
  </div>
);

export default UserAccount;
