const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Tags } from 'lucide-react';

import { useToast } from '@/components/ui/use-toast';
import { slugify } from '@/lib/shop-utils';

const EMPTY_CAT = { name: '', slug: '', description: '', image: '' };

export default function AdminCategories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_CAT);

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      const cats = await db.entities.Category.list('-updated_date', 50);
      setCategories(cats);
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.name) { toast({ title: 'Name is required', variant: 'destructive' }); return; }
    const data = { ...form, slug: form.slug || slugify(form.name) };
    try {
      if (editingId) {
        await db.entities.Category.update(editingId, data);
        toast({ title: '✦ Category Updated' });
      } else {
        await db.entities.Category.create(data);
        toast({ title: '✦ Category Created' });
      }
      loadCategories();
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_CAT);
    } catch (e) {
      toast({ title: 'Failed to save', variant: 'destructive' });
    }
  };

  const handleEdit = (c) => { setForm(c); setEditingId(c.id); setShowForm(true); };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await db.entities.Category.delete(id);
      loadCategories();
      toast({ title: 'Category Deleted' });
    } catch (e) { toast({ title: 'Failed to delete', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Categories ({categories.length})</h2>
        <button onClick={() => { setForm(EMPTY_CAT); setEditingId(null); setShowForm(true); }} className="btn-cosmic px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="nebula-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{editingId ? 'Edit Category' : 'New Category'}</h3>
            <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-foreground/5"><X className="w-4 h-4" /></button>
          </div>
          <input placeholder="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
          <input placeholder="Image URL" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50 resize-none" />
          <button onClick={handleSave} className="btn-cosmic px-6 py-2.5 rounded-xl text-sm font-semibold">{editingId ? 'Update' : 'Create'}</button>
        </div>
      )}

      {loading ? <div className="text-center py-8 text-sm text-muted-foreground">Loading...</div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(c => (
            <div key={c.id} className="nebula-card p-4">
              {c.image && <img src={c.image} alt={c.name} className="w-full h-32 rounded-xl object-cover mb-3" />}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.slug}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-foreground/5"><Edit2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-foreground/5"><Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}