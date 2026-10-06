import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, X } from 'lucide-react';
import { useStore } from '@/lib/StoreContext';
import { formatPrice, calculateDiscount } from '@/lib/shop-utils';
import { EmptyState } from '@/components/Skeletons';

export default function Wishlist() {
  const { wishlist, removeFromWishlist, moveToCart } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold font-heading mb-8">Your Wishlist</h1>
        <EmptyState
          icon={Heart}
          title="No Stars Saved Yet"
          description="Save your favorite products to revisit them later. Tap the heart icon on any product to add it here."
          action={<Link to="/shop" className="btn-cosmic px-8 py-3.5 rounded-full text-sm font-semibold">Discover Products</Link>}
        />
      </div>
    );
  }

  return (
    <div className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <h1 className="text-3xl font-bold font-heading mb-2">Your Wishlist</h1>
      <p className="text-sm text-muted-foreground mb-8">{wishlist.length} items saved</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {wishlist.map(item => {
          const discount = calculateDiscount(item.product_price, item.product_sale_price);
          return (
            <div key={item.product_id} className="nebula-card p-4 flex gap-4 group">
              <Link to={`/product/${item.product_name?.toLowerCase().replace(/\s+/g, '-')}`} className="flex-shrink-0">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-background-secondary">
                  {item.product_image && <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />}
                </div>
              </Link>
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className="text-sm font-medium line-clamp-2">{item.product_name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-base font-bold">{formatPrice(item.product_sale_price || item.product_price)}</span>
                  {discount > 0 && <span className="text-xs text-muted-foreground line-through">{formatPrice(item.product_price)}</span>}
                </div>
                <div className="flex gap-2 mt-auto pt-3">
                  <button onClick={() => moveToCart(item.product_id)} className="flex-1 btn-cosmic py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
                  </button>
                  <button onClick={() => removeFromWishlist(item.product_id)} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:border-destructive/30 hover:text-destructive transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}