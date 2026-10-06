const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Box, Home, MapPin, Clock } from 'lucide-react';

import { formatPrice, formatDate } from '@/lib/shop-utils';
import { EmptyState } from '@/components/Skeletons';

const TIMELINE = [
  { key: 'placed', label: 'Order Placed', icon: CheckCircle },
  { key: 'confirmed', label: 'Confirmed', icon: Package },
  { key: 'packed', label: 'Packed', icon: Box },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const orders = await db.entities.Order.filter({ order_number: orderNumber.toUpperCase() });
      if (orders.length > 0) {
        const o = orders[0];
        if (!email || o.user_email?.toLowerCase() === email.toLowerCase()) {
          setOrder(o);
        } else {
          setOrder(null);
        }
      } else {
        setOrder(null);
      }
    } catch (err) {
      setOrder(null);
    }
    setLoading(false);
  };

  const currentStepIndex = order ? TIMELINE.findIndex(s => s.key === order.status) : -1;

  return (
    <div className="pt-8 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass mb-4">
          <Truck className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold font-heading mb-2">Track Your Order</h1>
        <p className="text-muted-foreground text-sm">Enter your order details to see real-time status</p>
      </div>

      <form onSubmit={handleTrack} className="nebula-card p-6 mb-8">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Order Number *</label>
            <input value={orderNumber} onChange={e => setOrderNumber(e.target.value)} placeholder="e.g. NEBXXXXXX" required className="w-full px-4 py-3 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Email or Phone (optional)</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="For verification" className="w-full px-4 py-3 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-cosmic w-full mt-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? 'Tracking...' : <><Search className="w-4 h-4" /> Track Order</>}
        </button>
      </form>

      {searched && !loading && !order && (
        <EmptyState
          icon={Package}
          title="Order Not Found"
          description="We couldn't find an order with that number. Please check and try again."
        />
      )}

      {order && (
        <div className="nebula-card p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div>
              <p className="text-xs text-muted-foreground">Order</p>
              <p className="text-lg font-bold font-heading">{order.order_number}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold">{formatPrice(order.total)}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-1 mb-8">
            {TIMELINE.map((step, i) => {
              const completed = i <= currentStepIndex;
              const current = i === currentStepIndex;
              return (
                <div key={step.key} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${completed ? 'nebula-gradient text-white' : 'glass border-border'} ${current ? 'ring-2 ring-primary/30 animate-glow-pulse' : ''}`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    {i < TIMELINE.length - 1 && <div className={`w-0.5 h-12 ${i < currentStepIndex ? 'bg-primary' : 'bg-border'}`} />}
                  </div>
                  <div className="pt-2 pb-12">
                    <p className={`text-sm font-medium ${completed ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                    {completed && order.status_history?.find(h => h.status === step.key) && (
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(order.status_history.find(h => h.status === step.key).date)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tracking info */}
          {order.tracking_number && (
            <div className="flex items-center gap-3 p-4 rounded-xl glass mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Tracking Number</p>
                <p className="text-sm font-medium">{order.tracking_number}</p>
              </div>
            </div>
          )}

          {/* Address */}
          <div className="flex items-start gap-3 p-4 rounded-xl glass">
            <MapPin className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Delivery Address</p>
              <p className="text-sm font-medium">{order.address?.full_name}</p>
              <p className="text-xs text-muted-foreground">{order.address?.address_line_1}, {order.address?.city}, {order.address?.state} - {order.address?.postal_code}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}