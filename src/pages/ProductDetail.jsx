const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Heart, Minus, Plus, Truck, RefreshCw, Shield, ChevronRight, X, Check } from 'lucide-react';

import { useStore } from '@/lib/StoreContext';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice, calculateDiscount, formatDate } from '@/lib/shop-utils';
import ProductCard from '@/components/ProductCard';
import { CosmicLoader, EmptyState } from '@/components/Skeletons';

export default function ProductDetail({ onQuickView }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, addRecentlyViewed } = useStore();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, title: '', description: '' });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const all = await db.entities.Product.list('-updated_date', 100);
        const found = all.find(p => p.slug === slug && p.status === 'active');
        if (found) {
          setProduct(found);
          setSize(found.sizes?.[0] || null);
          setColor(found.colors?.[0] || null);
          addRecentlyViewed(found);
          const related = all.filter(p => p.category_id === found.category_id && p.id !== found.id && p.status === 'active').slice(0, 4);
          setRelatedProducts(related);
          try {
            const revs = await db.entities.Review.filter({ product_id: found.id, status: 'approved' });
            setReviews(revs);
          } catch (e) { setReviews([]); }
        }
      } catch (e) { /* ignore */ }
      setLoading(false);
    })();
  }, [slug]);

  const handleAddToCart = () => {
    addToCart(product, qty, size, color);
    toast({ title: '✦ Added to Cart', description: `${product.name} added to your orbit.` });
  };

  const handleBuyNow = () => {
    addToCart(product, qty, size, color);
    navigate('/cart');
  };

  const handleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({ title: 'Removed from Wishlist' });
    } else {
      addToWishlist(product);
      toast({ title: '✦ Added to Wishlist' });
    }
  };

  const submitReview = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!reviewData.title.trim() || !reviewData.description.trim()) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    try {
      await db.entities.Review.create({
        product_id: product.id,
        product_name: product.name,
        user_id: user.id,
        user_name: user.full_name || user.email,
        rating: reviewData.rating,
        title: reviewData.title,
        description: reviewData.description,
        verified_purchase: false,
        status: 'approved',
      });
      const revs = await db.entities.Review.filter({ product_id: product.id, status: 'approved' });
      setReviews(revs);
      const avgRating = revs.reduce((s, r) => s + r.rating, 0) / revs.length;
      await db.entities.Product.update(product.id, { rating: Math.round(avgRating * 10) / 10, reviews_count: revs.length });
      setProduct({ ...product, rating: Math.round(avgRating * 10) / 10, reviews_count: revs.length });
      setShowReviewForm(false);
      setReviewData({ rating: 5, title: '', description: '' });
      toast({ title: '✦ Review Submitted', description: 'Thank you for your feedback!' });
    } catch (e) {
      toast({ title: 'Failed to submit review', variant: 'destructive' });
    }
  };

  if (loading) return <div className="pt-8"><CosmicLoader /></div>;
  if (!product) return <div className="pt-8"><EmptyState icon={ShoppingBag} title="Product Not Found" description="This product may have drifted out of orbit." action={<Link to="/shop" className="btn-cosmic px-6 py-3 rounded-full text-sm font-semibold">Browse Products</Link>} /></div>;

  const discount = calculateDiscount(product.price, product.sale_price);
  const images = product.images?.length ? product.images : [''];
  const inWishlist = isInWishlist(product.id);

  const ratingDist = [5,4,3,2,1].map(r => ({ star: r, count: reviews.filter(rev => rev.rating === r).length }));

  const tabs = [
    { key: 'description', label: 'Description' },
    { key: 'specifications', label: 'Specifications' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'reviews', label: `Reviews (${reviews.length})` },
    { key: 'returns', label: 'Returns' },
  ];

  return (
    <div className="pt-4 pb-12 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/shop" className="hover:text-foreground">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/shop/${product.category_name?.toLowerCase()}`} className="hover:text-foreground">{product.category_name}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground truncate">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image gallery */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden glass-strong mb-4 group cursor-zoom-in" onClick={() => setFullscreen(true)}>
              {images[activeImage] ? (
                <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ShoppingBag className="w-20 h-20 opacity-20" /></div>
              )}
              {discount > 0 && <span className="absolute top-4 left-4 px-3 py-1.5 text-xs font-bold rounded-full nebula-gradient text-white">{discount}% OFF</span>}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-primary' : 'border-border'}`}>
                    {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            <span className="text-xs text-primary uppercase tracking-wider">{product.category_name}</span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading mt-2 mb-3">{product.name}</h1>

            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />)}
                <span className="ml-2 text-sm text-muted-foreground">{product.rating?.toFixed(1)} ({product.reviews_count || 0})</span>
              </div>
              <span className={`text-sm ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {product.stock > 0 ? `✦ In Stock (${product.stock} left)` : '✦ Out of Stock'}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold">{formatPrice(product.sale_price || product.price)}</span>
              {discount > 0 && <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>}
              {discount > 0 && <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-500/20 text-green-400">Save {formatPrice(product.price - product.sale_price)}</span>}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{product.short_description || product.description}</p>

            {/* Variants */}
            {product.sizes?.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Size {size && <span className="text-muted-foreground">: {size}</span>}</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map(s => (
                    <button key={s} onClick={() => setSize(s)} disabled={product.stock === 0} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all disabled:opacity-50 ${size === s ? 'nebula-gradient text-white border-transparent' : 'glass border-border hover:border-primary/30'}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Color {color && <span className="text-muted-foreground">: {color}</span>}</p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map(c => (
                    <button key={c} onClick={() => setColor(c)} disabled={product.stock === 0} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all disabled:opacity-50 ${color === c ? 'nebula-gradient text-white border-transparent' : 'glass border-border hover:border-primary/30'}`}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + buttons */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-border rounded-xl">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-muted-foreground hover:text-foreground"><Minus className="w-4 h-4" /></button>
                <span className="px-4 text-sm font-medium w-12 text-center">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-4 py-3 text-muted-foreground hover:text-foreground"><Plus className="w-4 h-4" /></button>
              </div>
              <button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 btn-cosmic py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                <ShoppingBag className="w-4 h-4" /> ADD TO CART
              </button>
              <button onClick={handleWishlist} className="w-12 h-12 rounded-xl border border-border flex items-center justify-center hover:border-primary/30 transition-colors flex-shrink-0">
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-primary text-primary' : ''}`} />
              </button>
            </div>
            <button onClick={handleBuyNow} disabled={product.stock === 0} className="w-full py-3.5 rounded-xl font-semibold text-sm border border-primary/30 text-primary hover:bg-primary/10 transition-all disabled:opacity-50 mb-6">
              BUY NOW
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border">
              {[
                { icon: Truck, label: 'Free Shipping', sub: 'Over ₹999' },
                { icon: RefreshCw, label: '7-Day Returns', sub: 'Easy & Free' },
                { icon: Shield, label: 'Secure Payment', sub: '100% Protected' },
              ].map((f, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-1.5">
                  <f.icon className="w-5 h-5 text-primary" />
                  <p className="text-xs font-medium">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground">{f.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex gap-1 border-b border-border overflow-x-auto scrollbar-hide mb-6">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[200px]">
            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">{product.description || 'No description available.'}</p>
              </div>
            )}
            {activeTab === 'specifications' && (
              <div className="space-y-2">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-3 border-b border-border">
                      <span className="text-sm text-muted-foreground">{key}</span>
                      <span className="text-sm font-medium">{String(val)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No specifications available.</p>
                )}
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>✦ Free shipping on all orders above ₹999</p>
                <p>✦ Standard delivery: 3-5 business days</p>
                <p>✦ Express delivery: 1-2 business days (additional charges apply)</p>
                <p>✦ Ships across the entire galaxy</p>
              </div>
            )}
            {activeTab === 'returns' && (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>✦ 7-day easy return policy</p>
                <p>✦ Free returns on eligible products</p>
                <p>✦ Refund processed within 5-7 business days</p>
                <p>✦ Items must be unused and in original packaging</p>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                {/* Rating summary */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="text-center md:text-left">
                    <p className="text-5xl font-bold font-heading">{product.rating?.toFixed(1) || '0.0'}</p>
                    <div className="flex justify-center md:justify-start my-2">
                      {[1,2,3,4,5].map(i => <Star key={i} className={`w-5 h-5 ${i <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />)}
                    </div>
                    <p className="text-sm text-muted-foreground">{reviews.length} reviews</p>
                  </div>
                  <div className="space-y-2">
                    {ratingDist.map(r => (
                      <div key={r.star} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-8">{r.star}★</span>
                        <div className="flex-1 h-2 rounded-full bg-background-secondary overflow-hidden">
                          <div className="h-full nebula-gradient" style={{ width: `${reviews.length ? (r.count / reviews.length) * 100 : 0}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">{r.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={() => isAuthenticated ? setShowReviewForm(!showReviewForm) : navigate('/login')} className="btn-cosmic px-6 py-2.5 rounded-full text-sm font-semibold mb-6">
                  {showReviewForm ? 'Cancel' : 'Write a Review'}
                </button>

                {showReviewForm && (
                  <div className="nebula-card p-6 mb-6 space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Rating</p>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(i => (
                          <button key={i} onClick={() => setReviewData(d => ({ ...d, rating: i }))}>
                            <Star className={`w-6 h-6 ${i <= reviewData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <input value={reviewData.title} onChange={e => setReviewData(d => ({ ...d, title: e.target.value }))} placeholder="Review Title" className="w-full px-4 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50" />
                    <textarea value={reviewData.description} onChange={e => setReviewData(d => ({ ...d, description: e.target.value }))} placeholder="Share your experience..." rows={4} className="w-full px-4 py-2.5 rounded-xl glass border border-border text-sm outline-none focus:border-primary/50 resize-none" />
                    <button onClick={submitReview} className="btn-cosmic px-6 py-2.5 rounded-xl text-sm font-semibold">Submit Review</button>
                  </div>
                )}

                {/* Reviews list */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No reviews yet. Be the first to review!</p>
                  ) : (
                    reviews.map(rev => (
                      <div key={rev.id} className="nebula-card p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full nebula-gradient flex items-center justify-center text-sm font-bold text-white">
                              {rev.user_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{rev.user_name}</p>
                              <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />)}</div>
                            </div>
                          </div>
                          {rev.verified_purchase && <span className="text-xs text-green-400 flex items-center gap-1"><Check className="w-3 h-3" /> Verified Purchase</span>}
                        </div>
                        <p className="text-sm font-medium mt-2">{rev.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{rev.description}</p>
                        <p className="text-xs text-muted-foreground mt-3">{formatDate(rev.created_date)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold font-heading mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView} />)}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen viewer */}
      {fullscreen && (
        <div className="fixed inset-0 z-[90] bg-black/95 flex items-center justify-center p-4" onClick={() => setFullscreen(false)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center"><X className="w-5 h-5" /></button>
          <img src={images[activeImage]} alt={product.name} className="max-w-full max-h-full object-contain rounded-xl" />
        </div>
      )}
    </div>
  );
}