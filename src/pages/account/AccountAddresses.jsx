const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';

import { EmptyState } from '@/components/Skeletons';

const EMPTY_FORM = { full_name: '', phone: '', address_line_1: '', address_line_2: '', city: '', state: '', country: 'India', postal_code: '', address_type: 'Home' };

export default function AccountAddresses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { loadAddresses(); }, [user]);

  const loadAddresses = async () => {
    if (!user) return;
    try {
      const addrs = await db.entities.Address.filter({ user_id: user.id });
      setAddresses(addrs);
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.full_name || !form.phone || !form.address_line_1 || !form.city || !form.state || !form.postal_code) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    try {
      if (editingId) {
        await db.entities.Address.update(editingId, form);
        toast({ title: '✦ Address Updated' });
      } else {
        await db.entities.Address.create({ ...form, user_id: user.id, is_default: addresses.length === 0 });
        toast({ title: '✦ Address Added' });
      }
      loadAddresses();
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (e) {
      toast({ title: 'Failed to save address', variant: 'destructive' });
    }
  };

  const handleEdit = (addr) => {
    setForm({ full_name: addr.full_name, phone: addr.phone, address_line_1: addr.address_line_1, address_line_2: addr.address_line_2 || '', city: addr.city, state: addr.state, country: addr.country, postal_code: addr.postal_code, address_type: addr.address_type });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await db.entities.Address.delete(id);
      loadAddresses();
      toast({ title: 'Address Deleted' });
    } catch (e) {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const setDefault = async (id) => {
    try {
      await db.entities.Address.updateMany({ user_id: user.id }, { $set: { is_default: false } });
      await db.entities.Address.update(id, { is_default: true });
      loadAddresses();
      toast({ title: '✦ Default Address Updated' });
    } catch (e) {
      toast({ title: 'Failed to update default', variant: 'destructive' });
    }
  };

  if (loading) return <div className="nebula-card p-8 text-center text-sm text-muted-foreground">Loading addresses...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Saved Addresses</h2>
        {!showForm && (
          <button onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }} className="btn-cosmic px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

      {showForm && (
        <div className="nebula-card p-6 space-y-3">
          <h3 className="font-medium">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Full Name *" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
            <input placeholder="Phone *" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
            <input placeholder="Address Line 1 *" value={form.address_line_1} onChange={e => setForm(f => ({ ...f, address_line_1: e.target.value }))} className="col-span-2 px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
            <input placeholder="Address Line 2" value={form.address_line_2} onChange={e => setForm(f => ({ ...f, address_line_2: e.target.value }))} className="col-span-2 px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
            <input placeholder="City *" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
            <input placeholder="State *" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
            <input placeholder="Postal Code *" value={form.postal_code} onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
            <select value={form.address_type} onChange={e => setForm(f => ({ ...f, address_type: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none">
              <option value="Home">Home</option><option value="Work">Work</option><option value="Other">Other</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-cosmic px-6 py-2.5 rounded-xl text-sm font-semibold">Save</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-6 py-2.5 rounded-xl border border-border text-sm">Cancel</button>
          </div>
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <EmptyState icon={MapPin} title="No Addresses Saved" description="Add a delivery address to speed up your checkout." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className="nebula-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{addr.full_name}</span>
                  <span className="px-2 py-0.5 text-[10px] rounded-full glass">{addr.address_type}</span>
                  {addr.is_default && <span className="px-2 py-0.5 text-[10px] rounded-full nebula-gradient text-white">Default</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(addr)} className="p-1.5 rounded-lg hover:bg-foreground/5"><Edit2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => handleDelete(addr.id)} className="p-1.5 rounded-lg hover:bg-foreground/5"><Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{addr.address_line_1}{addr.address_line_2 ? `, ${addr.address_line_2}` : ''}</p>
              <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} - {addr.postal_code}</p>
              <p className="text-sm text-muted-foreground">{addr.country}</p>
              <p className="text-sm text-muted-foreground mt-2">📞 {addr.phone}</p>
              {!addr.is_default && <button onClick={() => setDefault(addr.id)} className="mt-3 text-xs text-primary hover:underline">Set as Default</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}