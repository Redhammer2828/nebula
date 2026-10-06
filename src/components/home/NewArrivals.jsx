const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/Skeletons';

const FILTER_TABS = ['All', 'Fashion', 'Electronics', 'Accessories', 'Lifestyle'];

export default function NewArrivals({ onQuickView }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const scrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const all = await db.entities.Product.list('-created_date', 50);
        const newArrivals = all.filter(p => p.is_new && p.status === 'active');
        setProducts(newArrivals.length >= 4 ? newArrivals : all.filter(p => p.status === 'active').slice(0, 10));
      } catch (e) {
        setProducts([]);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = activeTab === 'All'
    ? products
    : products.filter(p => p.category_name?.toLowerCase() === activeTab.toLowerCase());

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-xs text-primary font-medium uppercase tracking-widest mb-3">Just Landed</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading">New Arrivals</h2>
          <p className="mt-4 text-muted-foreground">Fresh discoveries just entered our orbit.</p>
        </div>

        {/* Filter tabs */}
        <div className="flex justify-center gap-2 mb-10 overflow-x-auto scrollbar-hide pb-2">
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'nebula-gradient text-white'
                  : 'glass text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <ProductGridSkeleton count={5} />
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
          >
            {filtered.map(p => (
              <div key={p.id} className="flex-shrink-0 w-[260px] sm:w-[280px] snap-start">
                <ProductCard product={p} onQuickView={onQuickView} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}