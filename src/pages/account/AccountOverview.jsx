const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Heart, MapPin, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useStore } from '@/lib/StoreContext';

import { formatPrice, formatDate } from '@/lib/shop-utils';

export default function AccountOverview() {
  const { user } = useAuth();
  const { wishlist } = useStore();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const ords = await db.entities.Order.filter({ user_id: user.id });
        setOrders(ords.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
        const addrs = await db.entities.Address.filter({ user_id: user.id });
        setAddresses(addrs);
      } catch (e) { /* ignore */ }
    })();
  }, [user]);

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: Package, link: '/account/orders' },
    { label: 'Wishlist Items', value: wishlist.length, icon: Heart, link: '/account/wishlist' },
    { label: 'Saved Addresses', value: addresses.length, icon: MapPin, link: '/account/addresses' },
    { label: 'Total Spent', value: formatPrice(totalSpent), icon: TrendingUp, link: '/account/orders' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome card */}
      <div className="nebula-card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-primary/10 blur-[80px]" />
        <div className="relative">
          <h2 className="text-xl font-bold font-heading mb-1">Welcome to your dashboard ✦</h2>
          <p className="text-sm text-muted-foreground">Manage your orders, wishlist, and account settings all in one place.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Link key={i} to={s.link} className="nebula-card p-5 group">
            <div className="w-10 h-10 rounded-xl glass flex items-center justify-center mb-3 group-hover:border-primary/30 transition-colors">
              <s.icon className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold font-heading">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="nebula-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Orders</h3>
          <Link to="/account/orders" className="text-sm text-primary hover:underline">View All</Link>
        </div>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">No missions yet. Start shopping!</p>
            <Link to="/shop" className="btn-cosmic px-6 py-2.5 rounded-full text-sm font-semibold mt-4 inline-block">Browse Products</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map(o => (
              <Link key={o.id} to="/account/orders" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(o.created_date)} • {o.items?.length || 0} items</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatPrice(o.total)}</p>
                  <p className="text-xs text-muted-foreground capitalize">{o.status}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}