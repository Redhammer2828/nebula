const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Search, ChevronDown, Truck, Check, X, Package } from 'lucide-react';

import { useToast } from '@/components/ui/use-toast';
import { formatPrice, formatDate } from '@/lib/shop-utils';

const STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  placed: 'text-blue-400 bg-blue-400/10', confirmed: 'text-cyan-400 bg-cyan-400/10',
  packed: 'text-purple-400 bg-purple-400/10', shipped: 'text-indigo-400 bg-indigo-400/10',
  out_for_delivery: 'text-accent bg-accent/10', delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
};

export default function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [trackingInput, setTrackingInput] = useState({});

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const ords = await db.entities.Order.list('-created_date', 100);
      setOrders(ords);
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  const updateStatus = async (id, status, trackingNumber) => {
    try {
      const history = [...(orders.find(o => o.id === id)?.status_history || []), { status, date: new Date().toISOString() }];
      const update = { status, status_history: history };
      if (trackingNumber) update.tracking_number = trackingNumber;
      await db.entities.Order.update(id, update);
      loadOrders();
      toast({ title: `✦ Order ${status}` });
    } catch (e) {
      toast({ title: 'Failed to update order', variant: 'destructive' });
    }
  };

  const filtered = orders.filter(o =>
    (filterStatus === 'all' || o.status === filterStatus) &&
    (o.order_number?.toLowerCase().includes(search.toLowerCase()) || o.user_name?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Orders ({orders.length})</h2>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2.5 rounded-xl glass border border-border text-sm outline-none">
          <option value="all">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {loading ? <div className="text-center py-8 text-sm text-muted-foreground">Loading orders...</div> : (
        <div className="space-y-2">
          {filtered.map(o => (
            <div key={o.id} className="nebula-card overflow-hidden">
              <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="w-full p-4 flex items-center justify-between hover:bg-foreground/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><ShoppingBag className="w-4 h-4 text-primary" /></div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">{o.user_name} • {formatDate(o.created_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">{formatPrice(o.total)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[o.status] || ''}`}>{o.status.replace(/_/g, ' ')}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded === o.id ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {expanded === o.id && (
                <div className="border-t border-border p-4 space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    {o.items?.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-background-secondary">{item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}</div>
                        <span className="flex-1">{item.name} (x{item.quantity})</span>
                        <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl glass text-sm">
                    <p className="text-xs text-muted-foreground mb-1">Address</p>
                    <p>{o.address?.full_name}, {o.address?.address_line_1}, {o.address?.city}, {o.address?.state} - {o.address?.postal_code}</p>
                    <p className="text-xs text-muted-foreground mt-1">Payment: {o.payment_method} ({o.payment_status})</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.filter(s => s !== o.status && s !== 'cancelled').map(s => (
                      <button key={s} onClick={() => updateStatus(o.id, s)} className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:border-primary/30 capitalize">
                        Mark {s.replace(/_/g, ' ')}
                      </button>
                    ))}
                    {o.status !== 'cancelled' && (
                      <button onClick={() => updateStatus(o.id, 'cancelled')} className="px-3 py-1.5 rounded-lg border border-destructive/30 text-xs font-medium text-destructive hover:bg-destructive/10">
                        Cancel Order
                      </button>
                    )}
                    <button onClick={() => window.print()} className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium">Print Invoice</button>
                  </div>
                  <div className="flex gap-2">
                    <input placeholder="Tracking number" value={trackingInput[o.id] || o.tracking_number || ''} onChange={e => setTrackingInput(t => ({ ...t, [o.id]: e.target.value }))} className="flex-1 px-3 py-2 rounded-lg glass border border-border text-sm outline-none" />
                    <button onClick={() => updateStatus(o.id, o.status, trackingInput[o.id])} className="px-4 py-2 rounded-lg nebula-gradient text-white text-sm font-medium">Save</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center py-8 text-sm text-muted-foreground">No orders found</p>}
        </div>
      )}
    </div>
  );
}