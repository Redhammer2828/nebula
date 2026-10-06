const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/Skeletons';

export default function FeaturedProducts({ onQuickView }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await db.entities.Product.list('-updated_date', 50);
        const featured = all.filter(p => p.is_featured && p.status === 'active').slice(0, 8);
        setProducts(featured.length >= 4 ? featured : all.filter(p => p.status === 'active').slice(0, 8));
      } catch (e) {
        setProducts([]);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs text-primary font-medium uppercase tracking-widest mb-3">Featured</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading">Trending in the Universe</h2>
          </div>
          <Link to="/shop" className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onQuickView={onQuickView} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-primary">
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}