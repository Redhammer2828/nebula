const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, Star, Check } from 'lucide-react';

import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton, EmptyState } from '@/components/Skeletons';
import QuickViewModal from '@/components/QuickViewModal';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'best-selling', label: 'Best Selling' },
];

const CATEGORIES = ['Fashion', 'Electronics', 'Accessories', 'Beauty', 'Home', 'Lifestyle'];
const BRANDS = ['Nebula', 'Cosmos', 'Stellar', 'Lunar', 'Aurora', 'Vortex'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
const COLORS = ['Black', 'White', 'Navy', 'Purple', 'Cyan', 'Silver', 'Gold'];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortDropdown, setSortDropdown] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const onQuickView = setQuickViewProduct;

  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    sizes: [],
    colors: [],
    minPrice: 0,
    maxPrice: 50000,
    minRating: 0,
    inStock: false,
    onSale: false,
  });
  const [sortBy, setSortBy] = useState('featured');

  const categoryParam = searchParams.get('category');
  const queryParam = searchParams.get('q');
  const filterParam = searchParams.get('filter');
  const maxPriceParam = searchParams.get('maxPrice');

  useEffect(() => {
    setFilters(f => ({ ...f, categories: categoryParam ? [categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)] : [] }));
    if (filterParam === 'new') setSortBy('newest');
    if (filterParam === 'best-seller') setSortBy('best-selling');
    setFilters(f => ({ ...f, onSale: filterParam === 'sale', maxPrice: maxPriceParam && Number.isFinite(Number(maxPriceParam)) ? Math.max(0, Math.min(50000, Number(maxPriceParam))) : 50000 }));
  }, [categoryParam, filterParam, maxPriceParam]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const products = await db.entities.Product.list('-updated_date', 100);
        setAllProducts(products.filter(p => p.status === 'active'));
      } catch (e) {
        setAllProducts([]);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let result = [...allProducts];

    if (queryParam) {
      const q = queryParam.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.category_name?.toLowerCase().includes(q) ||
        p.brand_name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    if (filters.categories.length > 0) {
      result = result.filter(p => filters.categories.includes(p.category_name));
    }
    if (filters.brands.length > 0) {
      result = result.filter(p => filters.brands.includes(p.brand_name));
    }
    if (filters.sizes.length > 0) {
      result = result.filter(p => p.sizes?.some(s => filters.sizes.includes(s)));
    }
    if (filters.colors.length > 0) {
      result = result.filter(p => p.colors?.some(c => filters.colors.includes(c)));
    }
    result = result.filter(p => (p.sale_price || p.price) >= filters.minPrice && (p.sale_price || p.price) <= filters.maxPrice);
    if (filters.minRating > 0) result = result.filter(p => p.rating >= filters.minRating);
    if (filters.inStock) result = result.filter(p => p.stock > 0);
    if (filters.onSale) result = result.filter(p => p.is_sale || (p.sale_price && p.sale_price < p.price));

    switch (sortBy) {
      case 'newest': result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)); break;
      case 'price-low': result.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price)); break;
      case 'price-high': result.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price)); break;
      case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'best-selling': result.sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0)); break;
      default: result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }
    return result;
  }, [allProducts, filters, sortBy, queryParam]);

  const toggleArrayFilter = (key, value) => {
    setFilters(f => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter(v => v !== value) : [...f[key], value],
    }));
  };

  const clearFilters = () => {
    setFilters({ categories: [], brands: [], sizes: [], colors: [], minPrice: 0, maxPrice: 50000, minRating: 0, inStock: false, onSale: false });
    setSearchParams({});
  };

  const activeFilterCount = filters.categories.length + filters.brands.length + filters.sizes.length + filters.colors.length + (filters.inStock ? 1 : 0) + (filters.onSale ? 1 : 0) + (filters.minRating > 0 ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6">
      <FilterGroup title="Category">
        {CATEGORIES.map(c => (
          <CheckboxItem key={c} label={c} checked={filters.categories.includes(c)} onChange={() => toggleArrayFilter('categories', c)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Price Range">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input type="number" value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg glass border border-border text-sm" placeholder="Min" />
            <span className="text-muted-foreground">—</span>
            <input type="number" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg glass border border-border text-sm" placeholder="Max" />
          </div>
        </div>
      </FilterGroup>
      <FilterGroup title="Brand">
        {BRANDS.map(b => (
          <CheckboxItem key={b} label={b} checked={filters.brands.includes(b)} onChange={() => toggleArrayFilter('brands', b)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map(s => (
            <button key={s} onClick={() => toggleArrayFilter('sizes', s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filters.sizes.includes(s) ? 'nebula-gradient text-white border-transparent' : 'glass border-border'}`}>{s}</button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Color">
        <div className="flex flex-wrap gap-2">
          {COLORS.map(c => (
            <button key={c} onClick={() => toggleArrayFilter('colors', c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filters.colors.includes(c) ? 'nebula-gradient text-white border-transparent' : 'glass border-border'}`}>{c}</button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Rating">
        {[4, 3, 2, 1].map(r => (
          <button key={r} onClick={() => setFilters(f => ({ ...f, minRating: f.minRating === r ? 0 : r }))} className="flex items-center gap-2 py-1.5 w-full text-left">
            <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} className={`w-3.5 h-3.5 ${i <= r ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />)}</div>
            <span className="text-sm text-muted-foreground">& up</span>
            {filters.minRating === r && <Check className="w-4 h-4 text-primary ml-auto" />}
          </button>
        ))}
      </FilterGroup>
      <FilterGroup title="Availability">
        <CheckboxItem label="In Stock Only" checked={filters.inStock} onChange={() => setFilters(f => ({ ...f, inStock: !f.inStock }))} />
        <CheckboxItem label="On Sale" checked={filters.onSale} onChange={() => setFilters(f => ({ ...f, onSale: !f.onSale }))} />
      </FilterGroup>
      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb + title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Shop</span>
            {categoryParam && <><span>/</span><span className="text-primary">{categoryParam}</span></>}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading">
            {queryParam ? `Results for "${queryParam}"` : categoryParam ? categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1) : 'Shop the Galaxy'}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">{filtered.length} products found</p>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Filters</h2>
                {activeFilterCount > 0 && <span className="text-xs text-primary">{activeFilterCount} active</span>}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setDrawerOpen(true)} className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-border text-sm">
                <SlidersHorizontal className="w-4 h-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
              <div className="relative ml-auto">
                <button onClick={() => setSortDropdown(!sortDropdown)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-border text-sm">
                  Sort: {SORT_OPTIONS.find(s => s.value === sortBy)?.label} <ChevronDown className="w-4 h-4" />
                </button>
                {sortDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 glass-strong rounded-xl p-2 z-20">
                    {SORT_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => { setSortBy(opt.value); setSortDropdown(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 ${sortBy === opt.value ? 'text-primary' : 'text-muted-foreground'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={SlidersHorizontal}
                title="No Products Found in This Galaxy"
                description="Try adjusting your filters or search terms to discover more."
                action={<button onClick={clearFilters} className="btn-cosmic px-6 py-3 rounded-full text-sm font-semibold">Clear Filters</button>}
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filtered.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] glass-strong p-6 overflow-y-auto custom-scrollbar animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-lg">Filters</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-full hover:bg-white/5"><X className="w-5 h-5" /></button>
            </div>
            <FilterContent />
            <button onClick={() => setDrawerOpen(false)} className="btn-cosmic w-full py-3 rounded-xl font-semibold text-sm mt-6">
              Show {filtered.length} Results
            </button>
          </div>
        </div>
      )}

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
}

function FilterGroup({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-border pb-5">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full mb-3">
        <span className="text-sm font-semibold">{title}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && <div className="space-y-1">{children}</div>}
    </div>
  );
}

function CheckboxItem({ label, checked, onChange }) {
  return (
    <button onClick={onChange} className="flex items-center gap-3 py-1.5 w-full text-left group">
      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${checked ? 'nebula-gradient border-transparent' : 'border-border group-hover:border-primary/30'}`}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className={`text-sm ${checked ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{label}</span>
    </button>
  );
}
