
import React, { useState } from 'react';
import { InventoryItem, InventoryStatus, Product } from '../types';
import { Box, User, ShoppingCart, Info, Download, ArrowRightCircle, PlusCircle, X, Plus, Minus } from 'lucide-react';
import { generateCSV } from '../utils/exportUtils';

interface UserInventoryProps {
  inventory: InventoryItem[];
  setInventory: (items: InventoryItem[]) => void;
  products: Product[];
  searchTerm: string;
  isDarkMode: boolean;
  addNotification: (text: string) => void;
}

const UserInventory: React.FC<UserInventoryProps> = ({ inventory, setInventory, products, searchTerm, isDarkMode, addNotification }) => {
  const [activeSubTab, setActiveSubTab] = useState<InventoryStatus>(InventoryStatus.IN_HAND);
  const [movingItem, setMovingItem] = useState<{ id: string, target: InventoryStatus, qtyToMove: number } | null>(null);
  const [note, setNote] = useState('');

  const filteredItems = inventory.filter(item => {
    const product = products.find(p => p.id === item.productId);
    const matchesSearch = product?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return item.status === activeSubTab && matchesSearch;
  });

  const handleMove = () => {
    if (!movingItem || !note) {
      alert('Please add a mandatory note.');
      return;
    }

    const itemIdx = inventory.findIndex(i => i.id === movingItem.id);
    if (itemIdx === -1) return;

    const originalItem = inventory[itemIdx];
    const product = products.find(p => p.id === originalItem.productId);

    if (movingItem.qtyToMove <= 0) {
      alert('Quantity must be greater than zero.');
      return;
    }

    let newInventory = [...inventory];

    if (movingItem.qtyToMove < originalItem.quantity) {
      // Partial move
      newInventory[itemIdx] = { ...originalItem, quantity: originalItem.quantity - movingItem.qtyToMove };
      newInventory.push({
        id: Math.random().toString(36).substr(2, 9),
        productId: originalItem.productId,
        quantity: movingItem.qtyToMove,
        status: movingItem.target,
        note,
        timestamp: Date.now()
      });
    } else {
      // Full move
      newInventory[itemIdx] = { ...originalItem, status: movingItem.target, note, timestamp: Date.now() };
    }

    setInventory(newInventory);
    addNotification(`Moved ${movingItem.qtyToMove} units of ${product?.name} to ${movingItem.target.replace('_', ' ')}.`);
    setMovingItem(null);
    setNote('');
  };

  const exportData = (format: 'pdf' | 'csv') => {
    const data = filteredItems.map(item => {
      const p = products.find(prod => prod.id === item.productId);
      return {
        Product: p?.name,
        Qty: item.quantity,
        'Dist. Price': p?.distributorPrice,
        'Ret. Price': p?.retailPrice,
        Subtotal: (p?.distributorPrice || 0) * item.quantity,
        Status: item.status,
        Note: item.note || ''
      };
    });
    if (format === 'csv') generateCSV(data, `Inventory_${activeSubTab}.csv`);
    else window.print();
  };

  const adjustMoveQty = (delta: number, max: number) => {
    if (!movingItem) return;
    setMovingItem({
      ...movingItem,
      qtyToMove: Math.min(max, Math.max(1, movingItem.qtyToMove + delta))
    });
  };

  return (
    <div className="space-y-6">
      <div className={`flex p-1 rounded-2xl shadow-sm border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-pink-100'}`}>
        <button 
          onClick={() => setActiveSubTab(InventoryStatus.IN_HAND)}
          className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-xs ${activeSubTab === InventoryStatus.IN_HAND ? 'bg-pink-600 text-white shadow-md' : 'text-slate-500 hover:bg-opacity-10 hover:bg-pink-400'}`}
        >
          <Box size={14} /> In-Hand
        </button>
        <button 
          onClick={() => setActiveSubTab(InventoryStatus.PERSONAL)}
          className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-xs ${activeSubTab === InventoryStatus.PERSONAL ? 'bg-pink-600 text-white shadow-md' : 'text-slate-500 hover:bg-opacity-10 hover:bg-pink-400'}`}
        >
          <User size={14} /> Personal
        </button>
        <button 
          onClick={() => setActiveSubTab(InventoryStatus.SOLD)}
          className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-xs ${activeSubTab === InventoryStatus.SOLD ? 'bg-pink-600 text-white shadow-md' : 'text-slate-500 hover:bg-opacity-10 hover:bg-pink-400'}`}
        >
          <ShoppingCart size={14} /> Sold
        </button>
      </div>

      <div className="flex justify-end gap-3 print:hidden">
        <button onClick={() => exportData('csv')} className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-xl shadow-lg shadow-pink-200 text-xs font-black uppercase tracking-widest"><Download size={14} /> Export CSV</button>
      </div>

      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className={`text-center py-24 rounded-[40px] border-2 border-dashed transition-colors ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-100 text-slate-400 bg-white'}`}>
            <Box size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-bold uppercase tracking-widest">Empty Inventory</p>
          </div>
        ) : (
          filteredItems.map(item => {
            const product = products.find(p => p.id === item.productId);
            return (
              <div key={item.id} className={`rounded-[32px] p-5 shadow-sm border flex items-center gap-5 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-pink-50'}`}>
                <img src={product?.image} className="w-20 h-20 rounded-2xl object-cover shadow-sm" />
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-sm truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{product?.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-700 text-pink-400' : 'bg-pink-50 text-pink-600'}`}>Qty: {item.quantity}</span>
                     <span className="text-[10px] text-slate-400 font-medium">₹{product?.distributorPrice} (DP)</span>
                  </div>
                  {item.note && <p className="text-[10px] text-slate-500 italic mt-2 line-clamp-1 border-l-2 border-pink-500 pl-2">"{item.note}"</p>}
                </div>
                {item.status === InventoryStatus.IN_HAND && (
                  <div className="flex flex-col gap-2 print:hidden">
                    <button 
                      onClick={() => setMovingItem({ id: item.id, target: InventoryStatus.PERSONAL, qtyToMove: item.quantity })}
                      className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-slate-700 text-pink-400 hover:bg-slate-600' : 'bg-pink-50 text-pink-600 hover:bg-pink-100'}`}
                      title="Move to Personal"
                    >
                      <User size={20} />
                    </button>
                    <button 
                      onClick={() => setMovingItem({ id: item.id, target: InventoryStatus.SOLD, qtyToMove: item.quantity })}
                      className="p-3 bg-pink-600 text-white rounded-2xl shadow-lg hover:bg-pink-700"
                      title="Move to Sold"
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {movingItem && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMovingItem(null)}></div>
          <div className={`relative w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden p-8 space-y-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <div>
              <h3 className={`font-black text-lg ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Classify & Move</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                To: {movingItem.target.replace('_', ' ')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-700">
                <span className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Units to Move</span>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => adjustMoveQty(-1, inventory.find(i => i.id === movingItem.id)?.quantity || 1)}
                    className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200"
                  >
                    <Minus size={16} />
                  </button>
                  <span className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{movingItem.qtyToMove}</span>
                  <button 
                    onClick={() => adjustMoveQty(1, inventory.find(i => i.id === movingItem.id)?.quantity || 1)}
                    className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white shadow-lg"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <textarea 
                className={`w-full h-24 border rounded-3xl p-5 text-sm focus:ring-2 focus:ring-pink-500 outline-none resize-none font-medium ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}
                placeholder="Add a mandatory note for this movement..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>

            <button 
              onClick={handleMove}
              className="w-full bg-pink-600 text-white font-black py-4 rounded-3xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
            >
              Update Inventory <ArrowRightCircle size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInventory;
