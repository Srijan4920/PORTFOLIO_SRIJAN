/* ============================================================
   MAIN — Theme toggle, Lenis smooth scroll, page loader, nav
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Web Audio Synth ---------- */
  class TactileSynth {
    constructor() {
      this.ctx = null;
    }
    init() {
      if (this.ctx) return;
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn("AudioContext not supported", e);
      }
    }
    playClick() {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    }
    playHover() {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      gain.gain.setValueAtTime(0.004, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    }
    playToggle(isDark) {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const gain2 = this.ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'sine';
      if (isDark) {
        osc1.frequency.setValueAtTime(440, now);
        osc1.frequency.setValueAtTime(440, now + 0.08);
        osc2.frequency.setValueAtTime(330, now + 0.08);
      } else {
        osc1.frequency.setValueAtTime(330, now);
        osc1.frequency.setValueAtTime(330, now + 0.08);
        osc2.frequency.setValueAtTime(440, now + 0.08);
      }
      gain1.gain.setValueAtTime(0.03, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.03, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.20);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.13);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.21);
    }
  }
  const synth = new TactileSynth();

  /* ---------- Dynamic Theme Accent Color Loader ---------- */
  fetch('assets/feature_inspiration.json')
    .then(response => {
      if (response.ok) return response.json();
    })
    .then(data => {
      if (data && data.accent_h && data.accent_s && data.accent_l) {
        document.documentElement.style.setProperty('--accent-h', data.accent_h);
        document.documentElement.style.setProperty('--accent-s', data.accent_s);
        document.documentElement.style.setProperty('--accent-l', data.accent_l);
        console.log(`[Theme Engine] Injected dynamic accent color: HSL(${data.accent_h}, ${data.accent_s}, ${data.accent_l}) representing ${data.theme_name || 'custom'} theme.`);
      }
    })
    .catch(error => console.log('Error loading design spotlight theme:', error));

  /* ---------- Theme Toggle with Liquid Sweep Transition ---------- */
  const html = document.documentElement;
  const THEME_KEY = 'ukr-portfolio-theme';

  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  html.setAttribute('data-theme', savedTheme);

  const toggle = document.getElementById('themeToggle');
  const sweepCircle = document.getElementById('themeSweepCircle');

  if (toggle && sweepCircle) {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      
      // Play toggle sound
      if (typeof synth !== 'undefined') {
        synth.playToggle(next === 'dark');
      }

      // Position sweep circle
      const rect = toggle.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      sweepCircle.style.left = x + 'px';
      sweepCircle.style.top = y + 'px';
      sweepCircle.style.background = next === 'light' ? '#f8f9fa' : '#08090c';
      
      // Sweep sweep!
      sweepCircle.style.transition = 'none';
      sweepCircle.style.transform = 'translate(-50%, -50%) scale(0)';
      sweepCircle.style.opacity = '1';
      void sweepCircle.offsetWidth; // force reflow
      
      sweepCircle.style.transition = 'transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)';
      sweepCircle.style.transform = 'translate(-50%, -50%) scale(3000)';
      
      setTimeout(() => {
        html.setAttribute('data-theme', next);
        localStorage.setItem(THEME_KEY, next);
        window.dispatchEvent(new Event('theme-change'));
      }, 400);
      
      setTimeout(() => {
        sweepCircle.style.transition = 'opacity 0.4s ease';
        sweepCircle.style.opacity = '0';
      }, 800);
    });
  } else if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
      if (typeof synth !== 'undefined') {
        synth.playToggle(next === 'dark');
      }
      window.dispatchEvent(new Event('theme-change'));
    });
  }

  /* ---------- Smooth Scroll (Lenis) ---------- */
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false
  });

  // Expose Lenis globally so other components can access or control it
  window.lenis = lenis;

  // Sync Lenis with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ============================================================
     1. CUSTOM CURSOR, FLUID TRAIL, MAGNETS & AUDIO INTERACTIONS
     ============================================================ */
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  
  let mouseX = 0, mouseY = 0;
  let dotX = 0, dotY = 0;
  let ringX = 0, ringY = 0;
  let ringWidth = 40, ringHeight = 40;
  let targetRingWidth = 40, targetRingHeight = 40;
  let hoveredMagnet = null;
  let trailPoints = [];
  const maxTrailPoints = 14;

  let trailCanvas = null;
  let trailCtx = null;

  if (!isTouchDevice) {
    // Dynamically create a canvas for the fluid trail
    trailCanvas = document.createElement('canvas');
    trailCanvas.id = 'cursorTrailCanvas';
    trailCanvas.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; pointer-events:none; z-index:99998;';
    document.body.appendChild(trailCanvas);
    trailCtx = trailCanvas.getContext('2d');
    
    const resizeTrail = () => {
      trailCanvas.width = window.innerWidth;
      trailCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeTrail);
    resizeTrail();
    
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Resume audio context on mouse move if browser blocks it on start
      synth.init();
    });
    
    // Hide default cursor
    document.body.style.cursor = 'none';
    
    const animateCursor = () => {
      dotX += (mouseX - dotX) * 0.22;
      dotY += (mouseY - dotY) * 0.22;
      
      if (dot) {
        dot.style.left = dotX + 'px';
        dot.style.top = dotY + 'px';
      }
      
      let targetX, targetY;
      if (hoveredMagnet) {
        const rect = hoveredMagnet.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
        targetRingWidth = rect.width + 12;
        targetRingHeight = rect.height + 12;
        if (ring) {
          ring.classList.add('locked-on');
          ring.style.borderRadius = getComputedStyle(hoveredMagnet).borderRadius;
        }
      } else {
        targetX = mouseX;
        targetY = mouseY;
        targetRingWidth = 40;
        targetRingHeight = 40;
        if (ring) {
          ring.classList.remove('locked-on');
          ring.style.borderRadius = '50%';
        }
      }
      
      ringX += (targetX - ringX) * 0.14;
      ringY += (targetY - ringY) * 0.14;
      ringWidth += (targetRingWidth - ringWidth) * 0.15;
      ringHeight += (targetRingHeight - ringHeight) * 0.15;
      
      if (ring) {
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        ring.style.width = ringWidth + 'px';
        ring.style.height = ringHeight + 'px';
      }
      
      // Draw fluid canvas trail
      trailPoints.push({ x: mouseX, y: mouseY });
      if (trailPoints.length > maxTrailPoints) {
        trailPoints.shift();
      }
      
      if (trailCtx) {
        trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
        if (trailPoints.length >= 2) {
          const h = getComputedStyle(document.documentElement).getPropertyValue('--accent-h').trim() || 125;
          const s = getComputedStyle(document.documentElement).getPropertyValue('--accent-s').trim() || '16%';
          const l = getComputedStyle(document.documentElement).getPropertyValue('--accent-l').trim() || '46%';
          
          for (let i = 0; i < trailPoints.length - 1; i++) {
            const p1 = trailPoints[i];
            const p2 = trailPoints[i + 1];
            const age = i / trailPoints.length;
            const alpha = age * 0.28;
            const lineWidth = 1 + age * 8;
            
            trailCtx.beginPath();
            trailCtx.moveTo(p1.x, p1.y);
            trailCtx.lineTo(p2.x, p2.y);
            trailCtx.strokeStyle = `hsla(${h}, ${s}, ${l}, ${alpha})`;
            trailCtx.lineWidth = lineWidth;
            trailCtx.lineCap = 'round';
            trailCtx.stroke();
          }
        }
      }
      requestAnimationFrame(animateCursor);
    };
    requestAnimationFrame(animateCursor);

    // Click scale indicator on custom dot
    document.addEventListener('mousedown', () => {
      if (dot) dot.classList.add('clicking');
    });
    document.addEventListener('mouseup', () => {
      if (dot) dot.classList.remove('clicking');
    });

    // Handle mouse out / in screen edges
    document.addEventListener('mouseleave', () => {
      if (dot) dot.style.opacity = '0';
      if (ring) ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dotX = mouseX;
      dotY = mouseY;
      ringX = mouseX;
      ringY = mouseY;
      if (dot) dot.style.opacity = '1';
      if (ring) ring.style.opacity = '0.5';
    });
  } else {
    if (dot) dot.style.display = 'none';
    if (ring) ring.style.display = 'none';
  }

  // Interactivity Binder — hover/click only (no magnetic position shift)
  function bindElementInteractions(el) {
    if (el._interactionsBound) return;
    el._interactionsBound = true;

    el.addEventListener('mouseenter', () => {
      synth.playHover();
      if (!isTouchDevice && dot && ring) {
        dot.classList.add('hovering');
        ring.classList.add('hovering');
      }
    });

    el.addEventListener('mouseleave', () => {
      if (!isTouchDevice && dot && ring) {
        dot.classList.remove('hovering');
        ring.classList.remove('hovering');
      }
    });

    el.addEventListener('click', () => {
      synth.playClick();
    });
  }

  function bindAllInteractions() {
    const selector = '.magnetic-wrap, .btn, .filter-btn, .theme-toggle, .contact-link, .nav-link, #scrollTopBtn, .btn-case-study, .modal-close-btn, .project-card';
    document.querySelectorAll(selector).forEach(bindElementInteractions);
  }
  bindAllInteractions();

  // Watch for dynamic DOM insertions to bind new elements
  const interactionObserver = new MutationObserver(() => {
    bindAllInteractions();
  });
  interactionObserver.observe(document.body, { childList: true, subtree: true });


  /* ============================================================
     2. LENIS SKEW & GSAP LETTER-BY-LETTER REVEAL
     ============================================================ */
  let currentSkew = 0;
  let targetSkew = 0;
  
  lenis.on('scroll', (e) => {
    targetSkew = e.velocity * 0.008; // scale factor
    targetSkew = Math.max(-8, Math.min(8, targetSkew)); // clamp
  });
  
  gsap.ticker.add(() => {
    currentSkew += (targetSkew - currentSkew) * 0.08;
    // Apply scroll skew to interactive cards
    gsap.set('.project-card, .timeline-card, .stat-card, .cert-card', {
      skewY: currentSkew,
      force3D: true
    });
    targetSkew *= 0.92; // Damping
  });

  // Letter by Letter scroll reveal on headings
  function initLetterByLetterReveal() {
    const headings = document.querySelectorAll('.section-title');
    headings.forEach(heading => {
      // Don't process if already split
      if (heading.querySelector('.char-span')) return;
      
      const splitNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const chars = node.textContent.split('');
          const fragment = document.createDocumentFragment();
          chars.forEach(char => {
            const span = document.createElement('span');
            span.className = 'char-span';
            span.style.display = 'inline-block';
            span.style.transformOrigin = 'center bottom';
            span.style.whiteSpace = char === ' ' ? 'pre' : 'normal';
            span.textContent = char;
            fragment.appendChild(span);
          });
          node.parentNode.replaceChild(fragment, node);
        } else {
          const children = Array.from(node.childNodes);
          children.forEach(child => splitNode(child));
        }
      };
      
      splitNode(heading);
      const chars = heading.querySelectorAll('.char-span');
      
      gsap.fromTo(chars, 
        { 
          opacity: 0, 
          y: 35, 
          rotateX: -45, 
          scale: 0.9 
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.015,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });
  }
  initLetterByLetterReveal();


  /* ============================================================
     3. HORIZONTAL DRAG-MOMENTUM CAROUSEL
     ============================================================ */
  function initProjectsCarousel() {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;
    
    let isDown = false;
    let startX;
    let scrollLeft;
    let velX = 0;
    let momentumID;
    let lastX = 0;
    
    grid.addEventListener('mousedown', (e) => {
      if (e.target.closest('a') || e.target.closest('button')) return;
      
      isDown = true;
      grid.classList.add('active');
      startX = e.pageX - grid.offsetLeft;
      scrollLeft = grid.scrollLeft;
      velX = 0;
      cancelAnimationFrame(momentumID);
    });
    
    grid.addEventListener('mouseleave', () => {
      if (!isDown) return;
      isDown = false;
      grid.classList.remove('active');
      beginMomentumScroll();
    });
    
    grid.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      grid.classList.remove('active');
      beginMomentumScroll();
    });
    
    grid.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - grid.offsetLeft;
      const walk = (x - startX) * 1.5;
      grid.scrollLeft = scrollLeft - walk;
      
      velX = x - lastX;
      lastX = x;
    });

    // Touch events for drag-momentum
    grid.addEventListener('touchstart', (e) => {
      if (e.target.closest('a') || e.target.closest('button')) return;
      isDown = true;
      startX = e.touches[0].pageX - grid.offsetLeft;
      scrollLeft = grid.scrollLeft;
      velX = 0;
      cancelAnimationFrame(momentumID);
    }, { passive: true });

    grid.addEventListener('touchend', () => {
      isDown = false;
      beginMomentumScroll();
    });

    grid.addEventListener('touchmove', (e) => {
      if (!isDown) return;
      const x = e.touches[0].pageX - grid.offsetLeft;
      const walk = (x - startX) * 1.2;
      grid.scrollLeft = scrollLeft - walk;
      velX = x - lastX;
      lastX = x;
    }, { passive: true });
    
    function beginMomentumScroll() {
      if (Math.abs(velX) < 0.5) return;
      grid.scrollLeft -= velX;
      velX *= 0.95; // Friction
      momentumID = requestAnimationFrame(beginMomentumScroll);
    }
  }
  // initProjectsCarousel(); // Disabled for clean responsive grid layout


  /* ============================================================
     4. GLOBAL COMMAND PALETTE SEARCH & TRIGGER LOGIC
     ============================================================ */
  function initCommandPalette() {
    const palette = document.getElementById('cmdPalette');
    const searchInput = document.getElementById('cmdPaletteSearch');
    const listContainer = document.getElementById('cmdPaletteList');
    const overlay = document.getElementById('cmdPaletteOverlay');
    
    if (!palette || !searchInput || !listContainer) return;
    
    let isOpen = false;
    let filteredCommands = [];
    let activeIndex = 0;
    
    const scrollToSection = (selector) => {
      const target = document.querySelector(selector);
      if (target && window.lenis) {
        window.lenis.scrollTo(target, { offset: -60 });
      }
      closePalette();
    };
    
    const openCaseStudy = (projectId) => {
      closePalette();
      const btn = document.querySelector(`.btn-case-study[data-project="${projectId}"]`);
      if (btn) btn.click();
    };
    
    const commands = [
      { id: 'home', title: 'Go to Home', category: 'Navigation', icon: 'home', action: () => scrollToSection('#hero') },
      { id: 'about', title: 'Go to About', category: 'Navigation', icon: 'user', action: () => scrollToSection('#about') },
      { id: 'experience', title: 'Go to Experience', category: 'Navigation', icon: 'briefcase', action: () => scrollToSection('#experience') },
      { id: 'projects', title: 'Go to Projects', category: 'Navigation', icon: 'folder', action: () => scrollToSection('#projects') },
      { id: 'skills', title: 'Go to Skills', category: 'Navigation', icon: 'cpu', action: () => scrollToSection('#skills') },
      { id: 'contact', title: 'Go to Contact', category: 'Navigation', icon: 'mail', action: () => scrollToSection('#contact') },
      
      { id: 'case-sap', title: 'View Case Study: SAP Integration Tracker', category: 'Case Studies', icon: 'file-text', action: () => openCaseStudy('sap-tracker') },
      { id: 'case-inbox', title: 'View Case Study: L2 Escalation Portal', category: 'Case Studies', icon: 'file-text', action: () => openCaseStudy('client-inbox-tracker') },
      { id: 'case-satellite', title: 'View Case Study: Satellite Crop Classification', category: 'Case Studies', icon: 'file-text', action: () => openCaseStudy('satellite-crop') },
      { id: 'case-cityflo', title: 'View Case Study: CityFlo BI Dashboards', category: 'Case Studies', icon: 'file-text', action: () => openCaseStudy('cityflo-bi') },
      
      { id: 'toggle-theme', title: 'Toggle Theme (Dark / Light)', category: 'Actions', icon: 'sun', action: () => document.getElementById('themeToggle')?.click() },
      { id: 'download-resume', title: 'Open Resume PDF', category: 'Actions', icon: 'download', action: () => window.open('assets/resume.pdf', '_blank') }
    ];
    
    function openPalette() {
      isOpen = true;
      palette.style.display = 'flex';
      palette.setAttribute('aria-hidden', 'false');
      gsap.to(overlay, { opacity: 1, duration: 0.25 });
      gsap.fromTo('.cmd-palette-wrapper', { y: -30, scale: 0.97, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.3, ease: 'power3.out' });
      
      if (window.lenis) window.lenis.stop();
      searchInput.value = '';
      filterCommands('');
      setTimeout(() => searchInput.focus(), 50);
    }
    
    function closePalette() {
      isOpen = false;
      if (window.lenis) window.lenis.start();
      gsap.to('.cmd-palette-wrapper', { y: -20, scale: 0.97, opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: () => {
        palette.style.display = 'none';
        palette.setAttribute('aria-hidden', 'true');
      }});
      gsap.to(overlay, { opacity: 0, duration: 0.2 });
    }
    
    function filterCommands(query) {
      const q = query.toLowerCase().trim();
      if (!q) {
        filteredCommands = [...commands];
      } else {
        filteredCommands = commands.filter(cmd => 
          cmd.title.toLowerCase().includes(q) || 
          cmd.category.toLowerCase().includes(q)
        );
      }
      activeIndex = 0;
      renderCommands();
    }
    
    function renderCommands() {
      listContainer.innerHTML = '';
      if (filteredCommands.length === 0) {
        listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-tertiary); font-size: 0.9rem;">No results found.</div>';
        return;
      }
      
      const categories = {};
      filteredCommands.forEach((cmd, index) => {
        if (!categories[cmd.category]) {
          categories[cmd.category] = [];
        }
        categories[cmd.category].push({ cmd, index });
      });
      
      Object.keys(categories).forEach(cat => {
        const groupTitle = document.createElement('div');
        groupTitle.className = 'cmd-palette-group-title';
        groupTitle.textContent = cat;
        listContainer.appendChild(groupTitle);
        
        categories[cat].forEach(({ cmd, index }) => {
          const item = document.createElement('div');
          item.className = `cmd-palette-item ${index === activeIndex ? 'active' : ''}`;
          item.setAttribute('data-index', index);
          
          item.innerHTML = `
            <div class="cmd-palette-item-left">
              <span class="cmd-palette-item-icon"><i data-lucide="${cmd.icon}" style="width:16px; height:16px"></i></span>
              <span class="cmd-palette-item-title">${cmd.title}</span>
            </div>
            <span class="cmd-palette-item-shortcut">Action</span>
          `;
          
          item.addEventListener('mouseenter', () => {
            activeIndex = index;
            updateActiveItem();
          });
          
          item.addEventListener('click', () => {
            cmd.action();
          });
          
          listContainer.appendChild(item);
        });
      });
      
      if (window.lucide) {
        window.lucide.createIcons({ node: listContainer });
      }
    }
    
    function updateActiveItem() {
      const items = listContainer.querySelectorAll('.cmd-palette-item');
      items.forEach(item => {
        const index = parseInt(item.getAttribute('data-index'), 10);
        if (index === activeIndex) {
          item.classList.add('active');
          item.scrollIntoView({ block: 'nearest' });
        } else {
          item.classList.remove('active');
        }
      });
    }
    
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % filteredCommands.length;
        updateActiveItem();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + filteredCommands.length) % filteredCommands.length;
        updateActiveItem();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[activeIndex]) {
          filteredCommands[activeIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closePalette();
      }
    });
    
    searchInput.addEventListener('input', (e) => {
      filterCommands(e.target.value);
    });
    
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          closePalette();
        } else {
          openPalette();
        }
      }
    });
    
    overlay.addEventListener('click', closePalette);
  }
  initCommandPalette();

  /* ---------- Inline Contact Form Handler (FormSubmit AJAX) ---------- */
  function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const statusMsg = document.getElementById('formStatusMsg');
      const submitBtn = document.getElementById('formSubmitBtn');
      if (!submitBtn || !statusMsg) return;

      const formData = new FormData(contactForm);

      // Honeypot check for bot submissions
      if (formData.get('_honey')) {
        console.warn('Bot submission detected via honeypot.');
        return;
      }

      // UI Loading State
      submitBtn.disabled = true;
      const btnText = submitBtn.querySelector('.btn-text');
      const btnIcon = submitBtn.querySelector('.btn-icon');
      const originalText = btnText ? btnText.textContent : 'Send Message';

      if (btnText) btnText.textContent = 'Sending...';
      if (btnIcon) {
        btnIcon.setAttribute('data-lucide', 'loader-2');
        btnIcon.classList.add('spin-icon');
      }
      if (window.lucide) window.lucide.createIcons();

      statusMsg.className = 'form-status-msg';
      statusMsg.style.display = 'none';
      statusMsg.innerHTML = '';

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(Object.fromEntries(formData))
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.success !== 'false') {
          const title = contactForm.querySelector('.form-title');
          const groups = contactForm.querySelectorAll('.form-group');
          const btn = contactForm.querySelector('#formSubmitBtn');

          if (title) title.style.display = 'none';
          groups.forEach(g => g.style.display = 'none');
          if (btn) btn.style.display = 'none';

          statusMsg.className = 'form-status-msg success';
          statusMsg.innerHTML = `
            <div class="success-badge-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div class="success-text">Message sent! I'll get back to you soon.</div>
          `;
          statusMsg.style.display = 'flex';
          contactForm.reset();
        } else {
          throw new Error((data && data.message) || 'Form submission failed.');
        }
      } catch (err) {
        console.error('Contact form submission error:', err);
        statusMsg.className = 'form-status-msg error';
        statusMsg.innerHTML = `<i data-lucide="alert-circle" style="width:18px;height:18px;margin-right:8px;flex-shrink:0;"></i> <span>Oops! Message delivery failed. Please try again or email directly to <a href="mailto:srijanpaul6@gmail.com" style="color:inherit;text-decoration:underline;">srijanpaul6@gmail.com</a>.</span>`;
        statusMsg.style.display = 'flex';
      } finally {
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = originalText;
        if (btnIcon) {
          btnIcon.setAttribute('data-lucide', 'send');
          btnIcon.classList.remove('spin-icon');
        }
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }
  initContactForm();

  /* ---------- Smooth anchor scrolling ---------- */
  let isAnchorScrolling = false;
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        if (isAnchorScrolling) return;
        isAnchorScrolling = true;

        // Instantly resolve character animations to prevent stuck wavy baseline text
        if (window.gsap) {
          window.gsap.set('.reveal-char', { opacity: 1, y: '0%', rotateX: 0 });
        }

        lenis.scrollTo(target, { 
          offset: -80,
          onComplete: () => {
            isAnchorScrolling = false;
          }
        });
      }
    });
  });

  /* ---------- Page Loader ---------- */
  function runLoader() {
    const loader = document.getElementById('pageLoader');
    const loaderName = document.getElementById('loaderName');
    const loaderBar = document.getElementById('loaderBar');

    if (!loader) {
      window.initAnimations();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(loader, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            loader.style.display = 'none';
            // Fire animations after loader
            window.initAnimations();
            // Re-init lucide icons (deferred script, safe to call after DOM ready)
            if (window.lucide) window.lucide.createIcons();
          }
        });
      }
    });

    tl.to(loaderName, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out'
    })
    .to(loaderBar, {
      width: '100%',
      duration: 0.8,
      ease: 'power2.inOut'
    }, '-=0.3')
    .to(loaderName, {
      opacity: 0,
      y: -10,
      duration: 0.3,
      ease: 'power2.in'
    }, '+=0.1');
  }

  /* ---------- Scroll to Top Button ---------- */
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    });

    scrollTopBtn.addEventListener('click', () => {
      lenis.scrollTo(0, { duration: 1.5, ease: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    });
  }

    /* ---------- Projects & Achievements Category Filters ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const filterableCards = document.querySelectorAll('.project-card, .cert-card');

  if (filterBtns.length > 0 && filterableCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active class on buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filterValue = btn.getAttribute('data-filter') || 'all';
        
        filterableCards.forEach(card => {
          const category = card.getAttribute('data-category') || '';
          
          if (filterValue === 'all' || category.split(' ').includes(filterValue) || category.includes(filterValue)) {
            card.style.display = 'flex';
            card.style.opacity = '1';
            card.style.visibility = 'visible';
          } else {
            card.style.display = 'none';
            card.style.opacity = '0';
            card.style.visibility = 'hidden';
          }
        });

        if (window.ScrollTrigger) {
          ScrollTrigger.refresh();
        }
      });
    });
  }

  /* ---------- Project Case Study Modals ---------- */
    const projectDetailsData = {
    'medipredict': {
      title: "MediPredict — Hospital Data & Patient Outcome Prediction",
      category: "Healthcare Machine Learning",
      role: "Data Analyst & ML Developer",
      stack: "Python, Pandas, NumPy, Scikit-learn, Streamlit, Seaborn, SciPy",
      problem: "Healthcare providers face challenges predicting patient outcomes, length of stay (LOS), and readmission risk, leading to inefficient resource allocation and unoptimized patient care.",
      strategy: "Analyzed 984 hospital records using Pandas, NumPy, Seaborn & SciPy. Performed ANOVA, Kruskal-Wallis, Chi-Square statistical tests, and IQR outlier detection. Built a multi-task ML pipeline using Logistic Regression, Decision Trees, and KNN to predict 6 patient metrics: readmission, outcome, cost level, satisfaction, LOS category, and condition. Developed an interactive Streamlit cockpit with runtime model caching and majority-voting ensembling.",
      impact: [
        "Analyzed 984 hospital records across 6 outcome metrics.",
        "Engineered statistical ANOVA/Chi-Square tests with IQR outlier detection.",
        "Built dynamic Streamlit dashboard with majority-voting model ensembling."
      ],
      live: '#',
      code: "https://github.com/Srijan4920/MediPredict"
    },
    'smartexp': {
      title: "SmartExp AI — Intelligent Expense Tracker",
      category: "Financial AI + Web Application",
      role: "Full-Stack Data & ML Engineer",
      stack: "Python, Streamlit, Scikit-learn, Firebase Auth, Cloud Firestore, fpdf2, Pandas",
      problem: "Manual expense tracking lacks predictive financial foresight, automated overspending alerts, and automated PDF statement generation.",
      strategy: "Engineered a full-stack financial management app using Streamlit, Firebase Authentication, and Cloud Firestore. Implemented Scikit-learn Linear Regression to forecast 30-day spending trends from historical transaction data. Built interactive dashboards for category distributions, savings goals, overspending alerts, CSV bulk import, and automated PDF reporting via fpdf2.",
      impact: [
        "30-day spending trend forecasting using Scikit-learn Linear Regression.",
        "Firebase Auth & Cloud Firestore real-time transaction database.",
        "Automated PDF financial report generation using fpdf2 & Pandas."
      ],
      live: '#',
      code: "https://github.com/Srijan4920/Samrt_Expence_Tracker"
    },
    'hr-analytics': {
      title: "HR Analytics Dashboard — Power BI",
      category: "Power BI Analytics",
      role: "BI & Data Analyst",
      stack: "Power BI, DAX, Power Query, HR Metrics, Excel",
      problem: "Organizational HR leadership required visibility into employee attrition patterns, salary distributions, and department performance.",
      strategy: "Designed an interactive Power BI dashboard analyzing employee attrition, salary trends, workforce distribution, and departmental performance. Created custom KPIs and visualizations using DAX measures, filters, and slicers to support strategic decision-making.",
      impact: [
        "Uncovered key attrition drivers across departmental cohorts.",
        "Engineered custom DAX metrics for workforce compensation equity.",
        "Created interactive executive filter matrices."
      ],
      live: '#',
      code: "https://github.com/Srijan4920/POWER_BI/blob/main/Hr%20dashbord.pbix"
    },
    'credit-risk': {
      title: "Credit Risk Modelling",
      category: "Predictive ML Model",
      role: "Data Science Intern",
      stack: "Python, Logistic Regression, Scikit-learn, Seaborn, Pandas",
      problem: "Financial institutions require statistical risk scoring to predict loan defaults and evaluate borrower creditworthiness.",
      strategy: "Developed a Logistic Regression model for loan default prediction using extensive data preprocessing, feature engineering, and ROC-AUC evaluation metrics.",
      impact: [
        "Calibrated default risk probabilities for loan underwriting.",
        "Evaluated model performance using ROC-AUC, confusion matrix, and metrics."
      ],
      live: '#',
      code: "https://github.com/Srijan4920/AI_ML_Projects/tree/main/Loan_Classification_Project"
    },
    'fake-news': {
      title: "Fake News Detection System",
      category: "NLP Text Classification",
      role: "Machine Learning Developer",
      stack: "Python, TF-IDF Vectorizer, PassiveAggressive Classifier, Streamlit",
      problem: "Misinformation spreads rapidly online, requiring automated text classification models to evaluate news article credibility.",
      strategy: "Built a text classification system using TF-IDF vectorization and Passive-Aggressive Classifier for fake news detection. Deployed trained model through Streamlit for real-time text predictions.",
      impact: [
        "TF-IDF text vectorization and Passive-Aggressive Classification.",
        "Deployed real-time text credibility prediction app on Streamlit."
      ],
      live: '#',
      code: "https://github.com/Srijan4920/Data_Science/tree/main/TASK2"
    }
  };

  const projectModal = document.getElementById('projectModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const caseStudyBtns = document.querySelectorAll('.btn-case-study');

  if (projectModal && modalOverlay && modalCloseBtn && caseStudyBtns.length > 0) {
    // Open Modal
    caseStudyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const projectId = btn.getAttribute('data-project');
        const data = projectDetailsData[projectId];
        if (!data) return;

        // Populate Modal Fields
        document.getElementById('modalTitle').innerText = data.title;
        document.getElementById('modalCategory').innerText = data.category;
        document.getElementById('modalRole').innerText = data.role;
        document.getElementById('modalStack').innerText = data.stack;
        document.getElementById('modalProblem').innerText = data.problem;
        document.getElementById('modalStrategy').innerText = data.strategy;

        const impactContainer = document.getElementById('modalImpact');
        impactContainer.innerHTML = '';
        data.impact.forEach(item => {
          const div = document.createElement('div');
          div.style.cssText = "padding:12px; background:var(--bg-subtle); border:1px solid var(--border-color); border-radius:8px;";
          div.innerHTML = `
            <div style="font-size:0.75rem; color:var(--text-tertiary); margin-bottom:4px; display:flex; align-items:center; gap:4px;"><i data-lucide="check" style="width:12px; height:12px; color:#10b981;"></i> KPI Achieved</div>
            <div style="font-size:0.82rem; font-weight:600; color:var(--text-primary); line-height:1.4;">${item}</div>
          `;
          impactContainer.appendChild(div);
        });

        // Set Links
        const liveBtn = document.getElementById('modalLiveLink');
        const codeBtn = document.getElementById('modalCodeLink');

        if (data.live && data.live !== '#') {
          liveBtn.href = data.live;
          liveBtn.style.display = 'inline-flex';
        } else {
          liveBtn.style.display = 'none';
        }

        if (data.code && data.code !== '#') {
          codeBtn.href = data.code;
          codeBtn.style.display = 'inline-flex';
        } else {
          codeBtn.style.display = 'none';
        }

        // Initialize Lucide icons
        if (window.lucide) {
          window.lucide.createIcons({ node: projectModal });
        }

        // Show Modal
        projectModal.style.display = 'flex';
        projectModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        const navWrapper = document.querySelector('.nav-wrapper');
        if (navWrapper) navWrapper.style.display = 'none';
        
        // Stop Lenis background scroll
        if (window.lenis) window.lenis.stop();

        // Animate elements
        gsap.fromTo(modalOverlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo('.modal-wrapper', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.1, ease: 'power3.out' });
      });
    });

    // Close Modal Function
    const closeModal = () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      const navWrapper = document.querySelector('.nav-wrapper');
      if (navWrapper) navWrapper.style.display = '';
      if (window.lenis) window.lenis.start();
      gsap.to('.modal-wrapper', { y: 30, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => {
        projectModal.style.display = 'none';
        projectModal.setAttribute('aria-hidden', 'true');
      }});
      gsap.to(modalOverlay, { opacity: 0, duration: 0.3 });
    };

    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
  }

  /* ---------- Mumbai Live Clock Widget ---------- */
  const clockEl = document.getElementById('mumbaiTime');
  if (clockEl) {
    const updateClock = () => {
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      clockEl.textContent = formatter.format(new Date());
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  /* ---------- Command Palette Modal Interaction ---------- */
  const cmdPalette = document.getElementById('cmdPalette');
  const cmdOverlay = document.getElementById('cmdOverlay');
  const cmdSearchInput = document.getElementById('cmdSearchInput');
  const cmdItems = document.querySelectorAll('.cmd-palette-item');

  if (cmdPalette && cmdSearchInput) {
    let activeIndex = 0;

    const showPalette = () => {
      // Clear input
      cmdSearchInput.value = '';
      cmdItems.forEach(item => item.style.display = 'flex');

      cmdPalette.style.display = 'flex';
      cmdPalette.classList.add('open');
      cmdPalette.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      const navWrapper = document.querySelector('.nav-wrapper');
      if (navWrapper) navWrapper.style.display = 'none';
      if (window.lenis) window.lenis.stop();
      
      setTimeout(() => cmdSearchInput.focus(), 50);
      activeIndex = 0;
      updateActiveItem();
    };

    const hidePalette = () => {
      cmdPalette.classList.remove('open');
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      const navWrapper = document.querySelector('.nav-wrapper');
      if (navWrapper) navWrapper.style.display = '';
      
      setTimeout(() => {
        cmdPalette.style.display = 'none';
        cmdPalette.setAttribute('aria-hidden', 'true');
        if (window.lenis) window.lenis.start();
      }, 300);
    };

    // Keyboard trigger: Cmd+K / Ctrl+K
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (cmdPalette.classList.contains('open')) {
          hidePalette();
        } else {
          showPalette();
        }
      }
    });

    if (cmdOverlay) cmdOverlay.addEventListener('click', hidePalette);

    // Escape closes palette
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && cmdPalette.classList.contains('open')) {
        hidePalette();
      }
    });

    // Live filtering
    cmdSearchInput.addEventListener('input', () => {
      const val = cmdSearchInput.value.toLowerCase().trim();
      cmdItems.forEach(item => {
        const titleEl = item.querySelector('.cmd-palette-item-title');
        const text = titleEl ? titleEl.textContent.toLowerCase() : item.textContent.toLowerCase();
        if (text.includes(val)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
      activeIndex = 0;
      updateActiveItem();
    });

    // Arrow keys + Enter navigation
    window.addEventListener('keydown', (e) => {
      if (!cmdPalette.classList.contains('open')) return;

      const visibleItems = Array.from(cmdItems).filter(item => item.style.display !== 'none');
      if (visibleItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % visibleItems.length;
        updateActiveItem();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + visibleItems.length) % visibleItems.length;
        updateActiveItem();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        visibleItems[activeIndex].click();
      }
    });

    const updateActiveItem = () => {
      const visibleItems = Array.from(cmdItems).filter(item => item.style.display !== 'none');
      cmdItems.forEach(item => item.classList.remove('active'));
      if (visibleItems[activeIndex]) {
        visibleItems[activeIndex].classList.add('active');
        visibleItems[activeIndex].scrollIntoView({ block: 'nearest' });
      }
    };

    // Click handler for item actions
    cmdItems.forEach(item => {
      item.addEventListener('click', () => {
        const action = item.getAttribute('data-action');
        const target = item.getAttribute('data-target');

        hidePalette();

        if (action === 'nav' && target) {
          const el = document.querySelector(target);
          if (el && window.lenis) {
            setTimeout(() => window.lenis.scrollTo(el, { offset: -60 }), 350);
          }
        } else if (action === 'theme') {
          const themeToggle = document.getElementById('themeToggle');
          if (themeToggle) {
            setTimeout(() => themeToggle.click(), 350);
          }
        } else if (action === 'resume') {
          window.open('assets/resume.pdf', '_blank');
        }
      });
    });

    // Alt + number shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.altKey) {
        if (e.key >= '1' && e.key <= '6') {
          e.preventDefault();
          const navItems = Array.from(cmdItems).filter(item => item.getAttribute('data-action') === 'nav');
          const index = parseInt(e.key, 10) - 1;
          if (navItems[index]) navItems[index].click();
        } else if (e.key.toLowerCase() === 't') {
          e.preventDefault();
          const themeItem = Array.from(cmdItems).find(item => item.getAttribute('data-action') === 'theme');
          if (themeItem) themeItem.click();
        } else if (e.key.toLowerCase() === 'r') {
          e.preventDefault();
          const resumeItem = Array.from(cmdItems).find(item => item.getAttribute('data-action') === 'resume');
          if (resumeItem) resumeItem.click();
        }
      }
    });
  }

  /* ---------- Run Everything ---------- */
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', runLoader);
  } else {
    runLoader();
  }

  /* ---------- Safety: Force-dismiss loader after 5s ---------- */
  setTimeout(() => {
    const loader = document.getElementById('pageLoader');
    if (loader && loader.style.display !== 'none') {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.4s ease';
      setTimeout(() => {
        loader.style.display = 'none';
        if (window.initAnimations) window.initAnimations();
      }, 400);
    }
  }, 2500);

})();
