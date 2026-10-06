import React from 'react';
import { Truck, Shield, RefreshCw, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: Truck, title: 'Free Shipping', desc: 'On all orders above ₹999 across the galaxy' },
  { icon: Shield, title: 'Secure Payments', desc: 'Bank-grade encryption for every transaction' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '7-day hassle-free return policy' },
  { icon: Sparkles, title: 'Premium Quality', desc: 'Curated products from across the universe' },
];

export default function WhyNebula() {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs text-primary font-medium uppercase tracking-widest mb-3">Why Choose Us</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading">Why NEBULA</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="nebula-card group p-6 text-center">
              <div className="relative w-14 h-14 mx-auto mb-5">
                <div className="absolute inset-0 rounded-2xl nebula-gradient opacity-10 group-hover:opacity-20 blur-xl transition-opacity" />
                <div className="relative w-14 h-14 rounded-2xl glass flex items-center justify-center group-hover:border-primary/30 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-base font-semibold mb-2">{f.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}