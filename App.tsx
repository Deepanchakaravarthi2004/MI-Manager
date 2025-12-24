
import React, { useState, useEffect } from 'react';
import { UserRole, UserProfile, Product, InventoryItem, Transaction, InventoryStatus } from './types';
import { INITIAL_PRODUCTS, ADMIN_SAMPLE, USER_SAMPLE } from './constants';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import Header from './components/Header';
import NotificationProvider from './components/NotificationProvider';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<{id: string, text: string, time: number, seen: boolean}[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('STOCK');

  useEffect(() => {
    const savedProducts = localStorage.getItem('mi_products');
    const savedInventory = localStorage.getItem('mi_inventory');
    const savedTransactions = localStorage.getItem('mi_transactions');
    const savedUser = localStorage.getItem('mi_user');
    const savedTheme = localStorage.getItem('mi_theme');
    const savedNotifs = localStorage.getItem('mi_notifications');
    const savedRegUsers = localStorage.getItem('mi_registered_users');

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    else setProducts(INITIAL_PRODUCTS);

    if (savedInventory) setInventory(JSON.parse(savedInventory));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedTheme === 'dark') setIsDarkMode(true);
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
    if (savedRegUsers) setRegisteredUsers(JSON.parse(savedRegUsers));
  }, []);

  useEffect(() => { localStorage.setItem('mi_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('mi_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('mi_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('mi_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('mi_registered_users', JSON.stringify(registeredUsers)); }, [registeredUsers]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('mi_user', JSON.stringify(currentUser));
    else localStorage.removeItem('mi_user');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('mi_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const addNotification = (text: string) => {
    const newNotif = { 
      id: Math.random().toString(36).substr(2, 9), 
      text, 
      time: Date.now(),
      seen: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotifsAsSeen = () => {
    setNotifications(prev => prev.map(n => ({ ...n, seen: true })));
  };

  const handleLogin = (credential: string, pass: string, role: UserRole) => {
    const input = credential.trim();
    const p = pass.trim();

    if (role === UserRole.ADMIN) {
      if (input === ADMIN_SAMPLE.mobile && p === ADMIN_SAMPLE.password) {
        setCurrentUser({
          id: 'admin-1',
          name: 'Super Admin',
          mobile: 'Admin System',
          role: UserRole.ADMIN,
          investedAmount: 0,
          spentAmount: 0,
          idNumber: 'ADM-001',
          salesTarget: 0
        });
        setActiveTab('STOCK');
        return;
      }
    } else {
      if ((input === USER_SAMPLE.mobile || input === 'MI-82931') && p === USER_SAMPLE.password) {
        setCurrentUser({
          id: 'user-1',
          name: 'Jane Distributor',
          mobile: USER_SAMPLE.mobile,
          role: UserRole.USER,
          investedAmount: 100000,
          spentAmount: 0,
          idNumber: 'MI-82931',
          salesTarget: 500000,
          profileImage: 'https://i.pravatar.cc/150?u=jane'
        });
        setActiveTab('STOCK');
        return;
      }
      
      const found = registeredUsers.find(u => (u.mobile === input || u.idNumber === input) && u.password === p);
      if (found) {
        setCurrentUser(found);
        setActiveTab('STOCK');
        return;
      }
    }
    alert(`Invalid ${role} credentials.`);
  };

  const handleSignup = (userData: any) => {
    const newUser: UserProfile & { password?: string } = {
      id: Math.random().toString(36).substr(2, 9),
      name: userData.name,
      mobile: userData.mobile,
      role: UserRole.USER,
      investedAmount: Number(userData.investedAmount),
      spentAmount: 0,
      idNumber: userData.idNumber,
      salesTarget: Number(userData.investedAmount) * 5,
      password: userData.password
    };
    
    setRegisteredUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setActiveTab('ACCOUNT');
    addNotification(`Welcome, ${newUser.name}! Check your Account for details.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsSidebarOpen(false);
  };

  const updateProducts = (newProducts: Product[]) => {
    if (products.length < newProducts.length) {
      const added = newProducts.filter(np => !products.find(p => p.id === np.id))[0];
      if (added) {
        addNotification(`New product added: ${added.name} | ${added.stock} | ₹${added.distributorPrice}`);
      }
    } else {
      newProducts.forEach(np => {
        const old = products.find(p => p.id === np.id);
        if (old) {
          if (old.distributorPrice !== np.distributorPrice) {
            addNotification(`New price updated: ${np.name} | ₹${old.distributorPrice} | ₹${np.distributorPrice}`);
          } else if (old.stock !== np.stock && old.stock < np.stock) {
            addNotification(`Stock updated: ${np.name} | ${old.stock} | ${np.stock}`);
          }
        }
      });
    }
    setProducts(newProducts);
  };

  const handlePurchase = (items: {productId: string, quantity: number}[], totalCost: number) => {
    if (!currentUser) return;
    const updatedProducts = products.map(p => {
      const purchased = items.find(item => item.productId === p.id);
      if (purchased) {
        const newStock = Math.max(0, p.stock - purchased.quantity);
        if (newStock < 5) {
          addNotification(`LOW STOCK ALERT: ${p.name} | only ${newStock} units left!`);
        }
        return { ...p, stock: newStock };
      }
      return p;
    });
    setProducts(updatedProducts);
  };

  if (!currentUser) return <Login onLogin={handleLogin} onSignup={handleSignup} isDarkMode={isDarkMode} />;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        role={currentUser.role} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        onLogout={handleLogout}
        user={currentUser}
      />
      
      <Header 
        user={currentUser} 
        notifications={notifications}
        clearNotifications={() => setNotifications([])}
        markNotifsAsSeen={markNotifsAsSeen}
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
        onOpenMenu={() => setIsSidebarOpen(true)}
        onGoToAccount={() => setActiveTab('ACCOUNT')}
      />
      
      <main className="container mx-auto px-4 pb-24 pt-4 max-w-4xl">
        {currentUser.role === UserRole.ADMIN ? (
          <AdminDashboard 
            products={products} 
            onUpdateProducts={updateProducts}
            isDarkMode={isDarkMode}
            activeTab={activeTab as any}
          />
        ) : (
          <UserDashboard 
            user={currentUser}
            setUser={setCurrentUser}
            products={products}
            inventory={inventory}
            setInventory={setInventory}
            transactions={transactions}
            setTransactions={setTransactions}
            isDarkMode={isDarkMode}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            addNotification={addNotification}
            onPurchaseComplete={handlePurchase}
          />
        )}
      </main>
    </div>
  );
};

export default App;
