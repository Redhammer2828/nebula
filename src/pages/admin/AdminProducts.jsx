const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Search, Package, Archive } from 'lucide-react';

import { useToast } from '@/components/ui/use-toast';
import { formatPrice, slugify } from '@/lib/shop-utils';

const EMPTY_PRODUCT = {
  name: '', slug: '', description: '', short_description: '', price: 0, sale_price: 0,
  images: [], category_name: 'Fashion', brand_name: 'Nebula', sizes: [], colors: [],
  stock: 0, sku: '', specifications: {}, is_featured: false, is_new: false, is_best_seller: false,
  is_sale: false, status: 'active', rating: 0, reviews_count: 0,
};

const CATEGORIES = ['Fashion', 'Electronics', 'Accessories', 'Beauty', 'Home', 'Lifestyle'];
const BRANDS = ['Nebula', 'Cosmos', 'Stellar', 'Lunar', 'Aurora', 'Vortex'];

export default function AdminProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [sizesInput, setSizesInput] = useState('');
  const [colorsInput, setColorsInput] = useState('');
  const [imagesInput, setImagesInput] = useState('');

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const prods = await db.entities.Product.list('-updated_date', 100);
      setProducts(prods);
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { toast({ title: 'Name and price are required', variant: 'destructive' }); return; }
    const data = {
      ...form,
      slug: form.slug || slugify(form.name),
      price: Number(form.price),
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      stock: Number(form.stock),
      sizes: sizesInput.split(',').map(s => s.trim()).filter(Boolean),
      colors: colorsInput.split(',').map(c => c.trim()).filter(Boolean),
      images: imagesInput.split(',').map(i => i.trim()).filter(Boolean),
      is_sale: form.sale_price && form.sale_price < form.price,
    };
    try {
      if (editingId) {
        await db.entities.Product.update(editingId, data);
        toast({ title: '✦ Product Updated' });
      } else {
        await db.entities.Product.create(data);
        toast({ title: '✦ Product Created' });
      }
      loadProducts();
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_PRODUCT);
      setSizesInput(''); setColorsInput(''); setImagesInput('');
    } catch (e) {
      toast({ title: 'Failed to save product', variant: 'destructive' });
    }
  };

  const handleEdit = (p) => {
    setForm({ ...p, sale_price: p.sale_price || 0 });
    setSizesInput(p.sizes?.join(', ') || '');
    setColorsInput(p.colors?.join(', ') || '');
    setImagesInput(p.images?.join(', ') || '');
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await db.entities.Product.delete(id);
      loadProducts();
      toast({ title: 'Product Deleted' });
    } catch (e) {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const toggleStatus = async (p) => {
    const newStatus = p.status === 'active' ? 'archived' : 'active';
    try {
      await db.entities.Product.update(p.id, { status: newStatus });
      loadProducts();
    } catch (e) { /* ignore */ }
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold">Products ({products.length})</h2>
        <button onClick={() => { setForm(EMPTY_PRODUCT); setEditingId(null); setSizesInput(''); setColorsInput(''); setImagesInput(''); setShowForm(true); }} className="btn-cosmic px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
      </div>

      {showForm && (
        <div className="nebula-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{editingId ? 'Edit Product' : 'New Product'}</h3>
            <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-foreground/5"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
            <input placeholder="SKU" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
            <select value={form.category_name} onChange={e => setForm(f => ({ ...f, category_name: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.brand_name} onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none">
              {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <input type="number" placeholder="Price *" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
            <input type="number" placeholder="Sale Price" value={form.sale_price} onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
            <input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none">
              <option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option>
            </select>
            <input placeholder="Sizes (comma separated)" value={sizesInput} onChange={e => setSizesInput(e.target.value)} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
            <input placeholder="Colors (comma separated)" value={colorsInput} onChange={e => setColorsInput(e.target.value)} className="px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
            <textarea placeholder="Image URLs (comma separated)" value={imagesInput} onChange={e => setImagesInput(e.target.value)} rows={2} className="col-span-2 px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50 resize-none" />
            <textarea placeholder="Short Description" value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} rows={2} className="col-span-2 px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50 resize-none" />
            <textarea placeholder="Full Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="col-span-2 px-3 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50 resize-none" />
          </div>
          <div className="flex flex-wrap gap-4">
            {[['is_featured', 'Featured'], ['is_new', 'New Arrival'], ['is_best_seller', 'Best Seller']].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} className="w-4 h-4 accent-primary" />
                {label}
              </label>
            ))}
          </div>
          <button onClick={handleSave} className="btn-cosmic px-6 py-2.5 rounded-xl text-sm font-semibold">{editingId ? 'Update Product' : 'Create Product'}</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-sm text-muted-foreground">Loading products...</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <div key={p.id} className="nebula-card p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-background-secondary flex-shrink-0">
                {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <Package className="w-6 h-6 m-auto mt-4 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span>{p.category_name}</span>
                  <span>•</span>
                  <span>{formatPrice(p.sale_price || p.price)}</span>
                  <span>•</span>
                  <span className={p.stock <= 5 ? 'text-orange-400' : ''}>{p.stock} in stock</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(p)} className="p-2 rounded-lg hover:bg-foreground/5"><Edit2 className="w-4 h-4 text-muted-foreground" /></button>
                <button onClick={() => toggleStatus(p)} className="p-2 rounded-lg hover:bg-foreground/5"><Archive className="w-4 h-4 text-muted-foreground" /></button>
                <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-foreground/5"><Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}