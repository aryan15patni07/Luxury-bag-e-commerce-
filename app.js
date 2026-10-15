/**
 * AURELLE Luxury Goods - Main Application Entrypoint
 */

import { PRODUCTS, TESTIMONIALS, CRAFT_HIGHLIGHTS, LOOKBOOK_IMAGES } from './data/products.js';
import { store } from './store.js';
import { initHeader } from './components/header.js';
import { initCatalog, renderProductCard, bindCardEvents } from './components/catalog.js';
import { initCart, showToast } from './components/cart.js';
import { initCheckout } from './components/checkout.js';
import { initRouter } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Header & Navigation
  initHeader();

  // 2. Initialize Cart Drawer & Checkout Flow
  initCart();
  initCheckout();

  // 3. Render Homepage Bestsellers (6 key luxury bags)
  renderHomepageBestsellers();

  // 4. Render Craftsmanship Section Highlights
  renderCraftHighlights();

  // 5. Render Testimonials
  renderTestimonials();

  // 6. Render Editorial Campaign Lookbook
  renderLookbook();

  // 7. Initialize Catalog Page
  initCatalog('#catalog-product-grid');

  // 8. Initialize Client-Side Router
  initRouter();

  // 9. Initialize Newsletter Subscription
  initNewsletter();

  // 10. Bind Collection Card Clicks
  initCollectionCards();
});

/**
 * Renders the 6 featured bestsellers on the homepage
 */
function renderHomepageBestsellers() {
  const container = document.querySelector('#bestsellers-grid');
  if (!container) return;

  const bestsellers = PRODUCTS.filter(p => p.featured).slice(0, 6);
  container.innerHTML = bestsellers.map(renderProductCard).join('');
  bindCardEvents(container);
}

/**
 * Renders the 3 Craftsmanship highlights with numbers and details
 */
function renderCraftHighlights() {
  const container = document.querySelector('#craft-highlights-container');
  if (!container) return;

  container.innerHTML = CRAFT_HIGHLIGHTS.map(item => `
    <div class="craft-highlight-item">
      <div class="craft-highlight-num">${item.number}</div>
      <div class="craft-highlight-body">
        <span class="craft-highlight-subtitle">${item.subtitle}</span>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
    </div>
  `).join('');
}

/**
 * Renders the 3 Customer Testimonials
 */
function renderTestimonials() {
  const container = document.querySelector('#testimonials-grid');
  if (!container) return;

  container.innerHTML = TESTIMONIALS.map(t => `
    <div class="testimonial-card">
      <div>
        <div class="testimonial-stars">★★★★★</div>
        <blockquote class="testimonial-quote">&ldquo;${t.quote}&rdquo;</blockquote>
      </div>
      <div>
        <span class="testimonial-author-name">${t.author}</span>
        <span class="testimonial-author-title">${t.title}</span>
        <span class="testimonial-bag-tag">${t.bag}</span>
      </div>
    </div>
  `).join('');
}

/**
 * Renders Editorial Lookbook Gallery
 */
function renderLookbook() {
  const container = document.querySelector('#lookbook-grid');
  if (!container) return;

  container.innerHTML = LOOKBOOK_IMAGES.map(item => `
    <div class="lookbook-item" data-caption="${item.caption}">
      <img src="${item.url}" alt="${item.caption}" loading="lazy" />
      <div class="lookbook-item-overlay">
        <span>${item.caption}</span>
      </div>
    </div>
  `).join('');
}

/**
 * Newsletter Form Handling
 */
function initNewsletter() {
  const form = document.querySelector('#newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('input[type="email"]');
    const email = emailInput?.value.trim();

    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    emailInput.value = '';
    showToast('Privilege registered. Welcome to the world of AURELLE.');
  });
}

/**
 * Collection Cards navigation
 */
function initCollectionCards() {
  document.querySelectorAll('[data-collection-target]').forEach(card => {
    card.addEventListener('click', () => {
      const targetCategory = card.dataset.collectionTarget;
      window.location.hash = '#shop';
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('setCatalogCategory', { 
          detail: { category: targetCategory } 
        }));
      }, 50);
    });
  });
}
