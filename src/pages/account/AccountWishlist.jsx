import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, X } from 'lucide-react';
import { useStore } from '@/lib/StoreContext';
import { formatPrice, calculateDiscount } from '@/lib/shop-utils';
import { EmptyState } from '@/components/Skeletons';

export default function AccountWishlist() {
  const { wishlist, removeFromWishlist, moveToCart } = useStore();

  if (wishlist.length === 0) {
    return <EmptyState icon={Heart} title="No Stars Saved Yet" description="Save your favorite products to revisit them later." action={<Link to="/shop" className="btn-cosmic px-8 py-3.5 rounded-full text-sm font-semibold">Discover Products</Link>} />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Wishlist ({wishlist.length})</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {wishlist.map(item => {
          const discount = calculateDiscount(item.product_price, item.product_sale_price);
          return (
            <div key={item.product_id} className="nebula-card p-4 flex gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-background-secondary flex-shrink-0">
                {item.product_image && <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />}
              </div>
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