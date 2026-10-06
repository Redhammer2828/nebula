import React, { useState } from 'react';
import { Mail } from 'lucide-react';

// Placeholder: original file was missing from the Base44 export.
export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="py-20 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="nebula-card p-8 sm:p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl glass flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <p className="text-xs text-primary font-medium uppercase tracking-widest mb-3">Stay in Orbit</p>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-3">Join the Newsletter</h2>
          <p className="text-sm text-muted-foreground mb-8">New arrivals, exclusive offers and cosmic drops, straight to your inbox.</p>
          {submitted ? (
            <p className="text-sm text-primary font-medium">Thanks for subscribing!</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 px-4 py-3 rounded-xl glass text-sm bg-transparent outline-none focus:border-primary/40"
              />
              <button type="submit" className="btn-cosmic px-6 py-3 rounded-xl font-semibold text-sm">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
