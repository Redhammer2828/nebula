const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Heart, MapPin, User, Bell, LogOut, Sparkles, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useStore } from '@/lib/StoreContext';

export default function AccountLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const { wishlist } = useStore();
  const navigate = useNavigate();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadNotifications();
  }, [isAuthenticated, user]);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const notifs = await db.entities.Notification.filter({ user_id: user.id });
      setNotifCount(notifs.filter(n => !n.read).length);
    } catch (e) { /* ignore */ }
  };

  const handleLogout = () => {
    logout(false);
    navigate('/');
  };

  const navItems = [
    { to: '/account', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/account/orders', label: 'My Orders', icon: Package },
    { to: '/account/wishlist', label: 'Wishlist', icon: Heart, badge: wishlist.length },
    { to: '/account/addresses', label: 'Addresses', icon: MapPin },
    { to: '/account/details', label: 'Account Details', icon: User },
    { to: '/account/notifications', label: 'Notifications', icon: Bell, badge: notifCount },
  ];

  return (
    <div className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading">My Account</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back{user?.full_name ? `, ${user.full_name}` : ''}! 👋</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="nebula-card p-4 sticky top-24">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="w-12 h-12 rounded-full nebula-gradient flex items-center justify-center text-lg font-bold text-white">
                {user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'nebula-gradient text-white' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.badge > 0 && <span className="ml-auto px-2 py-0.5 text-[10px] rounded-full bg-primary/20 text-primary">{item.badge}</span>}
                </NavLink>
              ))}
              {user?.role === 'admin' && (
                <NavLink to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-foreground/5 transition-colors">
                  <Sparkles className="w-4 h-4" /> Admin Dashboard
                </NavLink>
              )}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-foreground/5 transition-colors">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
}