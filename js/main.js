/**
 * GlobalEcomPro - Main Interactive Engine
 * High-performance, lightweight, vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- Element Selectors ---
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const searchTrigger = document.getElementById('searchTrigger');
  const searchModal = document.getElementById('searchModal');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');

  // --- 1. Sticky Header on Scroll & Apple iOS Dynamic Frosted Glass Mode ---
  const heroSection = document.getElementById('home') || 
                      document.querySelector('.hero-section') || 
                      document.querySelector('.amazon-hero-section') || 
                      document.querySelector('main > section:first-of-type');
  let isTicking = false;

  const updateHeaderScroll = () => {
    const scrollY = window.scrollY;

    // Subtle scroll elevation
    if (scrollY > 15) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Past Hero section detection -> triggers iOS white frosted glass & dark logo
    if (heroSection) {
      const heroRect = heroSection.getBoundingClientRect();
      const headerHeight = header.offsetHeight || 86;
      if (heroRect.bottom <= headerHeight) {
        header.classList.add('header-light');
      } else {
        header.classList.remove('header-light');
      }
    } else {
      // Fallback for pages without standard hero: turn light past 40px
      if (scrollY > 40) {
        header.classList.add('header-light');
      } else {
        header.classList.remove('header-light');
      }
    }

    isTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!isTicking) {
      window.requestAnimationFrame(updateHeaderScroll);
      isTicking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (!isTicking) {
      window.requestAnimationFrame(updateHeaderScroll);
      isTicking = true;
    }
  }, { passive: true });

  // Initial check on page load
  updateHeaderScroll();

  // --- 2. Mobile Drawer Navigation ---
  const openDrawer = () => {
    mobileDrawer.classList.add('active');
    drawerBackdrop.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    mobileDrawer.classList.remove('active');
    drawerBackdrop.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
      mobileNavLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // --- 3. Search Modal Popover ---
  const openSearch = () => {
    searchModal.classList.add('active');
    searchModal.setAttribute('aria-hidden', 'false');
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 100);
    }
  };

  const closeSearch = () => {
    searchModal.classList.remove('active');
    searchModal.setAttribute('aria-hidden', 'true');
  };

  if (searchTrigger) {
    searchTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isActive = searchModal.classList.contains('active');
      if (isActive) closeSearch();
      else openSearch();
    });
  }

  if (searchClose) searchClose.addEventListener('click', closeSearch);

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
      closeSearch();
    }
  });

  // --- 4. Stat Counter Animations (Multi-Section Support) ---
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animateElementCounters = (container) => {
    const targets = container.querySelectorAll('.count-target');
    targets.forEach(counter => {
      if (counter.classList.contains('counted')) return;
      counter.classList.add('counted');

      const targetVal = parseFloat(counter.getAttribute('data-target'));
      const suffix = counter.getAttribute('data-suffix') || '';
      const prefix = counter.getAttribute('data-prefix') || '';
      const isDecimal = counter.getAttribute('data-decimal');
      const duration = 1800; // ms
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out quartic
        const easeOutProgress = 1 - Math.pow(1 - progress, 4);
        const currentNum = targetVal * easeOutProgress;

        if (isDecimal) {
          counter.textContent = `${prefix}${currentNum.toFixed(1)}${suffix}`;
        } else {
          counter.textContent = `${prefix}${Math.floor(currentNum).toLocaleString()}${suffix}`;
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          if (isDecimal) {
            counter.textContent = `${prefix}${targetVal.toFixed(1)}${suffix}`;
          } else {
            counter.textContent = `${prefix}${targetVal.toLocaleString()}${suffix}`;
          }
        }
      };

      if (!prefersReducedMotion) {
        requestAnimationFrame(updateCounter);
      }
    });

    // Animate Dashboard Sales Value (£1,245,680) if in container
    const salesEl = container.querySelector('#dashSalesValue');
    if (salesEl && !salesEl.classList.contains('counted') && !prefersReducedMotion) {
      salesEl.classList.add('counted');
      const targetSales = 1245680;
      const duration = 2000;
      const startTime = performance.now();

      const updateSales = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        const currentSales = Math.floor(targetSales * ease);

        salesEl.textContent = `£${currentSales.toLocaleString()}`;

        if (progress < 1) {
          requestAnimationFrame(updateSales);
        } else {
          salesEl.textContent = `£${targetSales.toLocaleString()}`;
        }
      };

      requestAnimationFrame(updateSales);
    }
  };

  // Run stats animation when sections enter viewport
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateElementCounters(entry.target);
        }
      });
    }, { threshold: 0.25 });

    const sectionsWithCounters = document.querySelectorAll('.hero-section, .digital-marketing-section, .services-section, .our-results-section');
    sectionsWithCounters.forEach(sec => observer.observe(sec));
  } else {
    document.querySelectorAll('.hero-section, .digital-marketing-section, .services-section, .our-results-section').forEach(sec => {
      animateElementCounters(sec);
    });
  }

  // --- 5. Interactive 3D Subtle Tilt on Visual Stage (Desktop only) ---
  const heroVisual = document.querySelector('.hero-visual');
  const laptopShowcase = document.querySelector('.laptop-showcase');

  if (heroVisual && laptopShowcase && window.innerWidth > 1024 && !prefersReducedMotion) {
    heroVisual.addEventListener('mousemove', (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const rotY = (x / (rect.width / 2)) * 5;
      const rotX = -(y / (rect.height / 2)) * 4;

      laptopShowcase.style.transform = `perspective(1000px) rotateY(${rotY - 3}deg) rotateX(${rotX + 1}deg)`;
    });

    heroVisual.addEventListener('mouseleave', () => {
      laptopShowcase.style.transform = `perspective(1000px) rotateY(-4deg) rotateX(2deg)`;
    });
  }

  // --- 6. Active Navigation Highlighting on Click & Mobile Drawer Submenus ---
  const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');
  desktopLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        desktopLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });

  // Mobile Drawer Accordion Submenu Toggles
  const mobileSubmenuToggles = document.querySelectorAll('.mobile-submenu-toggle');
  mobileSubmenuToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const parentItem = toggle.closest('.mobile-nav-has-submenu');
      if (parentItem) {
        const isOpen = parentItem.classList.contains('open');
        // Toggle current item
        if (isOpen) {
          parentItem.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        } else {
          parentItem.classList.add('open');
          toggle.setAttribute('aria-expanded', 'true');
        }
      }
    });
  });

  // Auto-mark Active Navigation Item by Current Pathname
  const pagePath = window.location.pathname.split('/').pop() || 'index.html';
  const isHome = pagePath === 'index.html' || pagePath === '' || pagePath.endsWith('/') || !pagePath.includes('.html');

  const platformPages = [
    'amazon-services.html',
    'ebay-services.html',
    'walmart-services.html',
    'etsy-services.html',
    'shopify-services.html',
    'tiktok-shop-services.html'
  ];

  const servicePages = [
    'services.html',
    'digital-marketing-services.html',
    'uk-company-formation.html',
    'us-company-formation.html'
  ];

  if (!isHome) {
    if (platformPages.includes(pagePath)) {
      document.querySelectorAll('.desktop-nav .nav-link, .mobile-nav .mobile-nav-link').forEach(l => {
        const txt = l.textContent.trim().toLowerCase();
        if (txt.startsWith('platform')) {
          l.classList.add('active');
          const mobileParent = l.closest('.mobile-nav-has-submenu');
          if (mobileParent) {
            mobileParent.classList.add('open');
            const toggle = mobileParent.querySelector('.mobile-submenu-toggle');
            if (toggle) toggle.setAttribute('aria-expanded', 'true');
          }
        }
      });
      document.querySelectorAll(`.dropdown-link[href="${pagePath}"], .mobile-sublink[href="${pagePath}"]`).forEach(sub => {
        sub.classList.add('active');
      });
    } else if (servicePages.includes(pagePath)) {
      document.querySelectorAll('.desktop-nav .nav-link, .mobile-nav .mobile-nav-link').forEach(l => {
        const txt = l.textContent.trim().toLowerCase();
        if (txt.startsWith('service')) {
          l.classList.add('active');
          const mobileParent = l.closest('.mobile-nav-has-submenu');
          if (mobileParent) {
            mobileParent.classList.add('open');
            const toggle = mobileParent.querySelector('.mobile-submenu-toggle');
            if (toggle) toggle.setAttribute('aria-expanded', 'true');
          }
        }
      });
      document.querySelectorAll(`.dropdown-link[href="${pagePath}"], .mobile-sublink[href="${pagePath}"]`).forEach(sub => {
        sub.classList.add('active');
      });
    }
  }

  // --- 7. FAQ Accordion Interaction ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    const pane = item.querySelector('.faq-answer-pane');

    if (btn && pane) {
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all other items for clean accordion behavior
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
            const otherBtn = otherItem.querySelector('.faq-question-btn');
            const otherPane = otherItem.querySelector('.faq-answer-pane');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            if (otherPane) otherPane.style.maxHeight = null;
          }
        });

        // Toggle current item
        if (isActive) {
          item.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
          pane.style.maxHeight = null;
        } else {
          item.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
          pane.style.maxHeight = pane.scrollHeight + 'px';
        }
      });
    }
  });

  // --- 8. Collapsible Footer Menus on Mobile ---
  const footerAccordions = document.querySelectorAll('.footer-col-accordion');
  
  footerAccordions.forEach(col => {
    const btn = col.querySelector('.footer-col-title');
    const body = col.querySelector('.footer-collapse-body');
    
    if (btn && body) {
      btn.addEventListener('click', (e) => {
        // Only run on mobile screens (<= 768px)
        if (window.innerWidth > 768) return;
        
        e.preventDefault();
        const isOpen = col.classList.contains('is-open');

        // Close other footer accordions for clean mobile UX
        footerAccordions.forEach(other => {
          if (other !== col && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            const otherBtn = other.querySelector('.footer-col-title');
            const otherBody = other.querySelector('.footer-collapse-body');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            if (otherBody) otherBody.style.maxHeight = null;
          }
        });

        // Toggle clicked accordion
        if (isOpen) {
          col.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
          body.style.maxHeight = null;
        } else {
          col.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    }
  });

  // Re-adjust max-height on window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      footerAccordions.forEach(col => {
        const body = col.querySelector('.footer-collapse-body');
        if (body) body.style.maxHeight = null;
      });
    } else {
      footerAccordions.forEach(col => {
        if (col.classList.contains('is-open')) {
          const body = col.querySelector('.footer-collapse-body');
          if (body) body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    }
  });
});
