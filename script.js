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
      // Removed problematic ripple effect that was causing button expansion
      // The CSS already handles proper hover effects for buttons
      
      // Add subtle click feedback without DOM manipulation
      button.addEventListener('click', function(e) {
        // Add a brief visual feedback class
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
          this.style.transform = '';
        }, 150);
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
  // STUDENT IMPACT STATISTICS ANIMATION
  // ==========================================
  
  function initStudentImpactStats() {
    const statisticNumbers = document.querySelectorAll('.statistic-number[data-target]');
    const animatedStatistics = new Set();
    
    const statisticsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animatedStatistics.has(entry.target)) {
          animatedStatistics.add(entry.target);
          animateStatistic(entry.target);
        }
      });
    }, { threshold: 0.3 });
    
    function animateStatistic(element) {
      const target = parseInt(element.getAttribute('data-target'));
      const originalText = element.textContent;
      const isPercentage = originalText.includes('%');
      const isPlusSign = originalText.includes('+');
      
      // Add counting class for CSS animation
      element.classList.add('counting');
      
      let current = 0;
      const duration = 2500; // 2.5 seconds
      const steps = 60;
      const increment = target / steps;
      const stepDuration = duration / steps;
      
      // Add icon animation
      const card = element.closest('.statistic-card');
      const icon = card?.querySelector('.statistic-icon');
      if (icon) {
        icon.style.animation = 'pulse 0.6s ease-in-out';
      }
      
      function updateStatistic() {
        current += increment;
        
        if (current >= target) {
          current = target;
          
          // Final value
          if (isPercentage) {
            element.textContent = Math.round(current) + '%';
          } else if (isPlusSign) {
            element.textContent = Math.round(current).toLocaleString() + '+';
          } else {
            element.textContent = Math.round(current).toLocaleString();
          }
          
          // Remove counting class
          element.classList.remove('counting');
          
          // Add completion effect
          element.style.transform = 'scale(1.1)';
          setTimeout(() => {
            element.style.transform = 'scale(1)';
          }, 200);
          
        } else {
          const displayValue = Math.floor(current);
          
          if (isPercentage) {
            element.textContent = displayValue + '%';
          } else if (isPlusSign) {
            element.textContent = displayValue.toLocaleString() + '+';
          } else {
            element.textContent = displayValue.toLocaleString();
          }
          
          requestAnimationFrame(() => {
            setTimeout(updateStatistic, stepDuration);
          });
        }
      }
      
      // Start animation after a small delay for better visual effect
      setTimeout(() => {
        updateStatistic();
      }, 200);
    }
    
    // Observe all statistic numbers
    statisticNumbers.forEach(stat => {
      statisticsObserver.observe(stat);
    });
    
    // Add CSS animation for pulse effect
    if (!document.querySelector('#statistic-animations')) {
      const style = document.createElement('style');
      style.id = 'statistic-animations';
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .statistic-number.counting {
          color: var(--ss-accent-1);
          text-shadow: 0 0 10px rgba(102, 72, 64, 0.3);
        }
        
        .statistic-card:hover .statistic-icon {
          animation: pulse 0.6s ease-in-out;
        }
      `;
      document.head.appendChild(style);
    }
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
  // CTA SECTION ENHANCEMENTS
  // ==========================================
  
  function initCTAEffects() {
    const ctaSection = document.querySelector('.cta-section');
    const ctaContent = document.querySelector('.cta-content');
    const ctaFeatures = document.querySelectorAll('.cta-feature');
    const ctaButtons = document.querySelectorAll('.cta-actions .btn');
    
    if (!ctaSection) return;
    
    // Enhanced mouse parallax effect for CTA decorative elements
    function initCTAParallax() {
      const decorativeElements = document.querySelectorAll('.cta-decorative');
      
      ctaSection.addEventListener('mousemove', (e) => {
        const rect = ctaSection.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        decorativeElements.forEach((element, index) => {
          const intensity = (index + 1) * 0.5;
          const moveX = (x - 0.5) * intensity * 20;
          const moveY = (y - 0.5) * intensity * 20;
          
          element.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
      });
      
      ctaSection.addEventListener('mouseleave', () => {
        decorativeElements.forEach(element => {
          element.style.transform = '';
        });
      });
    }
    
    // Animate CTA features on scroll
    function animateCTAFeatures() {
      const featuresObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const features = entry.target.querySelectorAll('.cta-feature');
            features.forEach((feature, index) => {
              setTimeout(() => {
                feature.style.transform = 'translateY(0) scale(1)';
                feature.style.opacity = '1';
              }, index * 100);
            });
            featuresObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      
      const featuresContainer = document.querySelector('.cta-features');
      if (featuresContainer) {
        // Set initial state
        ctaFeatures.forEach(feature => {
          feature.style.transform = 'translateY(20px) scale(0.9)';
          feature.style.opacity = '0';
          feature.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        });
        
        featuresObserver.observe(featuresContainer);
      }
    }
    
    // Enhanced button interactions for CTA
    function enhanceCTAButtons() {
      ctaButtons.forEach((button, index) => {
        // Add dynamic loading state effect
        button.addEventListener('click', function(e) {
          if (this.getAttribute('href').startsWith('mailto:')) {
            return; // Let email links work normally
          }
          
          // Allow navigation to contact page with parameters
          if (this.getAttribute('href') && 
              (this.getAttribute('href').includes('contact-us.html') || 
               this.getAttribute('href').includes('#contact'))) {
            return; // Let contact page links work normally
          }
          
          e.preventDefault();
          
          const originalText = this.innerHTML;
          const buttonText = this.querySelector('span');
          
          if (buttonText) {
            buttonText.textContent = 'Loading...';
            this.style.opacity = '0.7';
            this.style.pointerEvents = 'none';
            
            setTimeout(() => {
              buttonText.textContent = index === 0 ? 'Get Started Today' : 'Download Brochure';
              this.style.opacity = '1';
              this.style.pointerEvents = 'auto';
              
              // Simulate action completion
              if (index === 1) {
                // For brochure download, show success message
                showCTAMessage('Brochure download started!', 'success');
              }
            }, 1500);
          }
        });
        
        // Add sophisticated hover effects
        button.addEventListener('mouseenter', function() {
          this.style.setProperty('--button-glow', '0 0 20px rgba(193, 122, 91, 0.3)');
        });
        
        button.addEventListener('mouseleave', function() {
          this.style.removeProperty('--button-glow');
        });
      });
    }
    
    // CTA success/info message system
    function showCTAMessage(message, type = 'info') {
      const messageEl = document.createElement('div');
      messageEl.className = `cta-message cta-message-${type}`;
      messageEl.innerHTML = `
        <div class="cta-message-content">
          <span class="cta-message-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
          <span class="cta-message-text">${message}</span>
        </div>
      `;
      
      // Add styles for the message
      const messageStyles = `
        .cta-message {
          position: fixed;
          top: 100px;
          right: 20px;
          background: white;
          border-radius: 12px;
          padding: 16px 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          border-left: 4px solid var(--primary-terracotta);
          z-index: 10000;
          transform: translateX(400px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .cta-message.show {
          transform: translateX(0);
        }
        
        .cta-message-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .cta-message-icon {
          width: 24px;
          height: 24px;
          background: var(--primary-terracotta);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
        }
        
        .cta-message-text {
          color: var(--text-primary);
          font-weight: 500;
          font-size: 14px;
        }
        
        .cta-message-success .cta-message-icon {
          background: #22c55e;
        }
      `;
      
      if (!document.querySelector('#cta-message-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'cta-message-styles';
        styleEl.textContent = messageStyles;
        document.head.appendChild(styleEl);
      }
      
      document.body.appendChild(messageEl);
      
      setTimeout(() => messageEl.classList.add('show'), 100);
      
      setTimeout(() => {
        messageEl.classList.remove('show');
        setTimeout(() => messageEl.remove(), 400);
      }, 3000);
    }
    
    // Enhanced feature icon animations
    function initFeatureIconEffects() {
      ctaFeatures.forEach(feature => {
        const icon = feature.querySelector('.cta-feature-icon');
        
        feature.addEventListener('mouseenter', () => {
          if (icon) {
            icon.style.transform = 'scale(1) rotate(0deg)';
          }
        });
        
        feature.addEventListener('mouseleave', () => {
          if (icon) {
            icon.style.transform = 'scale(1) rotate(0deg)';
            // Remove the color change - keep original colors
            icon.style.background = '';
          }
        });
      });
    }
    
    // Initialize all CTA effects
    initCTAParallax();
    animateCTAFeatures();
    enhanceCTAButtons();
    initFeatureIconEffects();
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
  // PROGRAM FLIP CARDS
  // ==========================================
  
  function initFlipCards() {
    const flipCards = document.querySelectorAll('.program-flip-card');
    
    if (flipCards.length === 0) return;
    
    flipCards.forEach((card, index) => {
      let isFlipped = false;
      
      // Add tabindex for keyboard accessibility
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Learn more about ${card.querySelector('h3').textContent}`);
      
      // Click/Touch handler
      function handleFlip(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Toggle flip state
        isFlipped = !isFlipped;
        
        if (isFlipped) {
          card.classList.add('flipped');
          card.setAttribute('aria-expanded', 'true');
        } else {
          card.classList.remove('flipped');
          card.setAttribute('aria-expanded', 'false');
        }
        
        // Add subtle haptic feedback on mobile (if supported)
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
      
      // Keyboard handler
      function handleKeyboard(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleFlip(e);
        }
        
        // Escape key to flip back
        if (e.key === 'Escape' && isFlipped) {
          isFlipped = false;
          card.classList.remove('flipped');
          card.setAttribute('aria-expanded', 'false');
        }
      }
      
      // Mouse leave handler (for desktop)
      function handleMouseLeave() {
        // Only auto-flip back on desktop hover
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          setTimeout(() => {
            if (!card.matches(':hover') && isFlipped) {
              isFlipped = false;
              card.classList.remove('flipped');
              card.setAttribute('aria-expanded', 'false');
            }
          }, 300);
        }
      }
      
      // Touch and mouse event listeners
      card.addEventListener('click', handleFlip);
      card.addEventListener('keydown', handleKeyboard);
      card.addEventListener('mouseleave', handleMouseLeave);
      
      // Enhanced focus management
      card.addEventListener('focus', () => {
        card.style.outline = '2px solid var(--ss-accent-1)';
        card.style.outlineOffset = '2px';
      });
      
      card.addEventListener('blur', () => {
        card.style.outline = '';
        card.style.outlineOffset = '';
      });
      
      // Intersection observer for entrance animations
      const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }, index * 150); // Stagger animation
            cardObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      // Set initial state for animation
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      
      cardObserver.observe(card);
    });
    
    // Handle clicks outside flip cards to close them (optional UX enhancement)
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.program-flip-card')) {
        flipCards.forEach(card => {
          if (card.classList.contains('flipped')) {
            card.classList.remove('flipped');
            card.setAttribute('aria-expanded', 'false');
          }
        });
      }
    });
    
    // Handle orientation change on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        // Reset any flipped cards on orientation change for better UX
        flipCards.forEach(card => {
          if (card.classList.contains('flipped')) {
            card.classList.remove('flipped');
            card.setAttribute('aria-expanded', 'false');
          }
        });
      }, 100);
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
      initStudentImpactStats(); // Add student impact statistics animation
      initLogoMarquee();
      initCardEffects();
      initCTAEffects();
      initFlipCards(); // Add flip cards initialization
      
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
