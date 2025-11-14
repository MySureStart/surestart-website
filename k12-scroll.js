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
