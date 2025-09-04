/* ==========================================
   IMPACT STORIES - INTERACTIVE FUNCTIONALITY
   Advanced animations, scroll effects, and dynamic interactions
   ========================================== */

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Intersection Observer for scroll-triggered animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

// Debounce function for performance optimization
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

// Smooth scroll utility
function smoothScrollTo(element, duration = 1000) {
  const targetPosition = element.offsetTop - 80; // Account for header
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutQuart(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  function easeInOutQuart(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t * t + b;
    t -= 2;
    return -c / 2 * (t * t * t * t - 2) + b;
  }

  requestAnimationFrame(animation);
}

// ==========================================
// ANIMATED COUNTERS
// ==========================================

class AnimatedCounter {
  constructor(element, options = {}) {
    this.element = element;
    this.target = parseInt(element.dataset.value) || parseInt(element.textContent);
    this.duration = options.duration || 2000;
    this.suffix = element.dataset.suffix || '';
    this.prefix = element.dataset.prefix || '';
    this.hasAnimated = false;
    
    this.init();
  }

  init() {
    // Set initial value to 0
    this.element.textContent = this.prefix + '0' + this.suffix;
    
    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.animate();
          this.hasAnimated = true;
        }
      });
    }, observerOptions);

    observer.observe(this.element);
  }

  animate() {
    const startTime = performance.now();
    const startValue = 0;
    const endValue = this.target;

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      
      // Easing function for smooth animation
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutExpo);
      
      // Format numbers properly
      if (this.suffix === '%') {
        this.element.textContent = `${currentValue}%`;
      } else {
        this.element.textContent = this.prefix + new Intl.NumberFormat().format(currentValue) + this.suffix;
      }
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        // Add completion effect
        this.element.style.transform = 'scale(1.05)';
        setTimeout(() => {
          this.element.style.transform = 'scale(1)';
        }, 200);
      }
    };

    requestAnimationFrame(updateCounter);
  }
}

// ==========================================
// SCROLL-TRIGGERED ANIMATIONS
// ==========================================

class ScrollAnimations {
  constructor() {
    this.elements = document.querySelectorAll('.fade-up, .student-card, .timeline-story, .story-visual');
    this.init();
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Add staggered delay for multiple elements
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, index * 100);
        }
      });
    }, observerOptions);

    this.elements.forEach(element => {
      element.classList.add('fade-up');
      observer.observe(element);
    });
  }
}

// ==========================================
// STUDENT WEB GRAPH
// ==========================================

class StudentWebGraph {
  constructor() {
    this.webContainer = document.querySelector('.web-container');
    this.storyDisplay = document.querySelector('.story-display');
    this.storyContentArea = document.querySelector('.story-content-area');
    this.nodes = document.querySelectorAll('.student-node');
    this.connectionLines = document.querySelector('.connection-lines');
    this.currentActiveNode = null;
    this.originalPositions = new Map();
    
    // Student data
    this.studentData = {
      netra: {
        name: 'Netra Ramesh',
        badge: '2021 Trainee',
        quote: 'My life changed because of the MIT FutureMaker program! I\'ve never been so passionate about my future.',
        image: 'https://mysurestart.com/s/Netra-Ramesh.jpg'
      },
      vitaliy: {
        name: 'Vitaliy Stephanov',
        badge: '2021 Trainee',
        quote: 'SureStart helped prepare me with the skills I needed to become a Software Development Engineer at Amazon Web Services.',
        image: 'https://mysurestart.com/s/Vitaliy-S.jpg'
      },
      alexa: {
        name: 'Alexa Urrea',
        badge: '2021 Trainee',
        quote: 'SureStart dramatically and directly impacted my life. It helped me land my first ever internship with a great company.',
        image: 'https://mysurestart.com/s/Alexa-Urrea.jpg'
      },
      jonathan: {
        name: 'Jonathan Williams',
        badge: '2021 Trainee',
        quote: 'The SureStart program was truly transformative. The program connected me with a fulfilling ML internship opportunity.',
        image: 'https://mysurestart.com/s/Jonathan-Williams.jpg'
      },
      sahana: {
        name: 'Sahana Sreeram',
        badge: '2021 Trainee',
        quote: 'The most impactful technology experience I have had so far. Each team product had the potential to change the world.',
        image: 'https://mysurestart.com/s/Sahana-Sreeram.jpg'
      },
      jason: {
        name: 'Jason Jerome',
        badge: '2021 Trainee',
        quote: 'A learning experience unlike anything I\'ve participated in before. Thanks to their support I was recently offered a summer internship!',
        image: 'https://mysurestart.com/s/Jason-Jerome.jpg'
      }
    };
    
    this.init();
  }

