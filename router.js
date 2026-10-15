/**
 * AURELLE Luxury Goods - Client-Side Hash Router
 */

import { renderProductDetail } from './components/productDetail.js';

export function initRouter() {
  const homeView = document.querySelector('#view-home');
  const catalogView = document.querySelector('#view-catalog');
  const pdpView = document.querySelector('#view-pdp');

  function handleRoute() {
    const hash = window.location.hash.slice(1) || '';
    const parts = hash.split('/');
    const route = parts[0] || 'home';
    const param = parts[1];

    // Reset views
    [homeView, catalogView, pdpView].forEach(view => {
      if (view) {
        view.classList.remove('active');
      }
    });

    // Update active nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      const targetHash = link.getAttribute('href')?.replace('#', '') || '';
      link.classList.toggle('active', targetHash === route);
    });

    if (route === 'shop') {
      catalogView?.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (route === 'product' && param) {
      pdpView?.classList.add('active');
      renderProductDetail(param, '#pdp-content-container');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (route === 'craft') {
      homeView?.classList.add('active');
      setTimeout(() => {
        document.querySelector('#craft-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (route === 'story') {
      homeView?.classList.add('active');
      setTimeout(() => {
        document.querySelector('#story-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      // Default: Home View
      homeView?.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
