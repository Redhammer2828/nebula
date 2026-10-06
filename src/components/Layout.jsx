import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import SearchOverlay from '@/components/SearchOverlay';

export default function Layout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const target = document.getElementById(hash.slice(1));
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [pathname, hash]);

  return (
    <div className="min-h-screen relative">

      <Header onSearchOpen={() => setSearchOpen(true)} />
      <main className="relative pb-20 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileNav onSearchOpen={() => setSearchOpen(true)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