  init() {
    if (!this.webContainer) return;

    this.positionNodes();
    this.createConnections();
    this.addNodeInteractions();
    
    // Handle window resize
    window.addEventListener('resize', debounce(() => {
      this.positionNodes();
      this.createConnections();
    }, 250));
  }

  positionNodes() {
    if (!this.webContainer) return;
    
    const containerRect = this.webContainer.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;
    
    // Define positions for each node in a web-like pattern
    const positions = [
      { x: centerX * 0.3, y: centerY * 0.4 }, // netra (large)
      { x: centerX * 1.7, y: centerY * 0.3 }, // vitaliy (medium)
      { x: centerX * 0.2, y: centerY * 1.6 }, // alexa (small)
      { x: centerX * 1.8, y: centerY * 1.4 }, // jonathan (medium)
      { x: centerX * 0.6, y: centerY * 0.1 }, // sahana (small)
      { x: centerX * 1.4, y: centerY * 1.8 }  // jason (medium)
    ];
    
    this.nodes.forEach((node, index) => {
      if (positions[index]) {
        const pos = positions[index];
        node.style.left = `${pos.x}px`;
        node.style.top = `${pos.y}px`;
        node.style.transform = 'translate(-50%, -50%)';
        
        // Store original position
        this.originalPositions.set(node, pos);
      }
    });
  }

  createConnections() {
    if (!this.connectionLines) return;
    
    // Clear existing lines
    this.connectionLines.innerHTML = '';
    
    const containerRect = this.webContainer.getBoundingClientRect();
    
    // Define connections between nodes (creating a web pattern)
    const connections = [
      [0, 1], [0, 2], [0, 4], // netra connections
      [1, 3], [1, 5], [1, 4], // vitaliy connections
      [2, 3], [2, 5], // alexa connections
      [3, 5], [4, 5] // remaining connections
    ];
    
    connections.forEach(([fromIndex, toIndex]) => {
      const fromNode = this.nodes[fromIndex];
      const toNode = this.nodes[toIndex];
      
      if (fromNode && toNode) {
        const fromPos = this.originalPositions.get(fromNode);
        const toPos = this.originalPositions.get(toNode);
        
        if (fromPos && toPos) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', fromPos.x);
          line.setAttribute('y1', fromPos.y);
          line.setAttribute('x2', toPos.x);
          line.setAttribute('y2', toPos.y);
          line.setAttribute('class', 'connection-line');
          
          this.connectionLines.appendChild(line);
        }
      }
    });
  }

  addNodeInteractions() {
    this.nodes.forEach(node => {
      node.addEventListener('mouseenter', () => {
        this.showStudentStory(node);
        this.activateConnections(node);
      });
      
      node.addEventListener('mouseleave', () => {
        this.hideStudentStory();
        this.deactivateConnections();
      });
      
      node.addEventListener('click', () => {
        this.centerNode(node);
      });
    });
  }

  showStudentStory(node) {
    const studentId = node.dataset.student;
    const studentInfo = this.studentData[studentId];
    
    if (!studentInfo) return;
    
    const storyHTML = `
      <div class="student-story active">
        <div class="story-header">
          <div class="story-avatar">
            <img src="${studentInfo.image}" alt="${studentInfo.name}">
          </div>
          <div class="story-info">
            <div class="story-badge">${studentInfo.badge}</div>
            <h3>${studentInfo.name}</h3>
          </div>
        </div>
        <div class="story-quote">
          ${studentInfo.quote}
        </div>
        <div class="story-actions">
          <a href="#" class="story-btn primary">Connect on LinkedIn</a>
          <a href="#" class="story-btn secondary">View Full Story</a>
        </div>
      </div>
    `;
    
    this.storyContentArea.innerHTML = storyHTML;
  }

  hideStudentStory() {
    const placeholder = `
      <div class="story-placeholder">
        <h3>Hover over a student to see their story</h3>
        <p>Discover how SureStart has transformed lives and careers</p>
      </div>
    `;
    
    this.storyContentArea.innerHTML = placeholder;
  }

  activateConnections(activeNode) {
    const lines = this.connectionLines.querySelectorAll('line');
    const activeIndex = Array.from(this.nodes).indexOf(activeNode);
    
    lines.forEach((line, index) => {
      // Simple logic to show connections related to the active node
      // In a real implementation, you'd track which lines connect to which nodes
      if (index % 2 === activeIndex % 2) {
        line.classList.add('active');
      }
    });
  }

  deactivateConnections() {
    const lines = this.connectionLines.querySelectorAll('line');
    lines.forEach(line => {
      line.classList.remove('active');
    });
  }

  centerNode(node) {
    if (this.currentActiveNode) {
      this.resetNodePosition(this.currentActiveNode);
    }
    
    // Move node to center with smooth animation
    const containerRect = this.webContainer.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;
    
    node.style.left = `${centerX}px`;
    node.style.top = `${centerY}px`;
    node.classList.add('centered');
    
    this.currentActiveNode = node;
    
    // Show story permanently
    this.showStudentStory(node);
    
    // Reset after 3 seconds
    setTimeout(() => {
      this.resetNodePosition(node);
    }, 3000);
  }

  resetNodePosition(node) {
    const originalPos = this.originalPositions.get(node);
    if (originalPos) {
      node.style.left = `${originalPos.x}px`;
      node.style.top = `${originalPos.y}px`;
      node.classList.remove('centered');
    }
    
    if (this.currentActiveNode === node) {
      this.currentActiveNode = null;
      this.hideStudentStory();
    }
  }
}

