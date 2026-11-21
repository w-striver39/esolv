/**
 * Esolv — Advanced Motion & Animation Engine
 * Scroll reveals, platform card 3D tilt, particle canvas,
 * ripple buttons, word-by-word reveals, scroll progress bar.
 */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------------------------
     1. Scroll Progress Bar
  -------------------------------------------------------------------------- */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress-bar';
  document.body.prepend(progressBar);

  let progressTicking = false;
  window.addEventListener('scroll', () => {
    if (!progressTicking) {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = pct + '%';
        progressTicking = false;
      });
      progressTicking = true;
    }
  }, { passive: true });

  /* -------------------------------------------------------------------------
     2. Universal Scroll Reveal (IntersectionObserver)
  -------------------------------------------------------------------------- */
  if (!prefersReduced && 'IntersectionObserver' in window) {

    // 2a. Generic [data-reveal] elements
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('[data-reveal], [data-stagger]').forEach(el => {
      revealObserver.observe(el);
    });

    // 2b. Word-by-word title reveal
    document.querySelectorAll('.word-reveal-title').forEach(el => {
      // Split text into word spans
      const text = el.textContent.trim();
      const words = text.split(/\s+/);
      el.textContent = '';
      words.forEach(word => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = word;
        el.appendChild(span);
        el.appendChild(document.createTextNode(' '));
      });

      const wordObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('words-visible');
            wordObserver.unobserve(e.target);
          }
        });
      }, { threshold: 0.3 });
      wordObserver.observe(el);
    });

    // 2c. Card grids — stagger children as .card-revealed
    const cardGridSelectors = [
      '.platforms-cards-grid .platform-card',
      '.services-grid .service-card',
      '.results-metrics-grid .metric-card',
      '.why-cards-grid .why-card',
      '.process-workflow .process-step-item',
      '.stories-cards-grid .story-card',
      '.pricing-cards-grid .pricing-card',
      '.testimonials-cards-grid .testimonial-card',
    ];

    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Small extra delay so parent section reveal fires first
          setTimeout(() => {
            entry.target.classList.add('card-revealed');
          }, 80);
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(cardGridSelectors.join(', ')).forEach(card => {
      cardObserver.observe(card);
    });

    // 2d. Animate popular pricing badge
    const popularBadge = document.querySelector('.popular-badge');
    if (popularBadge) popularBadge.classList.add('badge-animated');

    // 2e. Process connector lines
    const connectorObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('line-animated');
          connectorObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    document.querySelectorAll('.process-connector').forEach(c => connectorObserver.observe(c));
  }

  /* -------------------------------------------------------------------------
     3. Platform Section — Particle Canvas Background
  -------------------------------------------------------------------------- */
  const platformsSection = document.querySelector('.platforms-section');
  if (platformsSection && !prefersReduced) {
    const canvas = document.createElement('canvas');
    canvas.className = 'platforms-particle-canvas';
    platformsSection.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrameId;

    const resize = () => {
      canvas.width  = platformsSection.offsetWidth;
      canvas.height = platformsSection.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x    = Math.random() * canvas.width;
        this.y    = Math.random() * canvas.height;
        this.r    = Math.random() * 1.8 + 0.4;
        this.vx   = (Math.random() - 0.5) * 0.25;
        this.vy   = -Math.random() * 0.4 - 0.1;
        this.alpha = Math.random() * 0.5 + 0.1;
        this.life  = 0;
        this.maxLife = Math.random() * 300 + 200;
        // random pastel colours
        const hues = [210, 220, 190, 240, 260];
        this.hue = hues[Math.floor(Math.random() * hues.length)];
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        const lifeRatio = this.life / this.maxLife;
        this.currentAlpha = this.alpha * (1 - lifeRatio);
        if (this.life >= this.maxLife || this.y < 0) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.currentAlpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 55; i++) particles.push(new Particle());

    // Only animate when in viewport
    let canvasVisible = false;
    const canvasObserver = new IntersectionObserver((entries) => {
      canvasVisible = entries[0].isIntersecting;
      if (canvasVisible) tick();
    }, { threshold: 0.05 });
    canvasObserver.observe(platformsSection);

    const tick = () => {
      if (!canvasVisible) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animFrameId = requestAnimationFrame(tick);
    };
  }

  /* -------------------------------------------------------------------------
     4. Platform Cards — 3D Mouse-Parallax Tilt
  -------------------------------------------------------------------------- */
  if (!prefersReduced && window.innerWidth > 900) {
    document.querySelectorAll('.platform-card').forEach(card => {
      const scene  = card.querySelector('.platform-3d-scene');
      const logo   = card.querySelector('.platform-brand-logo');

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = (e.clientX - cx) / (rect.width  / 2);  // –1 to 1
        const dy   = (e.clientY - cy) / (rect.height / 2);  // –1 to 1

        const rotX = -dy * 8;   // max ±8 deg
        const rotY =  dx * 8;

        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.025)`;
        if (scene)  scene.style.transform  = `translateX(${dx * 6}px) translateY(${dy * 6}px)`;
        if (logo)   logo.style.transform   = `translateX(${dx * 3}px) translateY(${dy * 3}px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform  = '';
        if (scene)  scene.style.transform  = '';
        if (logo)   logo.style.transform   = '';
      });
    });
  }

  /* -------------------------------------------------------------------------
     5. Ripple Effect on CTA Buttons
  -------------------------------------------------------------------------- */
  document.querySelectorAll('.btn-platform, .btn-gradient-orange, .btn-outline-glass').forEach(btn => {
    btn.classList.add('btn-ripple');
    btn.addEventListener('click', (e) => {
      const rect   = btn.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 2;
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* -------------------------------------------------------------------------
     6. Smooth Scroll for anchor links (native scroll-behavior fallback)
  -------------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* -------------------------------------------------------------------------
     7. Active nav link on scroll — Intersection-based (Home page only)
  -------------------------------------------------------------------------- */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const isHomePage = currentPath === 'index.html' || currentPath === '' || currentPath.endsWith('/') || !currentPath.includes('.html');

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');

  if (isHomePage && sections.length && navLinks.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const matchingLink = document.querySelector(`.desktop-nav .nav-link[href="#${entry.target.id}"]`);
          if (matchingLink) {
            navLinks.forEach(l => l.classList.remove('active'));
            matchingLink.classList.add('active');
          }
        }
      });
    }, { threshold: 0.35 });

    sections.forEach(sec => navObserver.observe(sec));
  }

  /* -------------------------------------------------------------------------
     8. Metric / Stat Numbers — shimmer class during count
  -------------------------------------------------------------------------- */
  const origAnimateCounters = window.__esolvCounterFn;

  // Hook into counter targets — wrap with shimmer
  document.querySelectorAll('.count-target').forEach(el => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        el.classList.add('counting');
        // Remove shimmer after count duration (~2s)
        setTimeout(() => el.classList.remove('counting'), 2200);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(el);
  });

  /* -------------------------------------------------------------------------
     9. Hero Scroll Hint (adds scroll arrow beneath hero if element exists on home page only)
  -------------------------------------------------------------------------- */
  const heroSection = document.querySelector('.hero-section:not(.amazon-hero-section)');
  if (heroSection) {
    const hint = document.createElement('div');
    hint.className = 'section-scroll-hint';
    hint.setAttribute('aria-label', 'Scroll down');
    hint.innerHTML = `
      <span style="font-size:0.72rem;font-weight:600;letter-spacing:0.08em;color:#94a3b8;text-transform:uppercase;">Scroll</span>
      <svg class="scroll-arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <polyline points="19 12 12 19 5 12"></polyline>
      </svg>`;
    hint.addEventListener('click', () => {
      const nextSection = heroSection.nextElementSibling;
      if (nextSection) nextSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Insert at bottom of hero
    const heroContent = heroSection.querySelector('.hero-container') || heroSection;
    heroContent.appendChild(hint);

    // Hide when user scrolls past hero
    const heroHintObserver = new IntersectionObserver((entries) => {
      hint.style.opacity = entries[0].isIntersecting ? '' : '0';
      hint.style.pointerEvents = entries[0].isIntersecting ? '' : 'none';
    }, { threshold: 0.4 });
    heroHintObserver.observe(heroSection);
  }

  /* -------------------------------------------------------------------------
     10. Platform Section Header — add word-reveal class automatically
  -------------------------------------------------------------------------- */
  const platformTitle = document.querySelector('.platforms-main-title');
  if (platformTitle && !platformTitle.classList.contains('word-reveal-title')) {
    platformTitle.classList.add('word-reveal-title');
  }

  /* -------------------------------------------------------------------------
     11. Add data-reveal attributes to major section headers automatically
  -------------------------------------------------------------------------- */
  const sectionHeaders = document.querySelectorAll(
    '.platforms-header-row, .section-header-row, .digital-marketing-container > .dm-left-col > h2, .why-container > .section-header, .process-container > .section-header, .results-container > .section-header, .stories-container > .section-header, .pricing-container > .section-header, .testimonials-container > .section-header'
  );
  sectionHeaders.forEach(el => {
    if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', 'fade-up');
  });

  /* -------------------------------------------------------------------------
     12. Add data-reveal to sub-description paragraphs
  -------------------------------------------------------------------------- */
  document.querySelectorAll('.platforms-sub-desc, .section-sub-desc, .dm-lead').forEach(el => {
    if (!el.hasAttribute('data-reveal')) {
      el.setAttribute('data-reveal', 'fade-up');
      el.style.transitionDelay = '0.15s';
    }
  });

  /* -------------------------------------------------------------------------
     13. CTA Section — Parallax on scroll
  -------------------------------------------------------------------------- */
  const ctaSection = document.querySelector('.cta-section');
  if (ctaSection && !prefersReduced) {
    window.addEventListener('scroll', () => {
      const rect   = ctaSection.getBoundingClientRect();
      const viewH  = window.innerHeight;
      const pct    = Math.max(0, Math.min(1, 1 - rect.top / viewH));
      ctaSection.style.backgroundPositionY = `${50 + (pct - 0.5) * 20}%`;
    }, { passive: true });
  }

  /* -------------------------------------------------------------------------
     14. Footer World Map — stagger ping delays via JS (more varied)
  -------------------------------------------------------------------------- */
  document.querySelectorAll('.world-dots-svg circle').forEach((dot, i) => {
    dot.style.animationDelay = `${(i * 0.38).toFixed(2)}s`;
  });

  /* -------------------------------------------------------------------------
     15. Keyboard focus — smooth ring highlight (accessibility)
  -------------------------------------------------------------------------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') document.body.classList.add('keyboard-nav');
  });
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
  });

  /* -------------------------------------------------------------------------
     16. Platform card — logo slide-in after reveal
  -------------------------------------------------------------------------- */
  const logoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const logo = entry.target.querySelector('.platform-brand-logo');
        if (logo) {
          logo.style.opacity = '0';
          logo.style.transform = 'translateY(-10px)';
          logo.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          setTimeout(() => {
            logo.style.opacity = '1';
            logo.style.transform = 'none';
          }, 100 + parseInt(entry.target.dataset.cardIdx || 0) * 110);
        }
        logoObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.platform-card').forEach((card, i) => {
    card.dataset.cardIdx = i;
    logoObserver.observe(card);
  });

})();
