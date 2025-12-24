
import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { Package, Edit3, Trash2, Plus, Search, Image as ImageIcon, X, Upload } from 'lucide-react';
import { CATEGORIES } from '../constants';

interface AdminDashboardProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  isDarkMode: boolean;
  activeTab: 'STOCK' | 'MANAGE';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ products, onUpdateProducts, isDarkMode, activeTab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Delete this product permanently?')) {
      onUpdateProducts(products.filter(p => p.id !== id));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditingProduct(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!editingProduct?.name || !editingProduct?.distributorPrice || !editingProduct?.retailPrice) {
      alert('Missing required fields');
      return;
    }
    if (editingProduct.id) {
      onUpdateProducts(products.map(p => p.id === editingProduct.id ? editingProduct as Product : p));
    } else {
      const newProduct: Product = {
        ...(editingProduct as Omit<Product, 'id'>),
        id: Math.random().toString(36).substr(2, 9),
        status: 'Active',
        stock: editingProduct.stock || 0,
        image: editingProduct.image || `https://picsum.photos/seed/${editingProduct.name}/400/400`
      };
      onUpdateProducts([newProduct, ...products]);
    }
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Filter catalog..."
          className={`w-full border rounded-[20px] py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-4 focus:ring-pink-500/10 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-pink-100 text-slate-900'}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {activeTab === 'STOCK' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className={`rounded-[32px] overflow-hidden shadow-sm border transition-all hover:shadow-2xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-pink-50'}`}>
              <div className="h-48 relative bg-slate-100 dark:bg-slate-900">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-2 right-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white font-black text-[10px]">
                   AVL: {product.stock}
                </div>
              </div>
              <div className="p-6 space-y-3">
                <h3 className={`font-black text-sm h-10 line-clamp-2 leading-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{product.name}</h3>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
                  <p className="font-black text-pink-600 text-lg">₹{product.distributorPrice.toLocaleString()}</p>
                  <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{product.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <button 
            onClick={() => setEditingProduct({ stock: 0 })}
            className={`w-full border-2 border-dashed rounded-[32px] py-12 flex flex-col items-center justify-center gap-3 transition-all ${isDarkMode ? 'border-slate-700 text-slate-500 hover:bg-slate-800' : 'border-pink-200 text-pink-500 hover:bg-pink-50'}`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-700' : 'bg-pink-100'}`}><Plus size={32} /></div>
            <span className="font-black uppercase tracking-[0.2em] text-xs">New Product Registration</span>
          </button>

          <div className={`rounded-[32px] overflow-hidden shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-pink-50'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className={isDarkMode ? 'bg-slate-900' : 'bg-pink-50'}>
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-pink-600 uppercase">Product</th>
                    <th className="px-8 py-5 text-[10px] font-black text-pink-600 uppercase">Pricing & Stock</th>
                    <th className="px-8 py-5 text-[10px] font-black text-pink-600 uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <img src={product.image} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                          <span className={`font-black text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{product.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="text-xs space-y-1">
                          <p className="text-pink-600 font-black">DP: {product.distributorPrice}</p>
                          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Stock: {product.stock}</p>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex justify-center gap-4">
                          <button onClick={() => setEditingProduct(product)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"><Edit3 size={18} /></button>
                          <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40">
          <div className={`relative w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="bg-pink-600 p-8 flex justify-between items-center text-white">
              <h2 className="text-2xl font-black italic">PRODUCT EDITOR</h2>
              <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-white/20 rounded-full"><X size={28} /></button>
            </div>
            <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="flex flex-col items-center gap-4">
                <div className={`w-40 h-40 rounded-[40px] border-4 border-dashed flex items-center justify-center relative group overflow-hidden ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-pink-100 bg-slate-50'}`}>
                  {editingProduct.image ? <img src={editingProduct.image} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-400" size={40} />}
                  <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-pink-600/60 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                    <Upload size={32} /><span className="text-xs font-black mt-2">UPLOAD PHOTO</span>
                  </button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              </div>
              <div className="space-y-4">
                <input placeholder="Product Title" className={`w-full border rounded-2xl py-4 px-6 font-black ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`} value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Dist. Price" className={`w-full border rounded-2xl py-4 px-6 font-black text-pink-600 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`} value={editingProduct.distributorPrice || ''} onChange={e => setEditingProduct({...editingProduct, distributorPrice: Number(e.target.value)})} />
                  <input type="number" placeholder="Retail Price" className={`w-full border rounded-2xl py-4 px-6 font-black ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`} value={editingProduct.retailPrice || ''} onChange={e => setEditingProduct({...editingProduct, retailPrice: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Stock Point Quantity</label>
                  <input type="number" placeholder="Available Stock" className={`w-full border rounded-2xl py-4 px-6 font-black ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`} value={editingProduct.stock || 0} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} />
                </div>
                <select className={`w-full border rounded-2xl py-4 px-6 font-black ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`} value={editingProduct.category || ''} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                  <option value="">Choose Category</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
            <div className="p-8 flex gap-4 bg-slate-50 dark:bg-slate-900/50">
              <button onClick={() => setEditingProduct(null)} className="flex-1 py-4 font-black rounded-2xl text-slate-500 border border-slate-200 dark:border-slate-700 uppercase tracking-widest text-xs">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-4 bg-pink-600 text-white font-black rounded-2xl shadow-xl shadow-pink-200 uppercase tracking-widest text-xs">Save Catalog</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
