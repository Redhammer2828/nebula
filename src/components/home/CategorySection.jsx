const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const CATEGORIES = [
  { name: 'Fashion', slug: 'fashion', image: 'https://media.db.com/images/public/6aa934e5da4b3e1b5f0a2b9e/c4b549899_generated_faa4d02b.jpg' },
  { name: 'Electronics', slug: 'electronics', image: 'https://media.db.com/images/public/6aa934e5da4b3e1b5f0a2b9e/ad3bdeb02_generated_27be1c3e.jpg' },
  { name: 'Accessories', slug: 'accessories', image: 'https://media.db.com/images/public/6aa934e5da4b3e1b5f0a2b9e/f52618d31_generated_22a777b6.jpg' },
  { name: 'Beauty', slug: 'beauty', image: 'https://media.db.com/images/public/6aa934e5da4b3e1b5f0a2b9e/b67f8dde2_generated_d0dd03d1.jpg' },
  { name: 'Home', slug: 'home', image: 'https://media.db.com/images/public/6aa934e5da4b3e1b5f0a2b9e/6e10cabad_generated_f2e9aff5.jpg' },
  { name: 'Lifestyle', slug: 'lifestyle', image: 'https://media.db.com/images/public/6aa934e5da4b3e1b5f0a2b9e/01b42dbd7_generated_32fccd20.jpg' },
];

export default function CategorySection() {
  return (
    <section id="categories" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs text-primary font-medium uppercase tracking-widest mb-3">Browse</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading">Explore the Galaxy</h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">Navigate through our cosmic collections and find exactly what your world needs.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat.slug}
              to={`/shop/${cat.slug}`}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden nebula-card"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-500" />

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-lg sm:text-xl font-bold font-heading text-foreground mb-1">{cat.name}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-accent transition-colors">
                  <span>Shop now</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}