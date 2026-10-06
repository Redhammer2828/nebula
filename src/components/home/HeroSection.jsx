const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const HERO_IMG = 'https://media.db.com/images/public/6aa934e5da4b3e1b5f0a2b9e/ca811e2a3_generated_96732e60.jpg';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-8">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/8 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-nebula/5 blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="text-center lg:text-left animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Premium Cosmic Collection 2026</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-heading leading-[1.05] tracking-tight text-balance">
              Explore a <span className="gradient-text">Universe</span> of Style
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 leading-relaxed">
              Discover products selected from across the galaxy — curated for your world.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/shop" className="btn-cosmic px-8 py-3.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2">
                Explore Collection <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/shop?filter=new" className="px-8 py-3.5 rounded-full font-semibold text-sm border border-border glass hover:border-primary/30 transition-all flex items-center justify-center gap-2">
                Shop New Arrivals
              </Link>
            </div>
            {/* Stats */}
            <div className="mt-12 flex gap-8 justify-center lg:justify-start">
              {[
                { value: '20+', label: 'Products' },
                { value: '6', label: 'Categories' },
                { value: '4.8★', label: 'Rating' },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-2xl font-bold font-heading gradient-text">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product composition */}
          <div className="relative hidden lg:flex items-center justify-center">
            {/* Orbital rings */}
            <div className="absolute w-[420px] h-[420px] rounded-full border border-primary/10 animate-spin-slow" />
            <div className="absolute w-[340px] h-[340px] rounded-full border border-accent/10 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '40s' }} />
            <div className="absolute w-[260px] h-[260px] rounded-full border border-nebula/10" />

            {/* Glow */}
            <div className="absolute w-80 h-80 rounded-full bg-primary/15 blur-[80px] animate-glow-pulse" />

            {/* Product image */}
            <div className="relative animate-float">
              <img
                src={HERO_IMG}
                alt="Featured cosmic products"
                className="w-[380px] h-[380px] object-cover rounded-3xl glass-strong shadow-2xl"
              />
              {/* Floating badges */}
              <div className="absolute -top-4 -left-4 px-3 py-2 rounded-full glass-strong text-xs font-medium animate-float-slow">
                ✦ New Drop
              </div>
              <div className="absolute -bottom-4 -right-4 px-3 py-2 rounded-full glass-strong text-xs font-medium animate-float-slow" style={{ animationDelay: '1s' }}>
                Free Shipping
              </div>
            </div>

            {/* Orbiting particles */}
            <div className="absolute w-[420px] h-[420px] animate-spin-slow">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary blur-sm" />
              <div className="absolute bottom-0 right-1/4 w-2 h-2 rounded-full bg-accent blur-sm" />
              <div className="absolute top-1/3 right-0 w-2.5 h-2.5 rounded-full bg-nebula blur-sm" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}