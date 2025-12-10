/**
 * Proven Pathways Scroll Effect - Simplified and Consistent
 * Position-based fade animation for the K-12 page without scroll hijacking
 * 
 * This script creates a smooth, consistent fade effect based on section position
 * that works the same regardless of scroll speed.
 */

class ProvenPathwaysScroll {
  constructor() {
    this.section = document.querySelector('[data-scroll-section]');
    this.scrollProgress = 0; // Range: 0 to 2 (two phases)
    this.isActive = false;
    
    // Performance optimization
    this.ticking = false;
    
    // Accessibility
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    this.init();
  }
  
  init() {
    if (!this.section) {
      console.error('Proven Pathways section not found! Looking for [data-scroll-section]');
      return;
    }
    
    if (this.prefersReducedMotion) {
      console.log('Reduced motion preference detected, showing final state');
      this.section.style.setProperty('--scroll-progress', '2');
      return;
    }
    
    this.setupScrollHandler();
    
    console.log('✅ Proven Pathways Scroll Effect initialized successfully');
  }
  
  setupScrollHandler() {
    // Simple scroll handler that calculates progress based on section position
    const scrollHandler = () => {
      this.updateProgress();
    };
    
    // Use passive scroll listening for better performance
    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    // Initial calculation
    this.updateProgress();
    
    console.log('📜 Position-based scroll handler initialized');
  }
  
  updateProgress() {
    if (!this.section) return;
    
    const rect = this.section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const sectionHeight = rect.height;
    
    // Calculate scroll progress based on section position
    // Effect starts when section top reaches viewport top (0)
    // Effect completes when section bottom reaches viewport top (-sectionHeight)
    
    let progress = 0;
    
    if (rect.top <= 0 && rect.bottom > 0) {
      // Section is in the viewport and scrolling through it
      const scrollDistance = Math.abs(rect.top);
      const maxScrollDistance = sectionHeight - viewportHeight;
      
      if (maxScrollDistance > 0) {
        // Calculate progress from 0 to 2 (for two phases)
        progress = Math.min(2, (scrollDistance / maxScrollDistance) * 2);
      }
    } else if (rect.top > 0) {
      // Section hasn't entered yet
      progress = 0;
    } else {
      // Section has passed completely
      progress = 2;
    }
    
    // Only update if progress changed significantly (reduces unnecessary updates)
    if (Math.abs(progress - this.scrollProgress) > 0.01) {
      this.scrollProgress = progress;
      this.updateScrollProgressCSS();
    }
  }
  
  updateScrollProgressCSS() {
    // Update CSS custom property with smooth transition
    if (!this.ticking) {
      requestAnimationFrame(() => {
        if (this.section) {
          this.section.style.setProperty('--scroll-progress', this.scrollProgress.toFixed(3));
        }
        this.ticking = false;
      });
      this.ticking = true;
    }
  }
  
  // Public API for external control
  setProgress(progress) {
    if (progress >= 0 && progress <= 2) {
      this.scrollProgress = progress;
      this.updateScrollProgressCSS();
    }
  }
  
  getProgress() {
    return this.scrollProgress;
  }

  destroy() {
    // Cleanup method for removing event listeners
    window.removeEventListener('scroll', this.updateProgress.bind(this));
  }
}

// Auto-initialization when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on K-12 pages
  if (document.querySelector('[data-scroll-section]')) {
    window.provenPathwaysScroll = new ProvenPathwaysScroll();
  }
});

// CSS for accessibility
const scrollEffectCSS = `
  .scroll-locked {
    overflow: hidden;
  }
  
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  @media (prefers-reduced-motion: reduce) {
    .proven-pathways {
      --scroll-progress: 1 !important;
    }
    
    .pathways-top-overlay {
      opacity: 1 !important;
      transition: none !important;
    }
  }
`;

// Inject CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = scrollEffectCSS;
document.head.appendChild(styleSheet);

/**
 * Mobile Benefits Circle - K12 Page
 * Interactive circular layout for Benefits for Teachers & Schools section
 * Click numbered circles to display benefit content in center
 * Auto-rotates through benefits every 5 seconds
 */

