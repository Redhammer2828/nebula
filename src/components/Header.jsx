import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';
import { useStore } from '@/lib/StoreContext';
import { useAuth } from '@/lib/AuthContext';

const NAV = [
  { label: 'Home', to: '/', isActive: (l) => l.pathname === '/' && !l.hash },
  { label: 'Categories', to: '/shop', isActive: (l) => l.pathname.startsWith('/shop') && !/filter=(new|sale)/.test(l.search) },
  { label: 'Deals', to: '/shop?filter=sale', isActive: (l) => l.search.includes('filter=sale') },
  { label: 'New Arrivals', to: '/shop?filter=new', isActive: (l) => l.search.includes('filter=new') },
  { label: 'About', to: '/#about', isActive: (l) => l.hash === '#about' },
];

export default function Header({ onSearchOpen }) {
  const { cartCount } = useStore();
  const { isAuthenticated } = useAuth();
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  const overlay = location.pathname === '/';

  useEffect(() => { setMenu(false); }, [location]);
  // The storefront is light-only; drop any theme saved by the previous design.
  useEffect(() => { delete document.documentElement.dataset.storeTheme; localStorage.removeItem('nebula-theme'); }, []);
  useEffect(() => { const close = e => { if (e.key === 'Escape') setMenu(false); }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, []);

  return (
    <header className={`store-header${overlay ? ' is-overlay' : ''}`}>
      <div className="store-container header-main">
        <Link to="/" className="store-logo" aria-label="Nebula home">
          <img src="/images/nebula-logo.webp" alt="Nebula" width="600" height="119" />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {NAV.map(item => (
            <Link key={item.label} to={item.to} className={item.isActive(location) ? 'active' : undefined} aria-current={item.isActive(location) ? 'page' : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button onClick={onSearchOpen} aria-label="Search products"><Search size={24} strokeWidth={1.5} /></button>
          <Link to={isAuthenticated ? '/account' : '/login'} aria-label="My account" className="desktop-action"><User size={24} strokeWidth={1.5} /></Link>
          <Link to="/cart" className="bag-link" aria-label={`Shopping bag, ${cartCount} items`}>
            <ShoppingBag size={24} strokeWidth={1.5} />
            {cartCount > 0 && <span>{cartCount}</span>}
          </Link>
          <button className="menu-toggle" aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu} onClick={() => setMenu(v => !v)}>{menu ? <X /> : <Menu />}</button>
        </div>
      </div>
      {menu && (
        <nav className="mobile-store-menu" aria-label="Mobile navigation">
          {NAV.map(item => <Link key={item.label} to={item.to}>{item.label}</Link>)}
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/track-order">Track order</Link>
          <Link to={isAuthenticated ? '/account' : '/login'}>My account</Link>
        </nav>
      )}
    </header>
  );
}
