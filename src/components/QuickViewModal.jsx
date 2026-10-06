import React, { useState } from 'react';
import { X, Star, ShoppingBag, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '@/lib/StoreContext';
import { formatPrice, calculateDiscount } from '@/lib/shop-utils';

export default function QuickViewModal({ product, onClose }) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore();
  const [size, setSize] = useState(product?.sizes?.[0] || null);
  const [color, setColor] = useState(product?.colors?.[0] || null);
  const [qty, setQty] = useState(1);

  if (!product) return null;
  const inWishlist = isInWishlist(product.id);
  const discount = calculateDiscount(product.price, product.sale_price);

  const handleAddToCart = () => {
    addToCart(product, qty, size, color);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-3xl glass-strong rounded-2xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-foreground/10">
          <X className="w-4 h-4" />
        </button>
        <div className="grid md:grid-cols-2 gap-0">
          <div className="aspect-square bg-background-secondary">
            {product.images?.[0] && (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="p-6 flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{product.category_name}</span>
            <h2 className="text-xl font-bold font-heading mb-3">{product.name}</h2>
            {product.rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-4 h-4 ${i <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">({product.reviews_count || 0} reviews)</span>
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold">{formatPrice(product.sale_price || product.price)}</span>
              {discount > 0 && <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>}
              {discount > 0 && <span className="px-2 py-0.5 text-xs font-bold rounded-full nebula-gradient text-white">{discount}% OFF</span>}
            </div>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{product.short_description || product.description}</p>

            {product.sizes?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map(s => (
                    <button key={s} onClick={() => setSize(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${size === s ? 'nebula-gradient text-white border-transparent' : 'glass border-border'}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            {product.colors?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Color</p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map(c => (
                    <button key={c} onClick={() => setColor(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${color === c ? 'nebula-gradient text-white border-transparent' : 'glass border-border'}`}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center border border-border rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-muted-foreground hover:text-foreground">−</button>
                <span className="px-3 text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-muted-foreground hover:text-foreground">+</button>
              </div>
              <button onClick={handleAddToCart} className="btn-cosmic flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
              <button onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product)} className="w-12 h-12 rounded-xl border border-border flex items-center justify-center hover:border-primary/30 transition-colors">
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-primary text-primary' : ''}`} />
              </button>
            </div>
            <Link to={`/product/${product.slug}`} onClick={onClose} className="text-sm text-primary hover:underline text-center">
              View Full Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}