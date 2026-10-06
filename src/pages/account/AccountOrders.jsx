const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, XCircle, Download, ChevronDown, RotateCcw } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';

import { formatPrice, formatDate } from '@/lib/shop-utils';
import { EmptyState } from '@/components/Skeletons';

const STATUS_COLORS = {
  placed: 'text-blue-400 bg-blue-400/10',
  confirmed: 'text-cyan-400 bg-cyan-400/10',
  packed: 'text-purple-400 bg-purple-400/10',
  shipped: 'text-indigo-400 bg-indigo-400/10',
  out_for_delivery: 'text-accent bg-accent/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
  returned: 'text-orange-400 bg-orange-400/10',
};

export default function AccountOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const ords = await db.entities.Order.filter({ user_id: user.id });
        setOrders(ords.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      } catch (e) { /* ignore */ }
      setLoading(false);
    })();
  }, [user]);

  const cancelOrder = async (orderId) => {
    try {
      await db.entities.Order.update(orderId, { status: 'cancelled', payment_status: 'refunded' });
      setOrders(ords => ords.map(o => o.id === orderId ? { ...o, status: 'cancelled', payment_status: 'refunded' } : o));
      toast({ title: '✦ Order Cancelled', description: 'Your order has been cancelled.' });
    } catch (e) {
      toast({ title: 'Failed to cancel order', variant: 'destructive' });
    }
  };

  const requestReturn = async (orderId) => {
    try {
      await db.entities.Order.update(orderId, { status: 'returned' });
      setOrders(ords => ords.map(o => o.id === orderId ? { ...o, status: 'returned' } : o));
      toast({ title: '✦ Return Requested', description: 'Your return request has been submitted.' });
    } catch (e) {
      toast({ title: 'Failed to request return', variant: 'destructive' });
    }
  };

  if (loading) return <div className="nebula-card p-8 text-center text-sm text-muted-foreground">Loading your orders...</div>;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No Missions Yet"
        description="You haven't placed any orders yet. Start your cosmic shopping journey!"
        action={<Link to="/shop" className="btn-cosmic px-8 py-3.5 rounded-full text-sm font-semibold">Start Shopping</Link>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Orders</h2>
      {orders.map(order => (
        <div key={order.id} className="nebula-card overflow-hidden">
          <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="w-full p-5 flex items-center justify-between hover:bg-foreground/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold font-heading">{order.order_number}</p>
                <p className="text-xs text-muted-foreground">{formatDate(order.created_date)} • {order.items?.length || 0} items</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold">{formatPrice(order.total)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[order.status] || 'text-muted-foreground'}`}>{order.status.replace(/_/g, ' ')}</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${expanded === order.id ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {expanded === order.id && (
            <div className="border-t border-border p-5 space-y-4 animate-fade-in">
              {/* Items */}
              <div className="space-y-3">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-background-secondary">
                      {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity} {item.size && `• Size: ${item.size}`} {item.color && `• ${item.color}`}</p>
                    </div>
                    <span className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Address */}
              <div className="p-4 rounded-xl glass">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Delivery Address</p>
                <p className="text-sm font-medium">{order.address?.full_name}</p>
                <p className="text-xs text-muted-foreground">{order.address?.address_line_1}, {order.address?.city}, {order.address?.state} - {order.address?.postal_code}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Link to={`/track-order?order=${order.order_number}`} className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:border-primary/30 flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Track
                </Link>
                <button onClick={() => window.print()} className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:border-primary/30 flex items-center gap-2">
                  <Download className="w-4 h-4" /> Invoice
                </button>
                {(order.status === 'placed' || order.status === 'confirmed') && (
                  <button onClick={() => cancelOrder(order.id)} className="px-4 py-2 rounded-xl border border-destructive/30 text-sm font-medium text-destructive hover:bg-destructive/10 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Cancel
                  </button>
                )}
                {order.status === 'delivered' && (
                  <button onClick={() => requestReturn(order.id)} className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:border-primary/30 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" /> Return
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}