// ==========================================
// VIDEO PLAYER FUNCTIONALITY
// ==========================================

class VideoPlayer {
  constructor() {
    this.videoContainers = document.querySelectorAll('.video-container');
    this.init();
  }

  init() {
    this.videoContainers.forEach(container => {
      const playBtn = container.querySelector('.play-button');
      const thumbnail = container.querySelector('.video-thumbnail');
      
      if (playBtn && thumbnail) {
        playBtn.addEventListener('click', () => {
          this.playVideo(container);
        });
      }
    });
  }

  playVideo(container) {
    const videoUrl = container.dataset.videoUrl;
    if (!videoUrl) return;

    // Create video element
    const video = document.createElement('iframe');
    video.src = videoUrl;
    video.frameBorder = '0';
    video.allowFullscreen = true;
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.position = 'absolute';
    video.style.top = '0';
    video.style.left = '0';
    video.style.borderRadius = 'inherit';

    // Replace thumbnail with video
    container.innerHTML = '';
    container.appendChild(video);

    // Add loading animation
    container.classList.add('loading');
    setTimeout(() => {
      container.classList.remove('loading');
    }, 1000);
  }
}

// ==========================================
// PARALLAX EFFECTS
// ==========================================

class ParallaxEffects {
  constructor() {
    this.elements = document.querySelectorAll('[data-parallax]');
    this.init();
  }

  init() {
    if (this.elements.length === 0) return;

    const handleScroll = debounce(() => {
      const scrollTop = window.pageYOffset;
      
      this.elements.forEach(element => {
        const speed = parseFloat(element.dataset.parallax) || 0.5;
        const yPos = -(scrollTop * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    }, 10);

    window.addEventListener('scroll', handleScroll);
  }
}

// ==========================================
// PARTICLE SYSTEM ENHANCEMENT
// ==========================================

class ParticleSystem {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
    
    this.init();
  }

  init() {
    const heroSection = document.querySelector('.impact-hero');
    if (!heroSection) return;

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '2';
    
    heroSection.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    this.resize();
    this.createParticles();
    this.animate();
    
    window.addEventListener('resize', debounce(() => this.resize(), 250));
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  createParticles() {
    const particleCount = Math.min(50, Math.floor(this.canvas.width / 20));
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        color: this.getRandomColor()
      });
    }
  }

  getRandomColor() {
    const colors = [
      'rgba(255, 182, 95, 0.6)',
      'rgba(237, 124, 75, 0.5)',
      'rgba(231, 48, 82, 0.7)',
      'rgba(238, 45, 110, 0.6)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;
      
      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.fill();
    });
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }
}

// ==========================================
// SMOOTH SCROLLING NAVIGATION
// ==========================================

class SmoothNavigation {
  constructor() {
    this.links = document.querySelectorAll('a[href^="#"]');
    this.init();
  }

  init() {
    this.links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          smoothScrollTo(targetElement);
        }
      });
    });
  }
}

