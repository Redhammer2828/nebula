const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, Clock, Trash2 } from 'lucide-react';

import { formatPrice } from '@/lib/shop-utils';

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const popularSearches = ['Galaxy Runner', 'Nebula Watch', 'Cosmic Jacket', 'Starlight Earbuds', 'Aurora Backpack'];

  useEffect(() => {
    const saved = localStorage.getItem('nebula_recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);
        try {
          const products = await db.entities.Product.list('-updated_date', 50);
          const filtered = products.filter(p =>
            p.name?.toLowerCase().includes(query.toLowerCase()) ||
            p.category_name?.toLowerCase().includes(query.toLowerCase()) ||
            p.brand_name?.toLowerCase().includes(query.toLowerCase()) ||
            p.description?.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 6);
          setResults(filtered);
        } catch (e) {
          setResults([]);
        }
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  const saveSearch = (term) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('nebula_recent_searches', JSON.stringify(updated));
  };

  const handleSearch = (term) => {
    const q = term || query;
    if (!q.trim()) return;
    saveSearch(q);
    onClose();
    navigate(`/shop?q=${encodeURIComponent(q)}`);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('nebula_recent_searches');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl glass-strong rounded-2xl overflow-hidden animate-scale-in">
        {/* Search bar */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search the galaxy..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-lg"
          />
          <button onClick={onClose} className="p-2 rounded-full hover:bg-foreground/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-4">
          {query.trim().length > 1 ? (
            loading ? (
              <div className="py-8 text-center text-muted-foreground text-sm">Searching the cosmos...</div>
            ) : results.length > 0 ? (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Suggested Products</p>
                <div className="space-y-2">
                  {results.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { onClose(); navigate(`/product/${p.slug}`); }}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-foreground/5 transition-colors text-left"
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-background-secondary flex-shrink-0">
                        {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.category_name}</p>
                      </div>
                      <span className="text-sm font-bold text-foreground">{formatPrice(p.sale_price || p.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground text-sm mb-1">No Products Found in This Galaxy</p>
                <p className="text-xs text-muted-foreground">Try a different search term</p>
              </div>
            )
          ) : (
            <div className="space-y-6">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> Recent Searches
                    </p>
                    <button onClick={clearRecent} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map(s => (
                      <button key={s} onClick={() => handleSearch(s)} className="px-3 py-1.5 rounded-full glass text-sm text-foreground hover:border-primary/30 transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
                  <TrendingUp className="w-3.5 h-3.5" /> Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map(s => (
                    <button key={s} onClick={() => handleSearch(s)} className="px-3 py-1.5 rounded-full glass text-sm text-foreground hover:border-primary/30 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}