import React from 'react';
import { Tag, Gift, Truck } from 'lucide-react';

const OFFERS = [
  { icon: Tag, title: '30% OFF', subtitle: 'Weekend Specials', desc: 'On selected cosmic collections', gradient: 'from-primary to-nebula' },
  { icon: Gift, title: 'BUY 2 GET 1', subtitle: 'Selected Collections', desc: 'Mix & match across categories', gradient: 'from-accent to-primary' },
  { icon: Truck, title: 'FREE SHIPPING', subtitle: 'Orders above ₹999', desc: 'Across the entire galaxy', gradient: 'from-nebula to-accent' },
];

export default function OffersSection() {
  return (
    <section id="offers" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs text-primary font-medium uppercase tracking-widest mb-3">Limited Time</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading">Cosmic Deals</h2>
          <p className="mt-4 text-muted-foreground">Stellar savings orbiting right now.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {OFFERS.map((offer, i) => (
            <div
              key={i}
              className="nebula-card group relative p-8 overflow-hidden"
            >
              {/* Orbital decoration */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full border border-primary/10 group-hover:border-primary/20 transition-colors" />
              <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full border border-accent/10 group-hover:border-accent/20 transition-colors" />

              <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${offer.gradient} flex items-center justify-center mb-6`}>
                <offer.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-1">{offer.title}</h3>
              <p className="text-sm text-accent font-medium mb-2">{offer.subtitle}</p>
              <p className="text-sm text-muted-foreground">{offer.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}