const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';

import { formatPrice, formatDate } from '@/lib/shop-utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0, products: 0, avgOrder: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [orders, products, users] = await Promise.all([
        db.entities.Order.list('-created_date', 100),
        db.entities.Product.list('-updated_date', 100),
        db.entities.User.list(),
      ]);

      const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
      setStats({
        revenue,
        orders: orders.length,
        customers: users.length,
        products: products.length,
        avgOrder: orders.length ? revenue / orders.length : 0,
      });

      setRecentOrders(orders.slice(0, 5));

      const top = products.filter(p => p.reviews_count > 0).sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0)).slice(0, 5);
      setTopProducts(top);

      setLowStock(products.filter(p => p.stock <= 5).slice(0, 5));

      const statusCounts = {};
      orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
      setStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value })));

      // Revenue by day (last 7 days)
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dayStr = d.toDateString();
        const dayOrders = orders.filter(o => new Date(o.created_date).toDateString() === dayStr);
        days.push({ date: d.toLocaleDateString('en-IN', { weekday: 'short' }), revenue: dayOrders.reduce((s, o) => s + (o.total || 0), 0) });
      }
      setRevenueData(days);
    } catch (e) { /* ignore */ }
  };

  const COLORS = ['#7C5CFF', '#0BA5E9', '#B45CFF', '#F59E0B', '#5B6478', '#EF4444'];

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats.revenue), icon: DollarSign, gradient: 'from-primary to-nebula' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, gradient: 'from-accent to-primary' },
    { label: 'Total Customers', value: stats.customers, icon: Users, gradient: 'from-nebula to-accent' },
    { label: 'Total Products', value: stats.products, icon: Package, gradient: 'from-primary to-accent' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="nebula-card p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold font-heading">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Avg order value */}
      <div className="nebula-card p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Average Order Value</p>
          <p className="text-2xl font-bold font-heading">{formatPrice(stats.avgOrder)}</p>
        </div>
        <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Revenue chart */}
      <div className="nebula-card p-6">
        <h3 className="font-semibold mb-4">Revenue (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7C5CFF" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#7C5CFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#5B6478" fontSize={12} />
            <YAxis stroke="#5B6478" fontSize={12} />
            <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid rgba(10,14,26,0.1)', borderRadius: '12px', color: '#0A0E1A' }} />
            <Area type="monotone" dataKey="revenue" stroke="#7C5CFF" fill="url(#revGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Order status distribution */}
        <div className="nebula-card p-6">
          <h3 className="font-semibold mb-4">Order Status Distribution</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid rgba(10,14,26,0.1)', borderRadius: '12px', color: '#0A0E1A' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-muted-foreground text-center py-20">No orders yet</p>}
        </div>

        {/* Low stock */}
        <div className="nebula-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-400" /> Low Stock Products</h3>
          {lowStock.length > 0 ? (
            <div className="space-y-3">
              {lowStock.map(p => (
                <div key={p.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium line-clamp-1">{p.name}</span>
                  <span className={`text-sm font-bold ${p.stock === 0 ? 'text-red-400' : 'text-orange-400'}`}>{p.stock} left</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground text-center py-8">All products well stocked ✦</p>}
        </div>
      </div>

      {/* Recent orders */}
      <div className="nebula-card p-6">
        <h3 className="font-semibold mb-4">Recent Orders</h3>
        {recentOrders.length > 0 ? (
          <div className="space-y-2">
            {recentOrders.map(o => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-foreground/5">
                <div>
                  <p className="text-sm font-medium">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">{o.user_name} • {formatDate(o.created_date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatPrice(o.total)}</p>
                  <span className="text-xs text-muted-foreground capitalize">{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>}
      </div>

      {/* Top products */}
      <div className="nebula-card p-6">
        <h3 className="font-semibold mb-4">Top Products</h3>
        {topProducts.length > 0 ? (
          <div className="space-y-2">
            {topProducts.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/5">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-background-secondary">
                  {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <span className="text-sm font-medium flex-1 line-clamp-1">{p.name}</span>
                <span className="text-sm text-muted-foreground">{p.reviews_count} reviews</span>
                <span className="text-sm font-bold">{formatPrice(p.sale_price || p.price)}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground text-center py-8">No product data yet</p>}
      </div>
    </div>
  );
}