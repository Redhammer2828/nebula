const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const COLLECTION_IMG = 'https://media.db.com/images/public/6aa934e5da4b3e1b5f0a2b9e/d11c1e3a2_generated_03babcac.jpg';

export default function CollectionSection() {
  return (
    <section id="collections" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden group">
          <img
            src={COLLECTION_IMG}
            alt="The Orbit Collection"
            className="w-full h-[400px] sm:h-[500px] lg:h-[600px] object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

          <div className="absolute inset-0 flex items-center">
            <div className="p-8 sm:p-12 lg:p-20 max-w-xl">
              <p className="text-xs text-accent font-medium uppercase tracking-widest mb-4">Featured Collection</p>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold font-heading leading-tight mb-4">
                THE ORBIT<br />COLLECTION
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-md">
                Designed for those who move differently.
              </p>
              <Link to="/shop" className="btn-cosmic inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm">
                Explore Collection <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}