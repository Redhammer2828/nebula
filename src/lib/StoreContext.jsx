const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { useAuth } from '@/lib/AuthContext';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [coupon, setCoupon] = useState(null);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('nebula_cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { /* ignore */ }
    }
    const savedRecent = localStorage.getItem('nebula_recent');
    if (savedRecent) {
      try { setRecentlyViewed(JSON.parse(savedRecent)); } catch (e) { /* ignore */ }
    }
  }, []);

  // Load wishlist from entity for logged-in users, localStorage for guests
  const loadWishlist = useCallback(async () => {
    if (isAuthenticated && user) {
      try {
        const items = await db.entities.Wishlist.filter({ user_id: user.id });
        setWishlist(items);
      } catch (e) {
        const saved = localStorage.getItem('nebula_wishlist');
        if (saved) setWishlist(JSON.parse(saved));
      }
    } else {
      const saved = localStorage.getItem('nebula_wishlist');
      if (saved) {
        try { setWishlist(JSON.parse(saved)); } catch (e) { /* ignore */ }
      }
    }
  }, [isAuthenticated, user]);

  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('nebula_cart', JSON.stringify(cart));
  }, [cart]);

  // Persist recently viewed
  useEffect(() => {
    localStorage.setItem('nebula_recent', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // Persist wishlist for guests
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('nebula_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  // Cart operations
  const addToCart = useCallback((product, quantity = 1, size = null, color = null) => {
    setCart(prev => {
      const existing = prev.find(item =>
        item.product_id === product.id && item.size === size && item.color === color
      );
      if (existing) {
        return prev.map(item =>
          item === existing ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0] || '',
        price: product.sale_price || product.price,
        original_price: product.price,
        quantity,
        size,
        color,
        stock: product.stock,
      }];
    });
  }, []);

  const updateCartQuantity = useCallback((index, quantity) => {
    setCart(prev => prev.map((item, i) =>
      i === index ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  }, []);

  const removeFromCart = useCallback((index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCoupon(null);
  }, []);

  const saveForLater = useCallback((index) => {
    // Move to wishlist
    const item = cart[index];
    if (item) {
      addToWishlist({ id: item.product_id, name: item.name, slug: item.slug, images: [item.image], price: item.original_price, sale_price: item.price });
      removeFromCart(index);
    }
  }, [cart, removeFromCart]);

  // Wishlist operations
  const addToWishlist = useCallback(async (product) => {
    if (isAuthenticated && user) {
      try {
        const existing = wishlist.find(w => w.product_id === product.id);
        if (!existing) {
          await db.entities.Wishlist.create({
            user_id: user.id,
            product_id: product.id,
            product_name: product.name,
            product_image: product.images?.[0] || '',
            product_price: product.price,
            product_sale_price: product.sale_price,
          });
          loadWishlist();
        }
      } catch (e) {
        // fallback to local
      }
    } else {
      setWishlist(prev => {
        if (prev.find(w => w.product_id === product.id)) return prev;
        return [...prev, {
          product_id: product.id,
          product_name: product.name,
          product_image: product.images?.[0] || '',
          product_price: product.price,
          product_sale_price: product.sale_price,
        }];
      });
    }
  }, [isAuthenticated, user, wishlist, loadWishlist]);

  const removeFromWishlist = useCallback(async (productId) => {
    if (isAuthenticated && user) {
      try {
        const item = wishlist.find(w => w.product_id === productId);
        if (item) {
          await db.entities.Wishlist.delete(item.id);
          loadWishlist();
        }
      } catch (e) {
        setWishlist(prev => prev.filter(w => w.product_id !== productId));
      }
    } else {
      setWishlist(prev => prev.filter(w => w.product_id !== productId));
    }
  }, [isAuthenticated, user, wishlist, loadWishlist]);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some(w => w.product_id === productId);
  }, [wishlist]);

  const moveToCart = useCallback((productId) => {
    const item = wishlist.find(w => w.product_id === productId);
    if (item) {
      addToCart({
        id: item.product_id,
        name: item.product_name,
        slug: '',
        images: [item.product_image],
        price: item.product_sale_price || item.product_price,
        sale_price: item.product_sale_price,
        stock: 99,
      });
      removeFromWishlist(productId);
    }
  }, [wishlist, addToCart, removeFromWishlist]);

  // Recently viewed
  const addRecentlyViewed = useCallback((product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [{ id: product.id, name: product.name, slug: product.slug, image: product.images?.[0], price: product.price, sale_price: product.sale_price }, ...filtered].slice(0, 8);
    });
  }, []);

  // Cart calculations
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const originalSubtotal = cart.reduce((sum, item) => sum + (item.original_price || item.price) * item.quantity, 0);
  const productDiscount = originalSubtotal - subtotal;
  const shippingThreshold = 999;
  const shipping = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 99;
  const couponDiscount = coupon ? coupon.discountAmount : 0;
  const taxableAmount = Math.max(0, subtotal - couponDiscount);
  const tax = Math.round(taxableAmount * 0.05);
  const total = taxableAmount + shipping + tax;

  const applyCoupon = useCallback((couponObj) => {
    setCoupon(couponObj);
  }, []);

  const removeCoupon = useCallback(() => {
    setCoupon(null);
  }, []);

  return (
    <StoreContext.Provider value={{
      cart, cartCount, subtotal, originalSubtotal, productDiscount, shipping, tax, total,
      coupon, couponDiscount, shippingThreshold,
      addToCart, updateCartQuantity, removeFromCart, clearCart, saveForLater,
      wishlist, addToWishlist, removeFromWishlist, isInWishlist, moveToCart,
      recentlyViewed, addRecentlyViewed,
      applyCoupon, removeCoupon,
      reloadWishlist: loadWishlist,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};