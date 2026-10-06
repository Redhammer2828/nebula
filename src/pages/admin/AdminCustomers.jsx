const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { Users, Mail, Phone, ShoppingBag, Search } from 'lucide-react';

import { formatPrice, formatDate } from '@/lib/shop-utils';

export default function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [u, o] = await Promise.all([
        db.entities.User.list(),
        db.entities.Order.list('-created_date', 200),
      ]);
      setUsers(u);
      setOrders(o);
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  const getCustomerStats = (userId) => {
    const userOrders = orders.filter(o => o.user_id === userId);
    return {
      orderCount: userOrders.length,
      totalSpent: userOrders.reduce((s, o) => s + (o.total || 0), 0),
      orders: userOrders.slice(0, 5),
    };
  };

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Customers ({users.length})</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
      </div>

      {loading ? <div className="text-center py-8 text-sm text-muted-foreground">Loading customers...</div> : (
        <div className="grid lg:grid-cols-2 gap-4">
          {filtered.map(u => {
            const stats = getCustomerStats(u.id);
            return (
              <div key={u.id} className="nebula-card p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full nebula-gradient flex items-center justify-center text-lg font-bold text-white">
                    {u.full_name?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{u.full_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1"><Mail className="w-3 h-3" /> {u.email}</p>
                    {u.role === 'admin' && <span className="text-[10px] px-2 py-0.5 rounded-full nebula-gradient text-white mt-1 inline-block">Admin</span>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="text-lg font-bold">{stats.orderCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                    <p className="text-lg font-bold">{formatPrice(stats.totalSpent)}</p>
                  </div>
                </div>
                {stats.orders.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border space-y-1">
                    <p className="text-xs text-muted-foreground mb-2">Recent Orders</p>
                    {stats.orders.map(o => (
                      <div key={o.id} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{o.order_number}</span>
                        <span className="font-medium">{formatPrice(o.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}