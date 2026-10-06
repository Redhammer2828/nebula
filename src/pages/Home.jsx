import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Headphones, Shirt, Watch, Droplets, Armchair, Compass, Truck, ShieldCheck, Heart, SlidersHorizontal, Play, Sofa, SprayCan, Dumbbell, Gift } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import QuickViewModal from '@/components/QuickViewModal';
import { ProductGridSkeleton } from '@/components/Skeletons';
import { useStore } from '@/lib/StoreContext';
const categories = [{ name: 'Fashion', Icon: Shirt, description: 'Wear your personality' }, { name: 'Electronics', Icon: Headphones, description: 'Tune into your world' }, { name: 'Accessories', Icon: Watch, description: 'The finishing touches' }, { name: 'Beauty', Icon: Droplets, description: 'Everyday care' }, { name: 'Home', Icon: Armchair, description: 'Make space for you' }, { name: 'Lifestyle', Icon: Compass, description: 'Wherever life goes' }];
// Hero shortcuts; labels follow the hero design, slugs map to the store's existing categories.
const heroCategories = [{ label: 'Electronics', slug: 'electronics', Icon: Headphones }, { label: 'Fashion', slug: 'fashion', Icon: Shirt }, { label: 'Home & Living', slug: 'home', Icon: Sofa }, { label: 'Beauty', slug: 'beauty', Icon: SprayCan }, { label: 'Sports', slug: 'lifestyle', Icon: Dumbbell }, { label: 'Gifts', slug: 'accessories', Icon: Gift }];
const edits = { 'Everyday essentials': 'Lifestyle', 'A calmer home': 'Home', 'A fresh look': 'Fashion', 'A thoughtful gift': 'Accessories' };
export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState('All finds');
  const [quickView, setQuickView] = useState(null);
  const [edit, setEdit] = useState('Everyday essentials');
  const [budget, setBudget] = useState('2500');
  const { recentlyViewed, subtotal, shippingThreshold } = useStore();
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const db = globalThis.__B44_DB__;
        const all = db?.entities?.Product?.list ? await db.entities.Product.list('-updated_date', 50) : [];
        if (active) setProducts(all.filter(p => p.status === 'active'));
      } catch { if (active) setError(true); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);
  const selected = products.filter(p => tab === 'All finds' || (tab === 'New arrivals' ? p.is_new : tab === 'Best sellers' ? p.is_best_seller : p.sale_price && p.sale_price < p.price)).slice(0, 4);
  return <div className="store-home">
    <section className="nebula-hero">
      <picture className="nebula-hero-bg">
        <source media="(max-width: 767px)" srcSet="/images/hero-bg-mobile.webp" />
        <img src="/images/hero-bg.webp" alt="Headphones, smartwatch, sneaker and perfume floating through a glowing arch that opens onto a galaxy" fetchPriority="high" width="1774" height="887" />
      </picture>
      <div className="store-container nebula-hero-inner">
        <div className="nebula-hero-copy">
          <span className="nebula-hero-kicker">More than products</span>
          <h1>Everyday<br /><span>Extraordinary</span></h1>
          <p>Curated products for a brighter, simpler you.</p>
          <div className="nebula-hero-actions">
            <Link className="hero-shop" to="/shop">Shop Now <ArrowRight size={22} strokeWidth={1.5} /></Link>
            <a className="hero-story" href="#collections"><span><Play size={18} fill="currentColor" /></span>Watch the story</a>
          </div>
        </div>
        <nav className="nebula-hero-cats" aria-label="Shop by category">
          {heroCategories.map(({ label, slug, Icon }) => (
            <Link key={label} to={`/shop?category=${slug}`}>
              <span><Icon size={26} strokeWidth={1.4} className={Icon === Dumbbell ? 'icon-dumbbell' : undefined} /></span>{label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
    <div className="benefit-strip store-container"><span><Truck size={19} /> Free shipping over ₹999</span><span><ShieldCheck size={19} /> Secure checkout</span><span><Heart size={19} /> Save now, decide later</span><Link to="/track-order">Track your order <ArrowRight size={16} /></Link></div>
    <section className="store-container category-section" id="categories"><div className="section-heading"><h2>A world of little discoveries.</h2><Link to="/shop">Shop everything <ArrowUpRight size={18} /></Link></div><div className="category-rail">{categories.map(({name, Icon, description}) => <Link key={name} to={`/shop?category=${name.toLowerCase()}`} className="category-tile"><div className="category-icon"><Icon size={32} strokeWidth={1.25} /></div><strong>{name}</strong><span>{description}</span></Link>)}</div></section>
    <section className="store-container picks-section"><div className="section-heading"><div><h2>Your next favourite is here.</h2><p>Good design. Useful details. Finds worth a closer look.</p></div><Link to="/shop">View all finds <ArrowUpRight size={18} /></Link></div><div className="find-tabs" role="tablist" aria-label="Product collections">{['All finds', 'New arrivals', 'Best sellers', 'On sale'].map(t => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>{t}</button>)}</div>{loading ? <ProductGridSkeleton count={4} /> : selected.length ? <div className="product-edit-grid">{selected.map(p => <ProductCard key={p.id} product={p} onQuickView={setQuickView} />)}</div> : <div className="catalog-empty"><SlidersHorizontal size={25} /><div><h3>{error ? 'Our finds are taking a moment.' : 'Fresh finds are on their way.'}</h3><p>{error ? 'Please refresh to try loading the collection again.' : 'Explore our categories, or try another collection above.'}</p></div><Link to="/shop">Explore the shop <ArrowRight size={17} /></Link></div>}</section>
    <section className="store-container edit-section" id="collections"><div><span className="edit-kicker">A MORE PERSONAL WAY TO SHOP</span><h2>Find your kind<br />of everyday.</h2><p>A small starting point for your next great find. Tell us what you have in mind.</p></div><div className="edit-form"><p>What are you looking for?</p><div className="edit-options">{Object.keys(edits).map(e => <button key={e} aria-pressed={edit === e} onClick={() => setEdit(e)}>{e}</button>)}</div><label htmlFor="edit-budget">Your budget</label><select id="edit-budget" value={budget} onChange={e => setBudget(e.target.value)}><option value="1000">Under ₹1,000</option><option value="2500">Under ₹2,500</option><option value="5000">Under ₹5,000</option><option value="50000">Show me everything</option></select><Link className="store-button" to={`/shop?category=${edits[edit].toLowerCase()}&maxPrice=${budget}`}>Find my edit <ArrowRight size={18} /></Link></div></section>
    {recentlyViewed.length > 0 && <section className="store-container recent-section"><h2>A second look?</h2><div className="recent-grid">{recentlyViewed.filter(p => p.slug).slice(0, 4).map(p => <Link key={p.id} to={`/product/${p.slug}`}>{p.image && <img src={p.image} alt={p.name} loading="lazy" />}<strong>{p.name}</strong></Link>)}</div></section>}
    {subtotal > 0 && <div className="store-container shipping-note" role="status"><Truck size={20} />{subtotal >= shippingThreshold ? 'Your bag qualifies for free shipping.' : `You’re ₹${Math.ceil(shippingThreshold - subtotal).toLocaleString('en-IN')} away from free shipping.`}<Link to="/cart">View your bag <ArrowRight size={16} /></Link></div>}
    {quickView && <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />}
  </div>;
}

