
import React, { useState, useMemo } from 'react';
import { UserProfile, Transaction, InventoryItem, Product, InventoryStatus } from '../types';
import { ShoppingCart, User as UserIcon, TrendingUp, AlertCircle, Award, FileSpreadsheet, Filter, Clock, Calendar } from 'lucide-react';
import { generateCSV } from '../utils/exportUtils';

interface UserAnalyticsProps {
  user: UserProfile;
  transactions: Transaction[];
  inventory: InventoryItem[];
  products: Product[];
  isDarkMode: boolean;
}

const UserAnalytics: React.FC<UserAnalyticsProps> = ({ user, transactions, inventory, products, isDarkMode }) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [activeReportTab, setActiveReportTab] = useState<'SOLD' | 'PERSONAL' | 'PURCHASES'>('SOLD');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const date = new Date(tx.timestamp).toISOString().split('T')[0];
      return date >= dateRange.start && date <= dateRange.end;
    });
  }, [transactions, dateRange]);

  const filteredRecords = useMemo(() => {
    const soldItems = inventory.filter(item => {
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      return item.status === InventoryStatus.SOLD && date >= dateRange.start && date <= dateRange.end;
    });

    const personalItems = inventory.filter(item => {
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      return item.status === InventoryStatus.PERSONAL && date >= dateRange.start && date <= dateRange.end;
    });

    return { soldItems, personalItems };
  }, [inventory, dateRange]);

  const reportData = useMemo(() => {
    let totalProfit = 0;
    let totalPersonalLoss = 0;

    const soldRows = filteredRecords.soldItems.map(item => {
      const p = products.find(prod => prod.id === item.productId);
      const cost = (p?.distributorPrice || 0) * item.quantity;
      const retail = (p?.retailPrice || 0) * item.quantity;
      const profit = retail - cost;
      totalProfit += profit;
      return {
        date: new Date(item.timestamp).toLocaleDateString(),
        product: p?.name || 'Unknown',
        qty: item.quantity,
        purchase: cost,
        profit,
      };
    });

    const personalRows = filteredRecords.personalItems.map(item => {
      const p = products.find(prod => prod.id === item.productId);
      const cost = (p?.distributorPrice || 0) * item.quantity;
      const retail = (p?.retailPrice || 0) * item.quantity;
      const lostProfit = retail - cost;
      totalPersonalLoss += lostProfit;
      return {
        date: new Date(item.timestamp).toLocaleDateString(),
        productName: p?.name || 'Unknown',
        qty: item.quantity,
        price: cost,
        minusFromProfit: lostProfit
      };
    });

    const purchaseRows = filteredTransactions.map(tx => ({
      date: new Date(tx.timestamp).toLocaleDateString(),
      id: tx.id,
      items: tx.items.length,
      total: tx.totalDP
    }));

    return { soldRows, personalRows, purchaseRows, totalProfit, totalPersonalLoss };
  }, [filteredRecords, filteredTransactions, products]);

  const handleExportCSVReport = () => {
    let data;
    if (activeReportTab === 'SOLD') data = reportData.soldRows;
    else if (activeReportTab === 'PERSONAL') data = reportData.personalRows;
    else data = reportData.purchaseRows;
    generateCSV(data, `MI_BUSINESS_REPORT_${activeReportTab}.csv`);
  };

  return (
    <div className="space-y-6 pb-12 print:p-0">
      <div className={`p-8 rounded-[40px] border shadow-sm print:hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-pink-50'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-pink-600 flex items-center gap-2">
            <Filter size={16} /> Global Date Range Filter
          </h3>
          <button onClick={handleExportCSVReport} className="flex items-center gap-2 px-5 py-3 bg-pink-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-pink-200 active:scale-95 transition-all">
            <FileSpreadsheet size={16} /> Print CSV Data Report
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
            <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className={`w-full p-4 rounded-2xl font-black text-xs ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`} />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
            <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className={`w-full p-4 rounded-2xl font-black text-xs ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <SummaryCard label="Range Profit" val={`₹${(reportData.totalProfit - reportData.totalPersonalLoss).toLocaleString()}`} icon={<TrendingUp size={14}/>} color="text-green-500" isDarkMode={isDarkMode} />
            <SummaryCard label="Revenue" val={`₹${reportData.soldRows.reduce((a, b) => a + (b as any).purchase + (b as any).profit, 0).toLocaleString()}`} isDarkMode={isDarkMode} />
            <SummaryCard label="Range Spent" val={`₹${reportData.purchaseRows.reduce((a, b) => a + b.total, 0).toLocaleString()}`} icon={<ShoppingCart size={14}/>} isDarkMode={isDarkMode} />
            <SummaryCard label="Loss Impact" val={`-₹${reportData.totalPersonalLoss.toLocaleString()}`} icon={<AlertCircle size={14}/>} color="text-red-500" isDarkMode={isDarkMode} />
        </div>
      </div>

      <div className={`rounded-[40px] border shadow-sm overflow-hidden print:border-none print:shadow-none ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-pink-50'}`}>
        <div className="flex border-b dark:border-slate-700 print:hidden overflow-x-auto">
          <button onClick={() => setActiveReportTab('SOLD')} className={`flex-1 min-w-[120px] py-5 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${activeReportTab === 'SOLD' ? 'bg-pink-600 text-white' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <Award size={16} /> Sales
          </button>
          <button onClick={() => setActiveReportTab('PURCHASES')} className={`flex-1 min-w-[120px] py-5 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${activeReportTab === 'PURCHASES' ? 'bg-pink-600 text-white' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <ShoppingCart size={16} /> Purchase Log
          </button>
          {/* Fixed typo: changed setActiveSubTab to setActiveReportTab */}
          <button onClick={() => setActiveReportTab('PERSONAL')} className={`flex-1 min-w-[120px] py-5 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${activeReportTab === 'PERSONAL' ? 'bg-pink-600 text-white' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <UserIcon size={16} /> Personal
          </button>
        </div>

        <div className="p-8">
          <div className="overflow-x-auto">
            {activeReportTab === 'SOLD' ? (
              <table className="w-full text-left text-xs report-font">
                <thead>
                  <tr className="text-slate-950 dark:text-pink-600 font-black uppercase tracking-widest border-b-2 border-slate-900">
                    <th className="py-4 px-2">Date</th>
                    <th className="py-4 px-2">Product</th>
                    <th className="py-4 px-2">Qty</th>
                    <th className="py-4 px-2">Profit</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-200'}`}>
                  {reportData.soldRows.map((row, i) => (
                    <tr key={i} className="font-bold text-slate-950 dark:text-slate-100">
                      <td className="py-4 px-2">{row.date}</td>
                      <td className="py-4 px-2 truncate max-w-[150px]">{row.product}</td>
                      <td className="py-4 px-2">{row.qty}</td>
                      <td className="py-4 px-2 text-green-500 font-black">+₹{row.profit.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : activeReportTab === 'PURCHASES' ? (
              <table className="w-full text-left text-xs report-font">
                <thead>
                  <tr className="text-slate-950 dark:text-pink-600 font-black uppercase tracking-widest border-b-2 border-slate-900">
                    <th className="py-4 px-2">Date</th>
                    <th className="py-4 px-2">ID</th>
                    <th className="py-4 px-2">Items</th>
                    <th className="py-4 px-2">Total Paid</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-200'}`}>
                  {reportData.purchaseRows.map((row, i) => (
                    <tr key={i} className="font-bold text-slate-950 dark:text-slate-100">
                      <td className="py-4 px-2">{row.date}</td>
                      <td className="py-4 px-2 text-pink-600">{row.id}</td>
                      <td className="py-4 px-2">{row.items}</td>
                      <td className="py-4 px-2 font-black">₹{row.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs report-font">
                <thead>
                  <tr className="text-slate-950 dark:text-pink-600 font-black uppercase tracking-widest border-b-2 border-slate-900">
                    <th className="py-4 px-2">Date</th>
                    <th className="py-4 px-2">Product</th>
                    <th className="py-4 px-2">Qty</th>
                    <th className="py-4 px-2">Value Lost</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-200'}`}>
                  {reportData.personalRows.map((row, i) => (
                    <tr key={i} className="font-bold text-slate-950 dark:text-slate-100">
                      <td className="py-4 px-2">{row.date}</td>
                      <td className="py-4 px-2 truncate max-w-[150px]">{row.productName}</td>
                      <td className="py-4 px-2">{row.qty}</td>
                      <td className="py-4 px-2 text-red-500 font-black">-₹{row.minusFromProfit.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, val, color, icon, isDarkMode }: any) => (
  <div className={`p-4 rounded-3xl border transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
    <div className="flex items-center gap-1 mb-1">
        <span className="text-pink-600">{icon}</span>
        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    </div>
    <p className={`text-sm font-black ${color || (isDarkMode ? 'text-slate-100' : 'text-slate-950')}`}>{val}</p>
  </div>
);

export default UserAnalytics;