class MobileBenefitsCircle {
  constructor() {
    this.container = document.querySelector('.mobile-benefits-circle');
    this.centerCircle = document.querySelector('.center-benefits-circle');
    this.benefitTitle = document.querySelector('.mobile-benefit-title');
    this.benefitText = document.querySelector('.mobile-benefit-text');
    this.numberCircles = document.querySelectorAll('.benefit-number-circle');
    
    this.currentIndex = -1; // -1 means no selection (show prompt)
    this.autoRotateInterval = null;
    this.autoRotateDelay = 5000; // 5 seconds
    this.isUserInteracting = false;
    
    this.init();
  }
  
  init() {
    if (!this.container || !this.numberCircles.length) {
      // Not on K-12 page or section not found
      return;
    }
    
    this.setupClickHandlers();
    this.startAutoRotate();
    
    console.log('✅ Mobile Benefits Circle initialized with', this.numberCircles.length, 'benefits');
  }
  
  setupClickHandlers() {
    this.numberCircles.forEach((circle, index) => {
      circle.addEventListener('click', () => {
        this.isUserInteracting = true;
        this.selectBenefit(index);
        
        // Restart auto-rotate after user interaction
        this.restartAutoRotate();
      });
      
      // Touch support
      circle.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.isUserInteracting = true;
        this.selectBenefit(index);
        this.restartAutoRotate();
      });
    });
    
    // Pause auto-rotate on hover/focus
    this.container.addEventListener('mouseenter', () => {
      this.pauseAutoRotate();
    });
    
    this.container.addEventListener('mouseleave', () => {
      if (!this.isUserInteracting) {
        this.startAutoRotate();
      }
    });
  }
  
  selectBenefit(index) {
    // Remove active state from all circles
    this.numberCircles.forEach(circle => {
      circle.classList.remove('active');
    });
    
    // Get benefit data from the clicked circle
    const circle = this.numberCircles[index];
    const title = circle.dataset.title;
    const text = circle.dataset.text;
    
    // Update center content
    if (this.benefitTitle && this.benefitText) {
      this.benefitTitle.textContent = title;
      this.benefitText.textContent = text;
    }
    
    // Add active class to selected circle
    circle.classList.add('active');
    
    // Show content (hide prompt)
    if (this.centerCircle) {
      this.centerCircle.classList.add('has-content');
    }
    
    this.currentIndex = index;
  }
  
  startAutoRotate() {
    // Clear any existing interval
    this.stopAutoRotate();
    
    this.autoRotateInterval = setInterval(() => {
      this.rotateToNext();
    }, this.autoRotateDelay);
  }
  
  stopAutoRotate() {
    if (this.autoRotateInterval) {
      clearInterval(this.autoRotateInterval);
      this.autoRotateInterval = null;
    }
  }
  
  pauseAutoRotate() {
    this.stopAutoRotate();
  }
  
  restartAutoRotate() {
    // Reset interaction flag after a delay
    setTimeout(() => {
      this.isUserInteracting = false;
      this.startAutoRotate();
    }, this.autoRotateDelay);
  }
  
  rotateToNext() {
    const totalBenefits = this.numberCircles.length;
    const nextIndex = (this.currentIndex + 1) % totalBenefits;
    this.selectBenefit(nextIndex);
  }
  
  destroy() {
    this.stopAutoRotate();
    // Remove event listeners if needed
  }
}

// Initialize Mobile Benefits Circle when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on mobile viewport
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  
  if (isMobile && document.querySelector('.mobile-benefits-circle')) {
    window.mobileBenefitsCircle = new MobileBenefitsCircle();
  }
  
  // Re-initialize on resize if transitioning to mobile
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const nowMobile = window.matchMedia('(max-width: 768px)').matches;
      
      if (nowMobile && !window.mobileBenefitsCircle && document.querySelector('.mobile-benefits-circle')) {
        window.mobileBenefitsCircle = new MobileBenefitsCircle();
      } else if (!nowMobile && window.mobileBenefitsCircle) {
        window.mobileBenefitsCircle.destroy();
        window.mobileBenefitsCircle = null;
      }
    }, 250);
  });
});
