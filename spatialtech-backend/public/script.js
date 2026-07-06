/* ============================================================
   SPATIAL HEIGHTS TECHNOLOGIES — Interactive Scripts
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Logo Preloader ----------
  const preloader = document.querySelector('.logo-preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('fade-out');
    }, 800);
  }

  // ---------- Navbar Scroll Behavior ----------
  const navbar = document.querySelector('.navbar');
  // On sub-pages, navbar starts with .scrolled class; on homepage, it toggles
  const isHomepage = document.querySelector('.hero') !== null;

  const handleNavScroll = () => {
    if (isHomepage) {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    // Sub-pages always keep .scrolled
  };
  window.addEventListener('scroll', handleNavScroll);
  handleNavScroll();

  // ---------- Mobile Menu Toggle ----------
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ---------- Smooth Scrolling (for anchor links only) ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return; // skip placeholder links
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ---------- Scroll Animations (Intersection Observer) ----------
  const animatedElements = document.querySelectorAll('.fade-up, .fade-left, .fade-right');
  if (animatedElements.length > 0) {
    const animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            animationObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    animatedElements.forEach((el, index) => {
      el.style.transitionDelay = `${index % 3 * 0.1}s`;
      animationObserver.observe(el);
    });
  }

  // ---------- Animated Stat Counters ----------
  const counters = document.querySelectorAll('[data-count]');
  let countersAnimated = false;

  const animateCounters = () => {
    if (countersAnimated) return;
    countersAnimated = true;

    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-count'));
      const suffix = counter.getAttribute('data-suffix') || '';
      const duration = 2000;
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        const current = Math.floor(eased * target);

        counter.textContent = current + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target + suffix;
        }
      };

      requestAnimationFrame(updateCounter);
    });
  };

  // Try multiple counter trigger elements (works on both homepage and about page)
  const counterTriggers = document.querySelectorAll('.about-image-overlay, .hero-stats');
  counterTriggers.forEach(trigger => {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounters();
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counterObserver.observe(trigger);
  });

  // ---------- Project Filtering ----------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.classList.remove('hidden');
            card.style.animation = 'fadeInUp 0.4s ease forwards';
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  // ---------- FAQ Accordion ----------
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length > 0) {
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all FAQ items
        faqItems.forEach(i => i.classList.remove('active'));

        // Open clicked item if it wasn't already open
        if (!isActive) {
          item.classList.add('active');
          question.setAttribute('aria-expanded', 'true');
        }

        // Update aria-expanded on all
        faqItems.forEach(i => {
          const q = i.querySelector('.faq-question');
          q.setAttribute('aria-expanded', i.classList.contains('active') ? 'true' : 'false');
        });
      });
    });
  }

  // ---------- Contact Form — Dual Delivery (Web3Forms + Backend API) ----------
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = contactForm.querySelector('#name').value.trim();
      const email = contactForm.querySelector('#email').value.trim();
      const phone = contactForm.querySelector('#phone')?.value.trim() || '';
      const organization = contactForm.querySelector('#organization')?.value.trim() || '';
      const countryEl = contactForm.querySelector('#country');
      const country = countryEl ? countryEl.value : '';
      const serviceEl = contactForm.querySelector('#subject');
      const service = serviceEl ? serviceEl.options[serviceEl.selectedIndex]?.text || '' : '';
      const message = contactForm.querySelector('#message').value.trim();

      if (!name || !email || !message) {
        showNotification('Please fill in all required fields.', 'error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
      }

      const submitBtn = contactForm.querySelector('.form-submit');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      let emailSent = false;
      let savedToDb = false;

      // ── 1) PRIMARY: Send email via Web3Forms (free, instant, no setup) ──
      try {
        const web3Response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key: 'dca45357-90de-4630-86ad-d70dbf611e14',
            subject: `New Contact: ${name} — ${service || 'General Inquiry'}`,
            from_name: 'Spatial Heights Website',
            to: 'info@spatialheightstech.com',
            name: name,
            email: email,
            phone: phone || 'N/A',
            organization: organization || 'N/A',
            country: country || 'N/A',
            service: service || 'N/A',
            message: message
          })
        });
        const web3Data = await web3Response.json();
        emailSent = web3Data.success === true;
        if (emailSent) {
          console.log('✅ Email sent via Web3Forms');
        } else {
          console.warn('⚠️ Web3Forms response:', web3Data);
        }
      } catch (web3Err) {
        console.error('Web3Forms error:', web3Err);
      }

      // ── 2) BACKUP: Send via FormSubmit.co ──
      if (!emailSent) {
        try {
          const fsResponse = await fetch('https://formsubmit.co/ajax/info@spatialheightstech.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
              _subject: `New Contact: ${name} — ${service || 'General Inquiry'}`,
              Name: name,
              Email: email,
              Phone: phone || 'N/A',
              Organization: organization || 'N/A',
              Country: country || 'N/A',
              Service: service || 'N/A',
              Message: message
            })
          });
          const fsData = await fsResponse.json();
          emailSent = fsData.success === 'true' || fsData.success === true;
          if (emailSent) console.log('✅ Email sent via FormSubmit');
        } catch (fsErr) {
          console.error('FormSubmit error:', fsErr);
        }
      }

      // ── 3) ALWAYS: Save to backend database ──
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, organization, country, service, message })
        });
        const data = await response.json();
        savedToDb = data.success === true;
        if (savedToDb) console.log('✅ Contact saved to database');
      } catch (apiErr) {
        console.error('Backend API error:', apiErr);
      }

      // ── Show result to user ──
      if (emailSent || savedToDb) {
        showNotification('Thank you! Your message has been sent successfully. We will get back to you shortly.', 'success');
        contactForm.reset();
      } else {
        showNotification('Something went wrong. Please try again or email us directly at info@spatialheightstech.com', 'error');
      }

      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
  }

  function showNotification(message, type) {
    const existing = document.querySelector('.form-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `form-notification ${type}`;
    notification.innerHTML = `
      <span>${message}</span>
    `;
    notification.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      padding: 16px 28px;
      border-radius: 10px;
      font-family: 'Work Sans', sans-serif;
      font-size: 0.9rem;
      font-weight: 500;
      color: #fff;
      background: ${type === 'success' ? 'linear-gradient(135deg, #0e7490, #0d3b4f)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
      box-shadow: 0 8px 30px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.4s ease;
    `;

    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.4s ease forwards';
      setTimeout(() => notification.remove(), 400);
    }, 4000);
  }

  // ---------- Hero Canvas — Geospatial Grid Animation ----------
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animId;

    function resizeCanvas() {
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    }

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.5 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > width) this.speedX *= -1;
        if (this.y < 0 || this.y > height) this.speedY *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(57, 255, 20, ${this.opacity})`;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      const count = Math.floor((width * height) / 8000);
      for (let i = 0; i < Math.min(count, 120); i++) {
        particles.push(new Particle());
      }
    }

    function drawGrid() {
      ctx.strokeStyle = 'rgba(14, 116, 144, 0.08)';
      ctx.lineWidth = 0.5;

      const spacing = 60;
      for (let x = 0; x < width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 229, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      drawGrid();

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      drawConnections();
      animId = requestAnimationFrame(animate);
    }

    resizeCanvas();
    initParticles();
    animate();

    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });
  }

  // ---------- CSS Keyframes for Notifications ----------
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  if (isHomepage) {
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a');

    const highlightNav = () => {
      const scrollPos = window.scrollY + 150;

      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
          navItems.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `index.html#${id}` || href === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    };

    window.addEventListener('scroll', highlightNav);
  }

  // ---------- Photorealistic 3D Earth Implementation ----------
  const globeContainer = document.getElementById('heroGlobe');
  if (globeContainer && isHomepage && typeof THREE !== 'undefined') {
    globeContainer.innerHTML = '';
    
    const scene = new THREE.Scene();
    const width = globeContainer.offsetWidth;
    const height = globeContainer.offsetHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 2.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    globeContainer.appendChild(renderer.domElement);

    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const textureLoader = new THREE.TextureLoader();
    // High-res earth texture
    const earthMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
    const bumpMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');
    
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthMap,
      bumpMap: bumpMap,
      bumpScale: 0.05,
      specular: new THREE.Color('grey')
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earth);

    // Atmosphere glow
    const atmosGeometry = new THREE.SphereGeometry(1.03, 64, 64);
    const atmosMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color('#00d4ff'),
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmosphere = new THREE.Mesh(atmosGeometry, atmosMaterial);
    earthGroup.add(atmosphere);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    const backLight = new THREE.DirectionalLight(0x00d4ff, 0.5);
    backLight.position.set(-5, -3, -5);
    scene.add(backLight);

    // Responsive
    window.addEventListener('resize', () => {
      const newWidth = globeContainer.offsetWidth;
      const newHeight = globeContainer.offsetHeight;
      if (newWidth && newHeight) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    });

    // Interaction
    let isDragging = false;
    let previousMouseX = 0;
    let targetRotationY = 0;
    let currentRotationY = 0;

    const onDown = (e) => {
      isDragging = true;
      previousMouseX = e.touches ? e.touches[0].clientX : e.clientX;
    };
    const onMove = (e) => {
      if (!isDragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const deltaX = x - previousMouseX;
      targetRotationY += deltaX * 0.005;
      previousMouseX = x;
    };
    const onUp = () => { isDragging = false; };

    globeContainer.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    globeContainer.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);

    const animate = () => {
      requestAnimationFrame(animate);

      // Auto-rolling (rotating)
      const autoRotateSpeed = 0.002;
      earthGroup.rotation.y += autoRotateSpeed;

      // Drag influence
      const dragDelta = (targetRotationY - currentRotationY) * 0.1;
      earthGroup.rotation.y += dragDelta;
      currentRotationY += dragDelta;

      renderer.render(scene, camera);
    };
    animate();
  }

  // ---------- Populate Country Dropdown ----------
  const countrySelect = document.getElementById('country');
  if (countrySelect) {
    const loadCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name');
        const data = await response.json();

        // Sort countries alphabetically
        const countries = data.map(c => c.name.common).sort();

        countries.forEach(country => {
          const option = document.createElement('option');
          option.value = country;
          option.textContent = country;
          countrySelect.appendChild(option);
        });
      } catch (error) {
        console.error('Error fetching countries:', error);
        // Fallback to major countries if API fails
        const fallbackCountries = ["Nigeria", "Ghana", "South Africa", "Kenya", "United Kingdom", "United States", "Canada", "Germany", "France", "China", "India", "Australia"];
        fallbackCountries.forEach(country => {
          const option = document.createElement('option');
          option.value = country;
          option.textContent = country;
          countrySelect.appendChild(option);
        });
      }
    };
    loadCountries();
  }

  // ---------- Back to Top Button ----------
  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  `;
  document.body.appendChild(backToTop);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
