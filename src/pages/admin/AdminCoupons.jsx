const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Ticket } from 'lucide-react';

import { useToast } from '@/components/ui/use-toast';
import { formatPrice, formatDate } from '@/lib/shop-utils';

const EMPTY_COUPON = { code: '', description: '', discount_type: 'percentage', discount_value: 0, min_order_value: 0, max_discount: 0, expiry_date: '', usage_limit: 100, is_first_order: false, status: 'active' };

export default function AdminCoupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_COUPON);

  useEffect(() => { loadCoupons(); }, []);

  const loadCoupons = async () => {
    try {
      const cps = await db.entities.Coupon.list('-updated_date', 50);
      setCoupons(cps);
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.code || !form.discount_value) { toast({ title: 'Code and discount value required', variant: 'destructive' }); return; }
    const data = { ...form, code: form.code.toUpperCase(), discount_value: Number(form.discount_value), min_order_value: Number(form.min_order_value), max_discount: Number(form.max_discount), usage_limit: Number(form.usage_limit) };
    try {
      if (editingId) {
        await db.entities.Coupon.update(editingId, data);
        toast({ title: '✦ Coupon Updated' });
      } else {
        await db.entities.Coupon.create(data);
        toast({ title: '✦ Coupon Created' });
      }
      loadCoupons();
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_COUPON);
    } catch (e) {
      toast({ title: 'Failed to save coupon', variant: 'destructive' });
    }
  };

  const handleEdit = (c) => { setForm(c); setEditingId(c.id); setShowForm(true); };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await db.entities.Coupon.delete(id);
      loadCoupons();
      toast({ title: 'Coupon Deleted' });
    } catch (e) { toast({ title: 'Failed to delete', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Coupons ({coupons.length})</h2>
        <button onClick={() => { setForm(EMPTY_COUPON); setEditingId(null); setShowForm(true); }} className="btn-cosmic px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {showForm && (
        <div className="nebula-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{editingId ? 'Edit Coupon' : 'New Coupon'}</h3>
            <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-foreground/5"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Code *" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
            <select value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none">
              <option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option>
            </select>
            <input type="number" placeholder="Discount Value *" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
            <input type="number" placeholder="Min Order Value" value={form.min_order_value} onChange={e => setForm(f => ({ ...f, min_order_value: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
            <input type="number" placeholder="Max Discount" value={form.max_discount} onChange={e => setForm(f => ({ ...f, max_discount: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
            <input type="number" placeholder="Usage Limit" value={form.usage_limit} onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
            <input type="date" value={form.expiry_date?.split('T')[0] || ''} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none" />
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none">
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_first_order} onChange={e => setForm(f => ({ ...f, is_first_order: e.target.checked }))} className="w-4 h-4 accent-primary" />
            First Order Only
          </label>
          <button onClick={handleSave} className="btn-cosmic px-6 py-2.5 rounded-xl text-sm font-semibold">{editingId ? 'Update' : 'Create'}</button>
        </div>
      )}

      {loading ? <div className="text-center py-8 text-sm text-muted-foreground">Loading...</div> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {coupons.map(c => (
            <div key={c.id} className="nebula-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl nebula-gradient flex items-center justify-center"><Ticket className="w-5 h-5 text-white" /></div>
                  <div>
                    <p className="text-sm font-bold font-heading">{c.code}</p>
                    <p className="text-xs text-muted-foreground">{c.discount_type === 'percentage' ? `${c.discount_value}% off` : `${formatPrice(c.discount_value)} off`}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-foreground/5"><Edit2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-foreground/5"><Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                {c.min_order_value > 0 && <p>Min order: {formatPrice(c.min_order_value)}</p>}
                {c.expiry_date && <p>Expires: {formatDate(c.expiry_date)}</p>}
                <p>Used: {c.used_count || 0} / {c.usage_limit || '∞'}</p>
                <span className={`px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-green-400/10 text-green-400' : 'bg-muted/10 text-muted-foreground'}`}>{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}