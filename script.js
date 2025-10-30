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
  // TESTIMONIALS CAROUSEL
  // ==========================================
  
  function initTestimonialsCarousel() {
    const carousels = document.querySelectorAll('.testimonials-carousel');
    
    carousels.forEach(carousel => {
      const track = carousel.querySelector('.testimonials-track');
      const dots = carousel.querySelectorAll('.testimonial-dot');
      const cards = carousel.querySelectorAll('.testimonial-case-card');
      
      if (!track || !dots.length || !cards.length) return;
      
      let currentSlide = 0;
      const totalSlides = cards.length;
      
      // Function to update carousel position
      function updateCarousel(slideIndex, animate = true) {
        if (slideIndex < 0) slideIndex = totalSlides - 1;
        if (slideIndex >= totalSlides) slideIndex = 0;
        
        currentSlide = slideIndex;
        
        // Update track position
        const translateX = -slideIndex * 100;
        if (animate) {
          track.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        } else {
          track.style.transition = 'none';
        }
        track.style.transform = `translateX(${translateX}%)`;
        
        // Update dots
        dots.forEach((dot, index) => {
          dot.classList.toggle('active', index === currentSlide);
          dot.setAttribute('aria-selected', index === currentSlide ? 'true' : 'false');
        });
        
        // Update ARIA attributes
        cards.forEach((card, index) => {
          card.setAttribute('aria-hidden', index !== currentSlide ? 'true' : 'false');
          if (index === currentSlide) {
            card.setAttribute('tabindex', '0');
          } else {
            card.setAttribute('tabindex', '-1');
          }
        });
      }
      
      // Dot click handlers
      dots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
          e.preventDefault();
          updateCarousel(index);
        });
        
        // Keyboard support for dots
        dot.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            updateCarousel(index);
          }
        });
      });
      
      // Touch/swipe support for mobile
      let startX = 0;
      let currentX = 0;
      let isDragging = false;
      let startTime = 0;
      
      track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        currentX = startX;
        startTime = Date.now();
        isDragging = true;
        track.style.transition = 'none';
      });
      
      track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        currentX = e.touches[0].clientX;
        const diffX = currentX - startX;
        const currentTranslateX = -currentSlide * 100;
        const newTranslateX = currentTranslateX + (diffX / track.offsetWidth) * 100;
        
        track.style.transform = `translateX(${newTranslateX}%)`;
      });
      
      track.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        
        isDragging = false;
        const diffX = currentX - startX;
        const diffTime = Date.now() - startTime;
        const velocity = Math.abs(diffX / diffTime);
        
        // Determine if swipe is significant enough to change slide
        const threshold = track.offsetWidth * 0.2; // 20% of track width
        const isSignificantSwipe = Math.abs(diffX) > threshold || velocity > 0.5;
        
        if (isSignificantSwipe) {
          if (diffX > 0) {
            // Swiped right, go to previous slide
            updateCarousel(currentSlide - 1);
          } else {
            // Swiped left, go to next slide
            updateCarousel(currentSlide + 1);
          }
        } else {
          // Snap back to current slide
          updateCarousel(currentSlide);
        }
      });
      
      // Mouse drag support for desktop
      track.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        currentX = startX;
        startTime = Date.now();
        isDragging = true;
        track.style.transition = 'none';
        track.style.cursor = 'grabbing';
        e.preventDefault();
      });
      
      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        currentX = e.clientX;
        const diffX = currentX - startX;
        const currentTranslateX = -currentSlide * 100;
        const newTranslateX = currentTranslateX + (diffX / track.offsetWidth) * 100;
        
        track.style.transform = `translateX(${newTranslateX}%)`;
      });
      
      document.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        
        isDragging = false;
        track.style.cursor = 'grab';
        
        const diffX = currentX - startX;
        const diffTime = Date.now() - startTime;
        const velocity = Math.abs(diffX / diffTime);
        
        const threshold = track.offsetWidth * 0.15; // 15% of track width
        const isSignificantDrag = Math.abs(diffX) > threshold || velocity > 0.3;
        
        if (isSignificantDrag) {
          if (diffX > 0) {
            updateCarousel(currentSlide - 1);
          } else {
            updateCarousel(currentSlide + 1);
          }
        } else {
          updateCarousel(currentSlide);
        }
      });
      
      // Keyboard navigation
      carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          updateCarousel(currentSlide - 1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          updateCarousel(currentSlide + 1);
        }
      });
      
      // Auto-play functionality (optional - commented out for user control)
      /*
      let autoPlayInterval;
      
      function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
          updateCarousel(currentSlide + 1);
        }, 5000);
      }
      
      function stopAutoPlay() {
        clearInterval(autoPlayInterval);
      }
      
      // Pause auto-play on hover/focus
      carousel.addEventListener('mouseenter', stopAutoPlay);
      carousel.addEventListener('mouseleave', startAutoPlay);
      carousel.addEventListener('focusin', stopAutoPlay);
      carousel.addEventListener('focusout', startAutoPlay);
      
      // Start auto-play
      startAutoPlay();
      */
      
      // Initialize carousel
      updateCarousel(0, false);
      
      // Handle resize events
      const resizeObserver = new ResizeObserver(() => {
        updateCarousel(currentSlide, false);
      });
      
      resizeObserver.observe(track);
      
      // Add cursor style for drag indication
      track.style.cursor = 'grab';
      
      // Prevent image dragging
      const images = track.querySelectorAll('img');
      images.forEach(img => {
        img.setAttribute('draggable', 'false');
      });
    });
  }

  // ==========================================
  // SPIRAL CALLOUTS ANIMATION
  // ==========================================
  
  function initSpiralAnimations() {
    const spiralNodes = document.querySelectorAll('.spiral-animate');
    
    if (spiralNodes.length === 0) return;
    
    const spiralObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const spiralWrap = entry.target.closest('.spiral-wrap');
          if (spiralWrap) {
            animateSpiralNodes(spiralWrap);
            spiralObserver.unobserve(entry.target);
          }
        }
      });
    }, { 
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px'
    });
    
    // Observe the spiral wrap container
    const spiralWrap = document.querySelector('.spiral-wrap');
    if (spiralWrap) {
      spiralObserver.observe(spiralWrap);
    }
  }
  
  function animateSpiralNodes(spiralWrap) {
    const spiralNodes = spiralWrap.querySelectorAll('.spiral-animate');
    
    // Define the animation order based on clockwise position
    const animationOrder = [
      'top',           // 0° - first
      'top-right',     // 72° - second  
      'bottom-right',  // 144° - third
      'bottom-left',   // 216° - fourth
      'top-left'       // 288° - fifth
    ];
    
    spiralNodes.forEach((node, index) => {
      const direction = node.getAttribute('data-direction');
      const orderIndex = animationOrder.indexOf(direction);
      const delay = orderIndex !== -1 ? orderIndex * 200 : index * 200; // 200ms between each
      
      setTimeout(() => {
        node.classList.add('animate-in');
        
        // Add subtle bounce effect
        const callout = node.querySelector('.spiral-callout');
        if (callout) {
          callout.style.animation = 'spiralBounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        }
      }, delay);
    });
    
    // Add CSS animation for bounce effect if not already added
    if (!document.querySelector('#spiral-animations')) {
      const style = document.createElement('style');
      style.id = 'spiral-animations';
      style.textContent = `
        @keyframes spiralBounceIn {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          60% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        /* Enhanced focus states for animated elements */
        .spiral-animate.animate-in .spiral-callout:focus {
          transform: translate(-50%, -50%) scale(1.02);
          box-shadow: 0 0 0 3px var(--ss-yellow);
          border-radius: 8px;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ==========================================
  // ACCORDION FUNCTIONALITY
  // ==========================================
  
  function initAccordion() {
    const accordionItems = document.querySelectorAll('.skill-accordion-item');
    
    if (accordionItems.length === 0) return;
    
    accordionItems.forEach((item, index) => {
      const button = item.querySelector('.accordion-question');
      const content = item.querySelector('.accordion-answer');
      const icon = item.querySelector('.accordion-icon');
      
      if (!button || !content) return;
      
      // Set initial ARIA attributes
      const contentId = `accordion-content-${index}`;
      content.id = contentId;
      button.setAttribute('aria-controls', contentId);
      button.setAttribute('aria-expanded', 'false');
      
      // Set initial state - first accordion starts open, others closed
      const isFirstItem = index === 0;
      content.style.overflow = 'hidden';
      content.style.transition = 'max-height 0.3s ease-out';
      
      if (isFirstItem) {
        // Initialize first accordion as open
        content.style.maxHeight = content.scrollHeight + 'px';
        content.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
        if (icon) {
          icon.style.transform = 'rotate(180deg)';
        }
      } else {
        // Initialize other accordions as closed
        content.style.maxHeight = '0';
        content.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
        if (icon) {
          icon.style.transform = 'rotate(0deg)';
        }
      }
      
      function toggleAccordion() {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        // If this accordion is already open, do nothing (can't close it)
        if (isExpanded) {
          return;
        }
        
        // Close all other accordions and open this one
        accordionItems.forEach(otherItem => {
          const otherButton = otherItem.querySelector('.accordion-question');
          const otherContent = otherItem.querySelector('.accordion-answer');
          const otherIcon = otherItem.querySelector('.accordion-icon');
          
          if (otherButton && otherContent) {
            if (otherItem === item) {
              // Open this accordion
              otherContent.style.maxHeight = otherContent.scrollHeight + 'px';
              otherContent.classList.add('open');
              otherButton.setAttribute('aria-expanded', 'true');
              if (otherIcon) otherIcon.style.transform = 'rotate(180deg)';
            } else {
              // Close other accordions
              otherContent.style.maxHeight = '0';
              otherContent.classList.remove('open');
              otherButton.setAttribute('aria-expanded', 'false');
              if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
            }
          }
        });
        
        // Add subtle animation to the accordion item
        item.style.transform = 'scale(0.98)';
        setTimeout(() => {
          item.style.transform = 'scale(1)';
        }, 150);
      }
      
      // Event listeners
      button.addEventListener('click', toggleAccordion);
      
      // Keyboard support
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleAccordion();
        }
      });
      
      // Enhanced focus management
      button.addEventListener('focus', () => {
        item.style.borderColor = 'rgba(231, 48, 82, 0.3)';
        item.style.boxShadow = '0 0 0 2px rgba(231, 48, 82, 0.1)';
      });
      
      button.addEventListener('blur', () => {
        item.style.borderColor = '';
        item.style.boxShadow = '';
      });
      
      // Handle resize events to maintain proper max-height
      window.addEventListener('resize', () => {
        if (button.getAttribute('aria-expanded') === 'true') {
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    });
    
    // Intersection observer for staggered animation
    const accordionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 100);
          accordionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    // Set initial animation state and observe
    accordionItems.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      item.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out, border-color 0.3s ease, box-shadow 0.3s ease';
      accordionObserver.observe(item);
    });
  }

  // ==========================================
  // ROTATING QUOTES (Rana's Style)
  // ==========================================
  
  function initRotatingQuotes() {
    const rotatingQuotesContainers = document.querySelectorAll('.partnership-testimonials-rotating');
    
    rotatingQuotesContainers.forEach(container => {
      const quoteItems = container.querySelectorAll('.rotating-quote-item');
      const indicatorDots = container.querySelectorAll('.quote-indicator-dot');
      
      if (!quoteItems.length || !indicatorDots.length) return;
      
      let currentQuote = 0;
      let autoRotateInterval;
      let isPaused = false;
      
      // Function to update active quote
      function updateActiveQuote(index, animate = true) {
        if (index < 0) index = quoteItems.length - 1;
        if (index >= quoteItems.length) index = 0;
        
        currentQuote = index;
        
        // Update quote items
        quoteItems.forEach((item, i) => {
          item.classList.toggle('active', i === currentQuote);
          item.setAttribute('aria-hidden', i !== currentQuote ? 'true' : 'false');
        });
        
        // Update indicator dots
        indicatorDots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentQuote);
          dot.setAttribute('aria-selected', i === currentQuote ? 'true' : 'false');
        });
        
        // Add subtle entrance animation for the active quote
        const activeItem = quoteItems[currentQuote];
        if (activeItem && animate) {
          const quote = activeItem.querySelector('.rotating-quote');
          const attribution = activeItem.querySelector('.quote-attribution');
          
          if (quote) {
            quote.style.animation = 'quoteSlideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          }
          if (attribution) {
            attribution.style.animation = 'attributionSlideIn 0.8s 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both';
          }
        }
      }
      
      // Auto-rotation functionality
      function startAutoRotation() {
        if (isPaused || quoteItems.length <= 1) return;
        
        autoRotateInterval = setInterval(() => {
          if (!isPaused) {
            updateActiveQuote(currentQuote + 1);
          }
        }, 6000); // 6 seconds per quote
      }
      
      function stopAutoRotation() {
        if (autoRotateInterval) {
          clearInterval(autoRotateInterval);
          autoRotateInterval = null;
        }
      }
      
      function pauseRotation() {
        isPaused = true;
        stopAutoRotation();
      }
      
      function resumeRotation() {
        isPaused = false;
        startAutoRotation();
      }
      
      // Manual navigation via dots
      indicatorDots.forEach((dot, index) => {
        // Click handler
        dot.addEventListener('click', (e) => {
          e.preventDefault();
          stopAutoRotation();
          updateActiveQuote(index);
          
          // Restart auto-rotation after a delay
          setTimeout(() => {
            if (!isPaused) {
              startAutoRotation();
            }
          }, 8000); // 8 second pause after manual interaction
        });
        
        // Keyboard support
        dot.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            stopAutoRotation();
            updateActiveQuote(index);
            setTimeout(() => {
              if (!isPaused) {
                startAutoRotation();
              }
            }, 8000);
          }
        });
        
        // Add ARIA attributes
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `View testimonial ${index + 1}`);
        dot.setAttribute('tabindex', index === 0 ? '0' : '-1');
      });
      
      // Keyboard navigation between dots
      container.addEventListener('keydown', (e) => {
        const focusedDot = document.activeElement;
        const currentIndex = Array.from(indicatorDots).indexOf(focusedDot);
        
        if (currentIndex !== -1) {
          let newIndex = currentIndex;
          
          if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            newIndex = currentIndex > 0 ? currentIndex - 1 : indicatorDots.length - 1;
          } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            newIndex = currentIndex < indicatorDots.length - 1 ? currentIndex + 1 : 0;
          }
          
          if (newIndex !== currentIndex) {
            // Update tabindex
            indicatorDots[currentIndex].setAttribute('tabindex', '-1');
            indicatorDots[newIndex].setAttribute('tabindex', '0');
            indicatorDots[newIndex].focus();
            
            // Update quote
            stopAutoRotation();
            updateActiveQuote(newIndex);
            setTimeout(() => {
              if (!isPaused) {
                startAutoRotation();
              }
            }, 8000);
          }
        }
      });
      
      // Pause on hover/focus for better UX
      container.addEventListener('mouseenter', pauseRotation);
      container.addEventListener('mouseleave', resumeRotation);
      container.addEventListener('focusin', pauseRotation);
      container.addEventListener('focusout', (e) => {
        // Only resume if focus is completely leaving the container
        if (!container.contains(e.relatedTarget)) {
          resumeRotation();
        }
      });
      
      // Handle visibility change (pause when tab is not active)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          pauseRotation();
        } else {
          resumeRotation();
        }
      });
      
      // Intersection observer to start animation when visible
      const quotesObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Initialize first quote and start rotation
            setTimeout(() => {
              updateActiveQuote(0, false);
              startAutoRotation();
            }, 500); // Small delay for better visual experience
            quotesObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      
      quotesObserver.observe(container);
      
      // Add CSS animations if not already present
      if (!document.querySelector('#rotating-quotes-animations')) {
        const style = document.createElement('style');
        style.id = 'rotating-quotes-animations';
        style.textContent = `
          @keyframes quoteSlideIn {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes attributionSlideIn {
            0% {
              opacity: 0;
              transform: translateY(15px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          /* Enhanced focus states for quote indicators */
          .quote-indicator-dot:focus {
            outline: 3px solid rgba(255, 255, 255, 0.8);
            outline-offset: 6px;
          }
          
          /* Smooth transitions for quote items */
          .rotating-quote-item {
            transition: opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                        visibility 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                        transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
        `;
        document.head.appendChild(style);
      }
      
      // Initialize with first quote (without animation initially)
      updateActiveQuote(0, false);
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
      initSpiralAnimations(); // Add spiral callouts animation
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
      initTestimonialsCarousel(); // Add testimonials carousel functionality
      initRotatingQuotes(); // Add rotating quotes functionality
      initAccordion(); // Add accordion functionality
      
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
