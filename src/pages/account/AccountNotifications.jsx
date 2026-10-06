const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { Bell, Check, Trash2, Package, Tag, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

import { formatDate } from '@/lib/shop-utils';
import { EmptyState } from '@/components/Skeletons';

const ICONS = { order_confirmed: Package, offer: Tag, alert: AlertCircle };

export default function AccountNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifications(); }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const notifs = await db.entities.Notification.filter({ user_id: user.id });
      setNotifications(notifs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  const markRead = async (id) => {
    try {
      await db.entities.Notification.update(id, { read: true });
      setNotifications(n => n.map(item => item.id === id ? { ...item, read: true } : item));
    } catch (e) { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await db.entities.Notification.updateMany({ user_id: user.id, read: false }, { $set: { read: true } });
      setNotifications(n => n.map(item => ({ ...item, read: true })));
    } catch (e) { /* ignore */ }
  };

  const deleteNotif = async (id) => {
    try {
      await db.entities.Notification.delete(id);
      setNotifications(n => n.filter(item => item.id !== id));
    } catch (e) { /* ignore */ }
  };

  if (loading) return <div className="nebula-card p-8 text-center text-sm text-muted-foreground">Loading notifications...</div>;

  if (notifications.length === 0) {
    return <EmptyState icon={Bell} title="No Notifications" description="You're all caught up! New notifications will appear here." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Notifications</h2>
        {notifications.some(n => !n.read) && <button onClick={markAllRead} className="text-sm text-primary hover:underline">Mark all as read</button>}
      </div>
      <div className="space-y-3">
        {notifications.map(n => {
          const Icon = ICONS[n.type] || Bell;
          return (
            <div key={n.id} className={`nebula-card p-4 flex items-start gap-3 ${!n.read ? 'border-primary/30' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.read ? 'glass' : 'nebula-gradient'}`}>
                <Icon className={`w-5 h-5 ${n.read ? 'text-muted-foreground' : 'text-white'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(n.created_date)}</p>
              </div>
              <div className="flex gap-1">
                {!n.read && <button onClick={() => markRead(n.id)} className="p-1.5 rounded-lg hover:bg-foreground/5"><Check className="w-3.5 h-3.5 text-muted-foreground" /></button>}
                <button onClick={() => deleteNotif(n.id)} className="p-1.5 rounded-lg hover:bg-foreground/5"><Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}