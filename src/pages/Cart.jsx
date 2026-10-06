const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, X, Tag, ArrowRight, Trash2, Heart } from 'lucide-react';
import { useStore } from '@/lib/StoreContext';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice } from '@/lib/shop-utils';
import { EmptyState } from '@/components/Skeletons';

export default function Cart() {
  const { cart, updateCartQuantity, removeFromCart, saveForLater, subtotal, originalSubtotal, productDiscount, shipping, tax, total, coupon, couponDiscount, applyCoupon, removeCoupon, shippingThreshold } = useStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplying(true);
    try {
      const coupons = await db.entities.Coupon.filter({ code: couponCode.toUpperCase(), status: 'active' });
      if (coupons.length === 0) {
        toast({ title: 'Invalid Coupon', description: 'This coupon code is not valid.', variant: 'destructive' });
        setApplying(false);
        return;
      }
      const c = coupons[0];
      if (c.expiry_date && new Date(c.expiry_date) < new Date()) {
        toast({ title: 'Coupon Expired', description: 'This coupon has expired.', variant: 'destructive' });
        setApplying(false);
        return;
      }
      if (subtotal < c.min_order_value) {
        toast({ title: 'Minimum Not Met', description: `Minimum order value is ${formatPrice(c.min_order_value)}.`, variant: 'destructive' });
        setApplying(false);
        return;
      }
      let discount = 0;
      if (c.discount_type === 'percentage') discount = Math.round((subtotal * c.discount_value) / 100);
      else discount = c.discount_value;
      if (c.max_discount && discount > c.max_discount) discount = c.max_discount;
      applyCoupon({ code: c.code, discountAmount: discount, description: c.description });
      toast({ title: '✦ Coupon Applied', description: `You saved ${formatPrice(discount)}!` });
    } catch (e) {
      toast({ title: 'Failed to apply coupon', variant: 'destructive' });
    }
    setApplying(false);
  };

  if (cart.length === 0) {
    return (
      <div className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold font-heading mb-8">Your Cart</h1>
        <EmptyState
          icon={ShoppingBag}
          title="Your Orbit Is Empty"
          description="Discover products from across the galaxy and start your cosmic shopping journey."
          action={<Link to="/shop" className="btn-cosmic px-8 py-3.5 rounded-full text-sm font-semibold">Explore Products</Link>}
        />
      </div>
    );
  }

  return (
    <div className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <h1 className="text-3xl font-bold font-heading mb-8">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, i) => (
            <div key={i} className="nebula-card p-4 flex gap-4">
              <Link to={`/product/${item.slug}`} className="flex-shrink-0">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-background-secondary">
                  {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.slug}`}>
                  <h3 className="text-sm font-medium hover:text-primary transition-colors line-clamp-1">{item.name}</h3>
                </Link>
                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                  {item.size && <span>Size: {item.size}</span>}
                  {item.color && <span>Color: {item.color}</span>}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-base font-bold">{formatPrice(item.price)}</span>
                  {item.original_price > item.price && <span className="text-xs text-muted-foreground line-through">{formatPrice(item.original_price)}</span>}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-border rounded-lg">
                    <button onClick={() => updateCartQuantity(i, item.quantity - 1)} className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="px-3 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(i, item.quantity + 1)} className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                  <button onClick={() => saveForLater(i)} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> Save</button>
                  <button onClick={() => removeFromCart(i)} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            ← Continue Shopping
          </Link>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="nebula-card p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            {/* Coupon */}
            {coupon ? (
              <div className="flex items-center justify-between p-3 rounded-xl glass mb-4">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{coupon.code}</p>
                    <p className="text-xs text-green-400">−{formatPrice(coupon.discountAmount)}</p>
                  </div>
                </div>
                <button onClick={removeCoupon} className="text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="flex gap-2 mb-4">
                <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Coupon code" className="flex-1 px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
                <button onClick={handleApplyCoupon} disabled={applying} className="px-4 py-2.5 rounded-xl nebula-gradient text-white text-sm font-semibold disabled:opacity-50">Apply</button>
              </div>
            )}
            <p className="text-xs text-muted-foreground mb-4">Try: NEBULA10, WELCOME20, STARSALE</p>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(originalSubtotal)}</span></div>
              {productDiscount > 0 && <div className="flex justify-between text-green-400"><span>Product Discount</span><span>−{formatPrice(productDiscount)}</span></div>}
              {couponDiscount > 0 && <div className="flex justify-between text-green-400"><span>Coupon Discount</span><span>−{formatPrice(couponDiscount)}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? <span className="text-green-400">FREE</span> : formatPrice(shipping)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax (5%)</span><span>{formatPrice(tax)}</span></div>
              {shipping > 0 && <p className="text-xs text-muted-foreground">Add {formatPrice(shippingThreshold - subtotal)} more for free shipping</p>}
            </div>

            <div className="h-px bg-border my-4" />
            <div className="flex justify-between text-base font-bold mb-4">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>

            <button onClick={() => navigate('/checkout')} className="btn-cosmic w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
              PROCEED TO CHECKOUT <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}