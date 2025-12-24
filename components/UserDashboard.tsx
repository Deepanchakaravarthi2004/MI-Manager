
import React, { useState } from 'react';
import { UserProfile, Product, InventoryItem, Transaction, InventoryStatus } from '../types';
import { Search, CheckCircle2, Download, Plus, Minus, CreditCard, X, FileSpreadsheet } from 'lucide-react';
import UserInventory from './UserInventory';
import UserAnalytics from './UserAnalytics';
import UserAccount from './UserAccount';
import { generateCSV } from '../utils/exportUtils';

interface UserDashboardProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  products: Product[];
  inventory: InventoryItem[];
  setInventory: (items: InventoryItem[]) => void;
  transactions: Transaction[];
  setTransactions: (t: Transaction[]) => void;
  isDarkMode: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  addNotification: (text: string) => void;
  onPurchaseComplete: (items: {productId: string, quantity: number}[], totalCost: number) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ 
  user, setUser, products, inventory, setInventory, transactions, setTransactions, isDarkMode, activeTab, setActiveTab, addNotification, onPurchaseComplete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateCart = (id: string, delta: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      
      if (delta > 0 && next > product.stock) {
        alert(`Only ${product.stock} units available in Live Stock.`);
        return prev;
      }

      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const cartTotalDP = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find(prod => prod.id === id);
    return sum + (p?.distributorPrice || 0) * (qty as number);
  }, 0);

  const handleCheckout = () => {
    if (cartTotalDP > user.investedAmount - user.spentAmount) {
      alert('Balance too low for this purchase.');
      return;
    }

    const transactionId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const billingItems = Object.entries(cart).map(([id, qty]) => ({ productId: id, quantity: qty as number }));
    
    const newTransaction: Transaction = {
      id: transactionId,
      userId: user.id,
      items: billingItems,
      totalDP: cartTotalDP,
      totalRP: Object.entries(cart).reduce((sum, [id, qty]) => {
        const p = products.find(prod => prod.id === id);
        return sum + (p?.retailPrice || 0) * (qty as number);
      }, 0),
      timestamp: Date.now()
    };

    const newInventoryItems: InventoryItem[] = Object.entries(cart).map(([id, qty]) => ({
      id: Math.random().toString(36).substr(2, 9),
      productId: id,
      quantity: qty as number,
      status: InventoryStatus.IN_HAND,
      timestamp: Date.now()
    }));

    setTransactions([newTransaction, ...transactions]);
    setInventory([...newInventoryItems, ...inventory]);
    setUser({ ...user, spentAmount: user.spentAmount + cartTotalDP });
    
    onPurchaseComplete(billingItems, cartTotalDP);
    addNotification(`Order confirmed: ${transactionId} | Total: ₹${cartTotalDP.toLocaleString()}`);
    
    setLastTransaction(newTransaction);
    setCart({});
    setShowCheckout(true);
  };

  const handleExportCSV = () => {
    if (!lastTransaction) return;
    const data = lastTransaction.items.map(item => {
      const p = products.find(prod => prod.id === item.productId);
      return {
        'Product Name': p?.name,
        'Quantity': item.quantity,
        'Unit DP': p?.distributorPrice,
        'Subtotal DP': (p?.distributorPrice || 0) * item.quantity,
        'Unit RP': p?.retailPrice,
        'Subtotal RP': (p?.retailPrice || 0) * item.quantity
      };
    });
    generateCSV(data, `MI_INVOICE_${lastTransaction.id}.csv`);
  };

  return (
    <div className="pb-16 print:pb-0">
      <div className={`relative mb-6 sticky top-[73px] py-2 z-40 transition-colors print:hidden`}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder={`Searching items...`}
          className={`w-full border rounded-[20px] py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-4 focus:ring-pink-500/10 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-pink-100 text-slate-900'}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {activeTab === 'STOCK' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className={`rounded-[32px] overflow-hidden shadow-sm border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-pink-50'} ${product.stock < 5 ? 'ring-4 ring-red-500/30 border-red-200' : ''}`}>
              <div className="relative">
                <img src={product.image} className="w-full h-44 object-cover" />
                <div className={`absolute top-3 right-3 px-3 py-1 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest ${product.stock < 5 ? 'bg-red-600/90 animate-pulse' : 'bg-black/50'}`}>
                  {product.stock < 5 ? 'LOW STOCK: ' : 'Live Point Stock: '} {product.stock}
                </div>
              </div>
              <div className="p-5 space-y-4">
                <h3 className={`font-black text-sm line-clamp-2 h-10 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{product.name}</h3>
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-black px-2 py-1 rounded-lg ${product.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-pink-50 dark:bg-pink-900/20 text-pink-600'}`}>DP: ₹{product.distributorPrice}</span>
                  <span className={isDarkMode ? 'text-slate-400 font-bold' : 'text-slate-500 font-bold'}>RP: ₹{product.retailPrice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'BILLING' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className={`rounded-[28px] overflow-hidden shadow-sm border flex transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-pink-50'} ${product.stock < 5 ? 'border-red-300' : ''}`}>
                <img src={product.image} className="w-24 h-full object-cover" />
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <h3 className={`font-black text-xs leading-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{product.name}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-[10px] font-black ${product.stock < 5 ? 'text-red-600' : 'text-pink-600'}`}>₹{product.distributorPrice} (DP)</p>
                      <p className={`text-[8px] font-bold ${product.stock < 5 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>Stock: {product.stock}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 self-end">
                    <button onClick={() => updateCart(product.id, -1)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'}`}><Minus size={16} /></button>
                    <span className={`font-black text-sm w-4 text-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{cart[product.id] || 0}</span>
                    <button 
                      onClick={() => updateCart(product.id, 1)} 
                      disabled={product.stock <= (cart[product.id] || 0)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all ${product.stock <= (cart[product.id] || 0) ? 'bg-slate-300 cursor-not-allowed' : 'bg-pink-600 text-white'}`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {Object.keys(cart).length > 0 && (
            <div className="fixed bottom-6 inset-x-4 max-w-md mx-auto z-50 animate-bounce-subtle print:hidden">
              <div className="bg-slate-900 dark:bg-pink-600 rounded-[32px] p-6 shadow-2xl text-white">
                <div className="flex justify-between items-center mb-4 px-2">
                  <p className="text-xs font-black uppercase tracking-widest opacity-80">{Object.keys(cart).length} SELECTED</p>
                  <p className="text-2xl font-black italic">₹{cartTotalDP.toLocaleString()}</p>
                </div>
                <button onClick={handleCheckout} className="w-full bg-white text-slate-900 dark:text-pink-600 font-black py-5 rounded-[20px] shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest text-xs">
                  <CreditCard size={18} /> Process Purchase
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'INVENTORY' && <UserInventory inventory={inventory} setInventory={setInventory} products={products} searchTerm={searchTerm} isDarkMode={isDarkMode} addNotification={addNotification} />}
      {activeTab === 'ANALYTICS' && <UserAnalytics user={user} transactions={transactions} inventory={inventory} products={products} isDarkMode={isDarkMode} />}
      {activeTab === 'ACCOUNT' && <UserAccount user={user} setUser={setUser} transactions={transactions} inventory={inventory} products={products} isDarkMode={isDarkMode} />}

      {showCheckout && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className={`relative w-full max-w-sm rounded-[48px] p-8 text-center space-y-4 report-font bg-white shadow-2xl`}>
            <div className="w-20 h-20 bg-green-100 rounded-[32px] flex items-center justify-center text-green-600 mx-auto shadow-inner mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black italic tracking-tight text-slate-950 uppercase">Order Confirmed</h2>
            <p className="text-slate-600 mt-1 text-xs font-bold mb-4 uppercase tracking-widest">Balance updated successfully</p>
            
            <div className="text-left p-6 rounded-3xl bg-slate-50 border-2 border-slate-200">
              <div className="border-b border-slate-300 pb-3 mb-4 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Official Invoice</span>
                <span className="text-[10px] font-bold text-slate-500">#{lastTransaction?.id}</span>
              </div>
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-slate-950 font-black uppercase text-[8px] border-b-2 border-slate-900">
                    <th className="pb-2 text-left border-none bg-transparent">Item</th>
                    <th className="pb-2 text-center border-none bg-transparent">Qty</th>
                    <th className="pb-2 text-right border-none bg-transparent">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-bold">
                  {lastTransaction?.items.map((item, idx) => {
                    const p = products.find(prod => prod.id === item.productId);
                    return (
                      <tr key={idx}>
                        <td className="py-2 text-slate-950 max-w-[120px] truncate">{p?.name}</td>
                        <td className="py-2 text-center text-slate-950">{item.quantity}</td>
                        <td className="py-2 text-right font-black text-slate-950">₹{((p?.distributorPrice || 0) * item.quantity).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 pt-4 border-t-2 border-slate-900 flex justify-between items-center">
                <span className="text-[11px] font-black uppercase text-slate-950">Total Paid (DP)</span>
                <span className="text-xl font-black text-slate-950 italic">₹{lastTransaction?.totalDP.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 pt-4 print:hidden">
              <button onClick={handleExportCSV} className="w-full bg-slate-950 text-white font-black py-5 rounded-[20px] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest text-[10px]">
                <FileSpreadsheet size={18} /> Print CSV Invoice
              </button>
              <button onClick={() => { setShowCheckout(false); setActiveTab('INVENTORY'); }} className="w-full font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors uppercase text-[10px] tracking-widest bg-slate-100 text-slate-600 border border-slate-200">
                Close & View Inventory
              </button>
            </div>

            <button onClick={() => setShowCheckout(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-600 transition-all">
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
