// ==========================================
// SURESTART WEBSITE - ENHANCED INTERACTIONS
// Luxury interactions with smooth animations
// ==========================================

(function() {
  'use strict';

  // ==========================================
  // INTERSECTION OBSERVER FOR FADE-UP ANIMATIONS
  // ==========================================
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all fade-up elements
  function initScrollAnimations() {
    const elements = document.querySelectorAll('.fade-up');
    elements.forEach(el => observer.observe(el));
  }

  // ==========================================
  // NAVIGATION ENHANCEMENT
  // ==========================================
  
  function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Navbar scroll effect
    let lastScrollTop = 0;
    const scrollThreshold = 100;
    
    function handleNavbarScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Add/remove scrolled class for styling
      if (scrollTop > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      
      // Hide/show navbar on scroll (optional luxury touch)
      if (scrollTop > scrollThreshold) {
        if (scrollTop > lastScrollTop && scrollTop > 200) {
          // Scrolling down
          navbar.style.transform = 'translateY(-100%)';
        } else {
          // Scrolling up
          navbar.style.transform = 'translateY(0)';
        }
      }
      
      lastScrollTop = scrollTop;
    }
    
    // Smooth scroll for navigation links
    function initSmoothScroll() {
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          
          if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
              const offsetTop = target.offsetTop - 80; // Account for fixed nav
              
              window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
              });
              
              // Close mobile menu if open
              if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
              }
            }
          }
        });
      });
    }
    
    // Mobile menu toggle
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('nav-open');
      });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.classList.remove('nav-open');
      }
    });
    
    // Initialize components
    initSmoothScroll();
    
    // Throttled scroll handler
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleNavbarScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ==========================================
  // ENHANCED BUTTON INTERACTIONS
  // ==========================================
  
  function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
      // Add ripple effect on click
      button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
      
      // Enhanced hover effects
      button.addEventListener('mouseenter', function() {
        this.style.setProperty('--hover-scale', '1.02');
      });
      
      button.addEventListener('mouseleave', function() {
        this.style.removeProperty('--hover-scale');
      });
    });
  }

  // ==========================================
  // FLOATING CARDS PARALLAX EFFECT
  // ==========================================
  
  function initFloatingCards() {
    const floatingCards = document.querySelectorAll('.floating-card');
    
    if (floatingCards.length === 0) return;
    
    function updateCardPositions() {
      const scrolled = window.pageYOffset;
      const viewportHeight = window.innerHeight;
      
      floatingCards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distanceFromCenter = (cardCenter - viewportHeight / 2) / viewportHeight;
        
        // Apply subtle parallax movement
        const moveX = distanceFromCenter * 20 * (index % 2 === 0 ? 1 : -1);
        const moveY = distanceFromCenter * 15;
        
        card.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    }
    
    // Throttled scroll handler for performance
    let cardTicking = false;
    window.addEventListener('scroll', () => {
      if (!cardTicking) {
        requestAnimationFrame(() => {
          updateCardPositions();
          cardTicking = false;
        });
        cardTicking = true;
      }
    });
  }

  // ==========================================
  // TESTIMONIAL CARD INTERACTION
  // ==========================================
  
  function initTestimonialEffects() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    testimonialCards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px) scale(1.02)';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
      });
    });
  }

  // ==========================================
  // STATS COUNTER ANIMATION
  // ==========================================
  
  function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');
    const animatedStats = new Set();
    
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animatedStats.has(entry.target)) {
          animatedStats.add(entry.target);
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    function animateCounter(element) {
      const target = element.textContent;
      const isPercentage = target.includes('%');
      const isPlusSign = target.includes('+');
      const numericValue = parseInt(target.replace(/[^\d]/g, ''));
      
      let current = 0;
      const increment = numericValue / 60; // 60 frames for 1 second at 60fps
      const duration = 2000; // 2 seconds
      const frameDuration = duration / 60;
      
      function updateCounter() {
        current += increment;
        
        if (current >= numericValue) {
          current = numericValue;
          
          if (isPercentage) {
            element.textContent = current + '%';
          } else if (isPlusSign) {
            element.textContent = current.toLocaleString() + '+';
          } else {
            element.textContent = current.toLocaleString();
          }
        } else {
          const displayValue = Math.floor(current);
          
          if (isPercentage) {
            element.textContent = displayValue + '%';
          } else if (isPlusSign) {
            element.textContent = displayValue.toLocaleString() + '+';
          } else {
            element.textContent = displayValue.toLocaleString();
          }
          
          setTimeout(updateCounter, frameDuration);
        }
      }
      
      updateCounter();
    }
    
    stats.forEach(stat => statsObserver.observe(stat));
  }

  // ==========================================
  // LOGO MARQUEE ENHANCEMENT
  // ==========================================
  
  function initLogoMarquee() {
    const marquees = document.querySelectorAll('.logo-marquee');
    
    marquees.forEach(marquee => {
      const track = marquee.querySelector('.logo-track');
      
      if (!track) return;
      
      // Pause animation on hover for better UX
      marquee.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused';
      });
      
      marquee.addEventListener('mouseleave', () => {
        track.style.animationPlayState = 'running';
      });
      
      // Add subtle hover effects to individual logos
      const logos = marquee.querySelectorAll('.logo-item img');
      logos.forEach(logo => {
        logo.addEventListener('mouseenter', function() {
          this.style.filter = 'grayscale(0) opacity(1) brightness(1.1)';
        });
        
        logo.addEventListener('mouseleave', function() {
          this.style.filter = 'grayscale(0.3) opacity(0.8)';
        });
      });
    });
  }

  // ==========================================
  // ENHANCED CARD HOVER EFFECTS
  // ==========================================
  
  function initCardEffects() {
    const cards = document.querySelectorAll('.mission-card, .track, .testimonial-card');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.style.setProperty('--mouse-x', x + 'px');
        this.style.setProperty('--mouse-y', y + 'px');
      });
      
      card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.style.setProperty('--mouse-x', x + 'px');
        this.style.setProperty('--mouse-y', y + 'px');
      });
    });
  }

  // ==========================================
  // PERFORMANCE OPTIMIZATIONS
  // ==========================================
  
  // Debounce function for resize events
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Handle resize events
  const handleResize = debounce(() => {
    // Recalculate any position-dependent elements
    initFloatingCards();
  }, 250);
  
  window.addEventListener('resize', handleResize);

  // ==========================================
  // PRELOADER (OPTIONAL LUXURY TOUCH)
  // ==========================================
  
  function initPreloader() {
    // Create a simple, elegant preloader
    const preloader = document.createElement('div');
    preloader.className = 'preloader';
    preloader.innerHTML = `
      <div class="preloader-content">
        <div class="preloader-logo">
          <img src="static/images/SureStart_Standard Logo (1).png" alt="SureStart" />
        </div>
        <div class="preloader-spinner"></div>
      </div>
    `;
    
    // Add preloader styles
    const style = document.createElement('style');
    style.textContent = `
      .preloader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--surface-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 1;
        transition: opacity 0.6s ease;
      }
      
      .preloader-content {
        text-align: center;
      }
      
      .preloader-logo img {
        height: 60px;
        margin-bottom: 2rem;
        opacity: 0;
        animation: fadeInUp 0.8s ease forwards;
      }
      
      .preloader-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--border-subtle);
        border-top: 3px solid var(--primary-terracotta);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto;
      }
      
      @keyframes fadeInUp {
        to {
          opacity: 1;
          transform: translateY(0);
        }
        from {
          opacity: 0;
          transform: translateY(20px);
        }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .preloader.fade-out {
        opacity: 0;
        pointer-events: none;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(preloader);
    
    // Remove preloader when page is loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
          preloader.remove();
          style.remove();
        }, 600);
      }, 800); // Show for at least 800ms for smooth experience
    });
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================
  
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    // Initialize all components
    try {
      initScrollAnimations();
      initNavigation();
      initButtonEffects();
      initFloatingCards();
      initTestimonialEffects();
      initStatsCounter();
      initLogoMarquee();
      initCardEffects();
      
      // Optional: Add preloader for luxury feel
      // initPreloader();
      
      console.log('✨ SureStart website initialized successfully');
    } catch (error) {
      console.error('Error initializing website:', error);
    }
  }

  // Start initialization
  init();

  // ==========================================
  // GLOBAL ACCESSIBILITY ENHANCEMENTS
  // ==========================================
  
  // Add focus management for keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
  });
  
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
  });
  
  // Add keyboard navigation styles
  const keyboardStyles = document.createElement('style');
  keyboardStyles.textContent = `
    body:not(.keyboard-navigation) *:focus {
      outline: none;
    }
    
    .keyboard-navigation *:focus {
      outline: 2px solid var(--primary-terracotta);
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(keyboardStyles);

})();