// ==========================================
// PERFORMANCE MONITORING
// ==========================================

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      loadTime: 0,
      animationFrames: 0,
      lastFrameTime: performance.now()
    };
    
    this.init();
  }

  init() {
    // Monitor page load time
    window.addEventListener('load', () => {
      this.metrics.loadTime = performance.now();
      console.log(`Impact Stories page loaded in ${this.metrics.loadTime.toFixed(2)}ms`);
    });

    // Monitor animation performance
    this.monitorAnimations();
  }

  monitorAnimations() {
    const checkFrame = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - this.metrics.lastFrameTime;
      
      if (deltaTime > 16.67) { // More than 60fps threshold
        this.metrics.animationFrames++;
      }
      
      this.metrics.lastFrameTime = currentTime;
      requestAnimationFrame(checkFrame);
    };
    
    requestAnimationFrame(checkFrame);
  }

  getMetrics() {
    return this.metrics;
  }
}

// ==========================================
// ACCESSIBILITY ENHANCEMENTS
// ==========================================

class AccessibilityEnhancements {
  constructor() {
    this.init();
  }

  init() {
    this.addKeyboardNavigation();
    this.addAriaLabels();
    this.addFocusManagement();
    this.respectReducedMotion();
  }

  addKeyboardNavigation() {
    // Add keyboard support for interactive elements
    const interactiveElements = document.querySelectorAll('.student-card, .control-btn, .play-button');
    
    interactiveElements.forEach(element => {
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
      }
      
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          element.click();
        }
      });
    });
  }

  addAriaLabels() {
    // Add ARIA labels for better screen reader support
    const cards = document.querySelectorAll('.student-card');
    cards.forEach((card, index) => {
      const studentName = card.querySelector('.student-name')?.textContent;
      if (studentName) {
        card.setAttribute('aria-label', `Student story: ${studentName}`);
        card.setAttribute('role', 'article');
      }
    });

    const filterButtons = document.querySelectorAll('.control-btn');
    filterButtons.forEach(btn => {
      const filter = btn.dataset.filter;
      btn.setAttribute('aria-label', `Filter stories by ${filter}`);
    });
  }

  addFocusManagement() {
    // Improve focus visibility
    const focusableElements = document.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])');
    
    focusableElements.forEach(element => {
      element.addEventListener('focus', () => {
        element.style.outline = '3px solid var(--ss-red)';
        element.style.outlineOffset = '2px';
      });
      
      element.addEventListener('blur', () => {
        element.style.outline = '';
        element.style.outlineOffset = '';
      });
    });
  }

  respectReducedMotion() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Disable complex animations
      document.body.classList.add('reduced-motion');
      
      // Add CSS for reduced motion
      const style = document.createElement('style');
      style.textContent = `
        .reduced-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
}

// ==========================================
// FEATURED TESTIMONIAL ROTATOR
// ==========================================

class FeaturedTestimonial {
  constructor() {
    this.featuredCard = document.getElementById('featuredTestimonial');
    this.featuredQuote = document.getElementById('featuredQuote');
    this.featuredAuthor = document.getElementById('featuredAuthor');
    this.featuredAvatar = document.getElementById('featuredAvatar');
    this.featuredIndicators = document.getElementById('featuredIndicators');
    
    this.currentIndex = 0;
    this.autoRotateInterval = null;
    this.autoRotateDelay = 5000; // 5 seconds
    
    // Featured testimonials data - Jonathan and Lili
    this.testimonials = [
      {
        quote: "Participating in SureStart was the single best decision I have made in my academic career. The mentorship was fantastic and I have continued to keep in contact with my SureStart mentors for years! It truly changed my life!",
        author: "JONATHAN WILLIAMS",
        avatar: "static/images/JW.jpg"
      },
      {
        quote: "SureStart created a welcoming environment where women like me are not the exception but the majority. The program provided the support and community I needed to thrive in AI.",
        author: "LILI PIESANEN",
        avatar: "https://mysurestart.com/s/Lili-Piesanen.jpg"
      }
    ];
    
    this.init();
  }

  init() {
    if (!this.featuredCard) return;
    
    this.createIndicators();
    this.addEventListeners();
    this.startAutoRotate();
    this.updateFeaturedTestimonial();
  }

  createIndicators() {
    if (!this.featuredIndicators) return;
    
    this.featuredIndicators.innerHTML = '';
    
    this.testimonials.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = 'indicator';
      indicator.setAttribute('aria-label', `Featured testimonial ${index + 1}`);
      indicator.addEventListener('click', () => this.goToTestimonial(index));
      
      if (index === this.currentIndex) {
        indicator.classList.add('active');
      }
      
      this.featuredIndicators.appendChild(indicator);
    });
  }

  addEventListeners() {
    // Pause auto-rotation on hover
    if (this.featuredCard) {
      this.featuredCard.addEventListener('mouseenter', () => {
        this.stopAutoRotate();
      });
      
      this.featuredCard.addEventListener('mouseleave', () => {
        this.startAutoRotate();
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('.featured-testimonial')) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.previousTestimonial();
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.nextTestimonial();
        }
      }
    });
  }

  goToTestimonial(index) {
    this.currentIndex = index;
    this.updateFeaturedTestimonial();
    this.updateIndicators();
    this.restartAutoRotate();
  }

  nextTestimonial() {
    this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
    this.updateFeaturedTestimonial();
    this.updateIndicators();
    this.restartAutoRotate();
  }

  previousTestimonial() {
    this.currentIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
    this.updateFeaturedTestimonial();
    this.updateIndicators();
    this.restartAutoRotate();
  }

  updateFeaturedTestimonial() {
    const testimonial = this.testimonials[this.currentIndex];
    if (!testimonial) return;

    // Add fade out effect
    this.featuredCard.style.opacity = '0.7';
    
    setTimeout(() => {
      // Update content
      if (this.featuredQuote) {
        this.featuredQuote.textContent = testimonial.quote;
      }
      
      if (this.featuredAuthor) {
        this.featuredAuthor.textContent = testimonial.author;
      }
      
      if (this.featuredAvatar) {
        this.featuredAvatar.src = testimonial.avatar;
        this.featuredAvatar.alt = testimonial.author;
      }
      
      // Fade back in
      this.featuredCard.style.opacity = '1';
    }, 200);
  }

  updateIndicators() {
    const indicators = this.featuredIndicators?.querySelectorAll('.indicator');
    indicators?.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentIndex);
    });
  }

  startAutoRotate() {
    this.stopAutoRotate();
    this.autoRotateInterval = setInterval(() => {
      this.nextTestimonial();
    }, this.autoRotateDelay);
  }

  stopAutoRotate() {
    if (this.autoRotateInterval) {
      clearInterval(this.autoRotateInterval);
      this.autoRotateInterval = null;
    }
  }

  restartAutoRotate() {
    this.stopAutoRotate();
    this.startAutoRotate();
  }

  destroy() {
    this.stopAutoRotate();
  }
}

// ==========================================
// TESTIMONIALS CAROUSEL
// ==========================================

class TestimonialsCarousel {
  constructor() {
    this.track = document.getElementById('testimonialTrack');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.indicators = document.getElementById('carouselIndicators');
    this.cards = document.querySelectorAll('.testimonial-card');
    
    this.currentIndex = 0;
    this.cardsPerView = this.getCardsPerView();
    this.totalSlides = Math.ceil(this.cards.length / this.cardsPerView);
    
    this.init();
  }

  init() {
    if (!this.track || this.cards.length === 0) return;
    
    this.createIndicators();
    this.addEventListeners();
    this.updateCarousel();
    
    // Handle window resize
    window.addEventListener('resize', debounce(() => {
      this.cardsPerView = this.getCardsPerView();
      this.totalSlides = Math.ceil(this.cards.length / this.cardsPerView);
      this.currentIndex = Math.min(this.currentIndex, this.totalSlides - 1);
      this.updateCarousel();
      this.createIndicators();
    }, 250));
  }

  getCardsPerView() {
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  createIndicators() {
    if (!this.indicators) return;
    
    this.indicators.innerHTML = '';
    
    for (let i = 0; i < this.totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => this.goToSlide(i));
      
      if (i === this.currentIndex) {
        dot.classList.add('active');
      }
      
      this.indicators.appendChild(dot);
    }
  }

  addEventListeners() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.previousSlide());
    }
    
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextSlide());
    }
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.previousSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });
    
    // Add touch/swipe support
    this.addTouchSupport();
  }

  addTouchSupport() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    this.track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      this.track.style.transition = 'none';
    });
    
    this.track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      
      currentX = e.touches[0].clientX;
      const diffX = currentX - startX;
      const currentTransform = -(this.currentIndex * (100 / this.cardsPerView));
      const newTransform = currentTransform + (diffX / this.track.offsetWidth) * 100;
      
      this.track.style.transform = `translateX(${newTransform}%)`;
    });
    
    this.track.addEventListener('touchend', () => {
      if (!isDragging) return;
      
      isDragging = false;
      this.track.style.transition = '';
      
      const diffX = currentX - startX;
      const threshold = 50;
      
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          this.previousSlide();
        } else {
          this.nextSlide();
        }
      } else {
        this.updateCarousel();
      }
    });
  }

  nextSlide() {
    if (this.currentIndex < this.totalSlides - 1) {
      this.currentIndex++;
      this.updateCarousel();
    }
  }

  previousSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCarousel();
    }
  }

  goToSlide(index) {
    this.currentIndex = Math.max(0, Math.min(index, this.totalSlides - 1));
    this.updateCarousel();
  }

  updateCarousel() {
    if (!this.track) return;
    
    const translateX = -(this.currentIndex * (100 / this.cardsPerView));
    this.track.style.transform = `translateX(${translateX}%)`;
    
    // Update navigation buttons
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentIndex === 0;
    }
    
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentIndex === this.totalSlides - 1;
    }
    
    // Update indicators
    const dots = this.indicators?.querySelectorAll('.carousel-dot');
    dots?.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }
}

// ==========================================
// MAIN INITIALIZATION
// ==========================================

class ImpactStoriesApp {
  constructor() {
    this.components = {};
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Initialize all components
      this.components.performanceMonitor = new PerformanceMonitor();
      this.components.scrollAnimations = new ScrollAnimations();
      this.components.studentWebGraph = new StudentWebGraph();
      this.components.videoPlayer = new VideoPlayer();
      this.components.parallaxEffects = new ParallaxEffects();
      this.components.smoothNavigation = new SmoothNavigation();
      this.components.accessibilityEnhancements = new AccessibilityEnhancements();
      this.components.featuredTestimonial = new FeaturedTestimonial();
      this.components.testimonialsCarousel = new TestimonialsCarousel();

      // Initialize particle system (only on desktop for performance)
      if (window.innerWidth > 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.components.particleSystem = new ParticleSystem();
      }

      // Initialize animated counters
      this.initCounters();

      // Add global event listeners
      this.addGlobalListeners();

      this.isInitialized = true;
      console.log('Impact Stories app initialized successfully');

    } catch (error) {
      console.error('Error initializing Impact Stories app:', error);
    }
  }

  initCounters() {
    const counterElements = document.querySelectorAll('.value[data-value]');
    counterElements.forEach(element => {
      new AnimatedCounter(element);
    });
    
    // Ensure values render as 2,000 and 85%
    document.querySelectorAll('.stat-card .value').forEach(el => {
      const n = Number(el.dataset.value);
      const suffix = el.dataset.suffix || '';
      if (Number.isFinite(n)) {
        el.textContent = suffix === '%' ? `${n}%` : new Intl.NumberFormat().format(n);
      }
    });

    // Initialize section transitions
    this.initSectionTransitions();
  }

  addGlobalListeners() {
    // Handle window resize
    window.addEventListener('resize', debounce(() => {
      this.handleResize();
    }, 250));

    // Handle visibility change (pause animations when tab is not visible)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAnimations();
      } else {
        this.resumeAnimations();
      }
    });

    // Add error handling for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.addEventListener('error', () => {
        img.style.display = 'none';
        console.warn('Failed to load image:', img.src);
      });
    });
  }

  handleResize() {
    // Reinitialize components that need resize handling
    if (this.components.particleSystem) {
      this.components.particleSystem.resize();
    }
  }

  pauseAnimations() {
    if (this.components.particleSystem) {
      cancelAnimationFrame(this.components.particleSystem.animationId);
    }
  }

  resumeAnimations() {
    if (this.components.particleSystem) {
      this.components.particleSystem.animate();
    }
  }

  initSectionTransitions() {
    // Initialize section transitions with intersection observer
    const io = new IntersectionObserver(entries => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });

    document.querySelectorAll('.reveal').forEach((el, idx) => {
      el.style.setProperty('--stagger', `${(idx % 5) * 40}ms`);
      io.observe(el);
    });
  }

  destroy() {
    // Clean up all components
    Object.values(this.components).forEach(component => {
      if (component.destroy) {
        component.destroy();
      }
    });
    
    this.components = {};
    this.isInitialized = false;
  }
}

// ==========================================
// AUTO-INITIALIZATION
// ==========================================

// Create global app instance
window.ImpactStoriesApp = new ImpactStoriesApp();

// Auto-initialize when script loads
window.ImpactStoriesApp.init();

// Export for manual initialization if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImpactStoriesApp;
}
