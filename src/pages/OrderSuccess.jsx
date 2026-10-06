const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Rocket, Check, MapPin, CreditCard, Truck, Package } from 'lucide-react';

import { formatPrice, formatDate } from '@/lib/shop-utils';
import { CosmicLoader } from '@/components/Skeletons';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!orderNumber) { navigate('/'); return; }
      try {
        const orders = await db.entities.Order.filter({ order_number: orderNumber });
        if (orders.length > 0) setOrder(orders[0]);
      } catch (e) { /* ignore */ }
      setLoading(false);
    })();
  }, [orderNumber]);

  if (loading) return <div className="pt-8"><CosmicLoader /></div>;

  return (
    <div className="pt-8 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      {/* Animated success */}
      <div className="text-center mb-12">
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full nebula-gradient opacity-20 blur-2xl animate-glow-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-spin-slow" />
          <div className="absolute inset-2 rounded-full border-2 border-accent/20 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
          <div className="relative w-full h-full flex items-center justify-center">
            <Rocket className="w-14 h-14 text-primary animate-float" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-3">Order Successfully Launched 🚀</h1>
        <p className="text-muted-foreground">Your order is now orbiting through our fulfillment galaxy.</p>
      </div>

      {order && (
        <div className="nebula-card p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <p className="text-xs text-muted-foreground">Order ID</p>
              <p className="text-lg font-bold font-heading">{order.order_number}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Order Date</p>
              <p className="text-sm font-medium">{formatDate(order.created_date)}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Order Total</p>
                <p className="text-sm font-bold">{formatPrice(order.total)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Payment Method</p>
                <p className="text-sm font-medium">{order.payment_method}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Delivery Address</p>
                <p className="text-sm font-medium">{order.address?.full_name}</p>
                <p className="text-xs text-muted-foreground">{order.address?.city}, {order.address?.state}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Estimated Delivery</p>
                <p className="text-sm font-medium">{formatDate(order.estimated_delivery)}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Items</p>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-background-secondary">
                    {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
        <Link to="/track-order" className="btn-cosmic px-8 py-3.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2">
          <Truck className="w-4 h-4" /> Track Order
        </Link>
        <Link to="/shop" className="px-8 py-3.5 rounded-full border border-border text-sm font-semibold flex items-center justify-center gap-2 hover:border-primary/30 transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}