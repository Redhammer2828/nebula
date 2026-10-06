import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Search, Heart, User } from 'lucide-react';
import { useStore } from '@/lib/StoreContext';
import { useAuth } from '@/lib/AuthContext';

export default function MobileNav({ onSearchOpen }) {
  const location = useLocation();
  const { cartCount, wishlist } = useStore();
  const { isAuthenticated } = useAuth();

  const items = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: ShoppingBag, label: 'Shop', path: '/shop' },
    { icon: Search, label: 'Search', path: null, onClick: onSearchOpen },
    { icon: Heart, label: 'Wishlist', path: '/wishlist', badge: wishlist.length },
    { icon: User, label: 'Account', path: isAuthenticated ? '/account' : '/login' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden glass-strong border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const active = item.path && location.pathname === item.path;
          const content = (
            <>
              <item.icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
              {item.badge > 0 && (
                <span className="absolute top-0 right-2 w-4 h-4 text-[9px] font-bold flex items-center justify-center rounded-full nebula-gradient text-white">{item.badge}</span>
              )}
              <span className={`text-[10px] mt-0.5 ${active ? 'text-primary' : 'text-muted-foreground'}`}>{item.label}</span>
            </>
          );
          return item.path ? (
            <Link key={item.label} to={item.path} className="relative flex flex-col items-center justify-center flex-1 py-1.5">
              {content}
            </Link>
          ) : (
            <button key={item.label} onClick={item.onClick} className="relative flex flex-col items-center justify-center flex-1 py-1.5">
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}