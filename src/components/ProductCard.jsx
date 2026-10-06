import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Star, ShoppingBag } from 'lucide-react';
import { useStore } from '@/lib/StoreContext';
import { formatPrice, calculateDiscount } from '@/lib/shop-utils';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore();
  const inWishlist = isInWishlist(product.id);
  const discount = calculateDiscount(product.price, product.sale_price);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1, product.sizes?.[0] || null, product.colors?.[0] || null);
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="nebula-card group relative flex flex-col overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-background-secondary">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ShoppingBag className="w-12 h-12 opacity-30" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full nebula-gradient text-white">
              {discount}% OFF
            </span>
          )}
          {product.is_new && (
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full glass text-accent">
              NEW
            </span>
          )}
          {product.is_best_seller && (
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full glass text-foreground">
              BESTSELLER
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className="absolute top-3 right-3 w-9 h-9 rounded-full glass flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-primary text-primary' : 'text-foreground'}`} />
        </button>

        {/* Quick view */}
        {onQuickView && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(product); }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full glass-strong text-xs font-medium flex items-center gap-2 hover:nebula-gradient hover:text-white transition-all animate-fade-in-up"
          >
            <Eye className="w-3.5 h-3.5" /> Quick View
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{product.category_name}</span>
        <h3 className="text-sm font-medium text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-muted-foreground">{product.rating.toFixed(1)} ({product.reviews_count || 0})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-base font-bold text-foreground">
            {formatPrice(product.sale_price || product.price)}
          </span>
          {product.sale_price && product.sale_price < product.price && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="mt-3 w-full py-2.5 rounded-xl text-xs font-semibold border border-border hover:nebula-gradient hover:border-transparent hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-3.5 h-3.5" /> {product.stock <= 0 ? 'Sold out' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
