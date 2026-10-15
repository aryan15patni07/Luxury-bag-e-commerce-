/**
 * AURELLE Luxury Goods - Reactive State Store
 * Persistent via localStorage with event-driven subscriptions
 */

import { PRODUCTS } from './data/products.js';

class LuxuryStore {
  constructor() {
    this.cartKey = 'aurelle_cart_v1';
    this.wishlistKey = 'aurelle_wishlist_v1';
    this.recentlyViewedKey = 'aurelle_recent_v1';

    this.cart = this.loadFromStorage(this.cartKey, []);
    this.wishlist = this.loadFromStorage(this.wishlistKey, []);
    this.recentlyViewed = this.loadFromStorage(this.recentlyViewedKey, []);
    
    this.promoCode = null;
    this.discountPercent = 0;
    this.discountFixed = 0;
    this.shippingThreshold = 10000;
    this.standardShipping = 750;

    this.listeners = new Set();
  }

  loadFromStorage(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn('LocalStorage error:', e);
      return fallback;
    }
  }

  saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event = { type: 'STATE_CHANGED' }) {
    this.listeners.forEach(fn => fn(event, this));
  }

  // --- Cart Operations ---

  addToCart({ productId, colorId, quantity = 1, monogram = '' }) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return false;

    const color = product.colors.find(c => c.id === colorId) || product.colors[0];
    const cartItemId = `${productId}-${color.id}-${monogram.trim().toUpperCase()}`;

    const existingIndex = this.cart.findIndex(item => item.id === cartItemId);
    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        id: cartItemId,
        productId: product.id,
        name: product.name,
        price: product.price,
        color: {
          id: color.id,
          name: color.name,
          hex: color.hex
        },
        image: color.image,
        quantity: Math.max(1, quantity),
        monogram: monogram.trim().toUpperCase()
      });
    }

    this.saveToStorage(this.cartKey, this.cart);
    this.notify({ type: 'CART_UPDATED', action: 'add', item: product });
    return true;
  }

  updateQuantity(cartItemId, newQty) {
    const item = this.cart.find(i => i.id === cartItemId);
    if (!item) return;

    if (newQty <= 0) {
      this.removeFromCart(cartItemId);
    } else {
      item.quantity = newQty;
      this.saveToStorage(this.cartKey, this.cart);
      this.notify({ type: 'CART_UPDATED', action: 'update' });
    }
  }

  removeFromCart(cartItemId) {
    this.cart = this.cart.filter(item => item.id !== cartItemId);
    this.saveToStorage(this.cartKey, this.cart);
    this.notify({ type: 'CART_UPDATED', action: 'remove' });
  }

  clearCart() {
    this.cart = [];
    this.promoCode = null;
    this.discountPercent = 0;
    this.discountFixed = 0;
    this.saveToStorage(this.cartKey, this.cart);
    this.notify({ type: 'CART_CLEARED' });
  }

  getCartCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSubtotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getDiscount() {
    const subtotal = this.getSubtotal();
    if (this.discountPercent > 0) {
      return Math.round(subtotal * (this.discountPercent / 100));
    }
    if (this.discountFixed > 0) {
      return Math.min(subtotal, this.discountFixed);
    }
    return 0;
  }

  getShippingFee() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= this.shippingThreshold ? 0 : this.standardShipping;
  }

  getShippingProgress() {
    const subtotal = this.getSubtotal();
    const progress = Math.min(100, Math.round((subtotal / this.shippingThreshold) * 100));
    const remaining = Math.max(0, this.shippingThreshold - subtotal);
    const qualified = subtotal >= this.shippingThreshold;
    return { progress, remaining, qualified };
  }

  getTotal() {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscount();
    const shipping = this.getShippingFee();
    return Math.max(0, subtotal - discount + shipping);
  }

  applyPromoCode(code) {
    const normalized = (code || '').trim().toUpperCase();
    if (normalized === 'AURELLE10') {
      this.promoCode = 'AURELLE10';
      this.discountPercent = 10;
      this.discountFixed = 0;
      this.notify({ type: 'PROMO_APPLIED', valid: true, message: '10% Exclusive Welcome Privileges Applied' });
      return { success: true, message: '10% Exclusive Welcome Privileges Applied' };
    } else if (normalized === 'WELCOME') {
      this.promoCode = 'WELCOME';
      this.discountFixed = 2000;
      this.discountPercent = 0;
      this.notify({ type: 'PROMO_APPLIED', valid: true, message: '₹2,000 Inaugural Privileges Applied' });
      return { success: true, message: '₹2,000 Inaugural Privileges Applied' };
    } else {
      return { success: false, message: 'Invalid or expired invitation code' };
    }
  }

  removePromoCode() {
    this.promoCode = null;
    this.discountPercent = 0;
    this.discountFixed = 0;
    this.notify({ type: 'PROMO_REMOVED' });
  }

  // --- Wishlist Operations ---

  toggleWishlist(productId) {
    const index = this.wishlist.indexOf(productId);
    let added = false;
    if (index > -1) {
      this.wishlist.splice(index, 1);
      added = false;
    } else {
      this.wishlist.push(productId);
      added = true;
    }
    this.saveToStorage(this.wishlistKey, this.wishlist);
    this.notify({ type: 'WISHLIST_UPDATED', productId, added });
    return added;
  }

  isInWishlist(productId) {
    return this.wishlist.includes(productId);
  }

  getWishlistCount() {
    return this.wishlist.length;
  }

  getWishlistProducts() {
    return PRODUCTS.filter(p => this.wishlist.includes(p.id));
  }

  // --- Recently Viewed ---

  addRecentlyViewed(productId) {
    this.recentlyViewed = [productId, ...this.recentlyViewed.filter(id => id !== productId)].slice(0, 4);
    this.saveToStorage(this.recentlyViewedKey, this.recentlyViewed);
    this.notify({ type: 'RECENT_UPDATED' });
  }

  getRecentlyViewedProducts() {
    return this.recentlyViewed
      .map(id => PRODUCTS.find(p => p.id === id))
      .filter(Boolean);
  }

  // --- Format Utilities ---

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }
}

export const store = new LuxuryStore();
