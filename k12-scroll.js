/**
 * Proven Pathways Scroll Effect
 * Advanced scroll-controlled fade animation for the K-12 page
 * 
 * This script creates a smooth scroll-hijacking effect where users can 
 * fade between two background images in the proven pathways section.
 */

class ProvenPathwaysScroll {
  constructor() {
    // SCROLL SPEED SETTING - Easy to modify
    this.SCROLL_TICKS_FOR_COMPLETE_FADE = 8; // Adjust this number to change fade speed (doubled for two phases)
    
    this.section = document.querySelector('[data-scroll-section]');
    this.scrollProgress = 0; // Range: 0 to 2 (two phases)
    this.isLocked = false;
    this.accumulatedDelta = 0;
    this.lastScrollTime = 0;
    this.scrollDirection = 'none'; // 'up', 'down', 'none'
    this.hasCompletedOnce = false; // Track if both phases have completed once
    
    // Mobile touch handling
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.isTouch = false;
    
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
      console.log('Reduced motion preference detected, skipping scroll effect');
      // For reduced motion, show the overlay immediately
      this.section.style.setProperty('--scroll-progress', '1');
      return;
    }
    
    this.setupIntersectionObserver();
    this.bindEvents();
    
    console.log('✅ Proven Pathways Scroll Effect initialized successfully');
    console.log('Section found:', this.section);
    console.log('Current progress:', this.scrollProgress);
    
    // TEMPORARY DEBUGGING: Add manual controls
    this.addDebugControls();
  }
  
  setupIntersectionObserver() {
    // Primary detection with intersection observer + backup scroll position check
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          this.checkSectionActivation(entry);
        });
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], // More granular thresholds
        rootMargin: '0px'
      }
    );
    
    observer.observe(this.section);
    
    // Ultra high-frequency backup detection
    let scrollCheckInterval = setInterval(() => {
      if (document.querySelector('[data-scroll-section]')) {
        this.checkScrollActivation();
      }
    }, 8); // ~120fps for ultra-fast scroll detection
    
    // Real-time scroll event listener for immediate detection
    let lastScrollCheck = 0;
    const scrollHandler = () => {
      const now = Date.now();
      if (now - lastScrollCheck > 8) { // Throttle to match interval
        this.checkScrollActivation();
        lastScrollCheck = now;
      }
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    // Store for cleanup
    this.scrollCheckInterval = scrollCheckInterval;
    this.scrollHandler = scrollHandler;
    
    console.log('👀 Triple detection system initialized (IO + 120fps Timer + Real-time Scroll)');
  }
  
  checkSectionActivation(entry) {
    const rect = entry.boundingClientRect;
    const viewportHeight = window.innerHeight;
    const sectionHeight = rect.height;
    
    // Calculate visibility
    const visibleTop = Math.max(0, -rect.top);
    const visibleBottom = Math.min(sectionHeight, viewportHeight - rect.top);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    const visibilityRatio = visibleHeight / viewportHeight;
    
    // ULTRA STRICT - only activate when section is perfectly or past center
    const shouldActivate = entry.isIntersecting && 
                           visibilityRatio >= 0.98 && // Must fill 98% of viewport
                           rect.top <= 0 && // Section top must be at or above viewport top
                           rect.top >= -100 && // But not scrolled too far past (within 100px)
                           rect.bottom >= viewportHeight; // Section bottom must extend fully past viewport
    
    console.log('🔍 IO Check:', {
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      viewportHeight: viewportHeight,
      visibility: Math.round(visibilityRatio * 100) + '%',
      topOK: (rect.top <= 0 && rect.top >= -100),
      bottomOK: (rect.bottom >= viewportHeight),
      shouldActivate,
      isLocked: this.isLocked
    });
    
    this.handleActivation(shouldActivate, visibilityRatio);
  }
  
  checkScrollActivation() {
    if (!this.section) return;
    
    const rect = this.section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const sectionHeight = rect.height;
    
    // Calculate visibility
    const visibleTop = Math.max(0, -rect.top);
    const visibleBottom = Math.min(sectionHeight, viewportHeight - rect.top);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    const visibilityRatio = visibleHeight / viewportHeight;
    
    // ULTRA STRICT CRITERIA for perfect visual timing
    const shouldActivate = !this.isLocked && 
                           visibilityRatio >= 0.98 && // 98% visibility - extremely strict
                           rect.top <= 0 && // Section top must be at or above viewport top
                           rect.top >= -50 && // But not scrolled too far past
                           rect.bottom >= (viewportHeight - 20); // Must extend almost fully
    
    console.log('📍 Scroll Check:', {
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      viewportHeight: viewportHeight,
      visibility: Math.round(visibilityRatio * 100) + '%',
      shouldActivate,
      isLocked: this.isLocked
    });
    
    this.handleActivation(shouldActivate, visibilityRatio);
  }
  
  handleActivation(shouldActivate, visibilityRatio) {
    // If effect has completed once, never activate again
    if (this.hasCompletedOnce) {
      return;
    }
    
    if (shouldActivate && !this.isLocked) {
      console.log('🟢 ACTIVATING scroll lock');
      this.enableScrollLock();
    } else if (!shouldActivate && this.isLocked) {
      // Only disable if we're at boundaries OR section is barely visible
      if (this.scrollProgress <= 0 || this.scrollProgress >= 2 || visibilityRatio < 0.4) {
        console.log('🔴 DEACTIVATING scroll lock');
        this.disableScrollLock();
      }
    }
  }
  
  bindEvents() {
    // Wheel events (desktop)
    document.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    
    // Touch events (mobile) - distance-based progression
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    
    // Keyboard events for accessibility
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Resize handler
    window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 200));
  }
  
  handleWheel(event) {
    if (!this.isLocked) return;
    
    const deltaY = event.deltaY;
    
    // Only handle downward scrolling (fade in)
    if (deltaY > 0) {
      event.preventDefault();
      event.stopPropagation();
      
      this.scrollDirection = 'down';
      
      // Accumulate scroll delta for smooth progression
      this.accumulatedDelta += deltaY;
      
      // Calculate progress based on accumulated delta (0-2 range for two phases)
      const maxDelta = this.SCROLL_TICKS_FOR_COMPLETE_FADE * 120; // ~120px per wheel tick
      const progress = Math.max(0, Math.min(2, this.accumulatedDelta / maxDelta));
      
      this.updateScrollProgress(progress);
      
      // Check boundaries for scroll lock release
      this.checkScrollBoundaries();
    }
    // Allow natural upward scrolling (don't prevent default)
  }
  
  handleTouchStart(event) {
    if (!this.isLocked) return;
    
    this.isTouch = true;
    this.touchStartY = event.touches[0].clientY;
    this.touchStartTime = Date.now();
  }
  
  handleTouchMove(event) {
    if (!this.isLocked || !this.isTouch) return;
    
    const touchY = event.touches[0].clientY;
    const deltaY = this.touchStartY - touchY; // Inverted for natural touch direction
    
    // Only handle upward swiping (scroll down / fade in)
    if (deltaY > 0) {
      event.preventDefault();
      event.stopPropagation();
      
      this.scrollDirection = 'down';
      
      // Distance-based progression (more predictable than velocity)
      const touchDistance = deltaY;
      const maxTouchDistance = window.innerHeight * 0.6; // 60% of viewport height for full two-phase transition
      
      const progress = Math.min(2, this.scrollProgress + (touchDistance / maxTouchDistance));
      this.updateScrollProgress(progress);
    }
    // Allow natural downward swiping (don't prevent default)
  }
  
  handleTouchEnd(event) {
    if (!this.isLocked) return;
    
    this.isTouch = false;
    
    // Check boundaries for scroll lock release
    this.checkScrollBoundaries();
  }
  
  handleKeydown(event) {
    if (!this.isLocked) return;
    
    // Only support downward progression keys (fade in)
    const key = event.key;
    let deltaProgress = 0;
    
    switch (key) {
      case 'ArrowDown':
      case 'PageDown':
        event.preventDefault();
        deltaProgress = 0.1; // 10% increment
        this.scrollDirection = 'down';
        break;
      case 'End':
        event.preventDefault();
        deltaProgress = 2 - this.scrollProgress; // Jump to end (both phases completed)
        this.scrollDirection = 'down';
        break;
      default:
        return; // Don't handle ArrowUp, PageUp, or Home - allow natural scrolling
    }
    
    const newProgress = Math.max(0, Math.min(2, this.scrollProgress + deltaProgress));
    this.updateScrollProgress(newProgress);
    this.checkScrollBoundaries();
  }
  
  updateScrollProgress(progress) {
    this.scrollProgress = progress;
    
    // Update CSS custom property with smooth transition
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.section.style.setProperty('--scroll-progress', this.scrollProgress);
        this.ticking = false;
      });
      this.ticking = true;
    }
    
    // Debug logging (remove in production)
    if (window.location.hash.includes('debug')) {
      console.log(`Scroll Progress: ${Math.round(this.scrollProgress * 100)}%`);
    }
  }
  
  checkScrollBoundaries() {
    const tolerance = 0.02; // Small tolerance to prevent lock/unlock flickering
    
    if (this.scrollDirection === 'down' && this.scrollProgress >= (2 - tolerance)) {
      // Mark that both phases have completed - disable all future activations
      this.hasCompletedOnce = true;
      console.log('🏁 Both phases completed - scroll effect permanently disabled');
      
      // Both phases completed - release lock to continue scrolling down
      this.disableScrollLock();
      this.scrollToNextSection();
    }
    // Removed upward scroll boundary check - no fade out functionality
  }
  
  enableScrollLock() {
    this.isLocked = true;
    this.accumulatedDelta = this.scrollProgress * (this.SCROLL_TICKS_FOR_COMPLETE_FADE * 120);
    
    // Add blocked scroll class for styling
    document.body.classList.add('scroll-locked');
    
    // Announce to screen readers
    this.announceToScreenReader('Scroll interaction mode activated. Use arrow keys to navigate.');
    
    console.log('Scroll lock enabled');
  }
  
  disableScrollLock() {
    this.isLocked = false;
    
    // Remove blocked scroll class
    document.body.classList.remove('scroll-locked');
    
    // Reset scroll direction
    this.scrollDirection = 'none';
    
    console.log('Scroll lock disabled');
  }
  
  scrollToNextSection() {
    // Smooth scroll to next section after a brief delay
    setTimeout(() => {
      const nextSection = this.section.nextElementSibling;
      if (nextSection) {
        nextSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  }
  
  scrollToPreviousSection() {
    // Smooth scroll to previous section after a brief delay
    setTimeout(() => {
      const prevSection = this.section.previousElementSibling;
      if (prevSection) {
        prevSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  }
  
  handleResize() {
    // Reset state on resize to prevent issues
    if (this.isLocked) {
      this.disableScrollLock();
    }
  }
  
  // Utility Functions
  debounce(func, wait) {
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
  
  announceToScreenReader(message) {
    // Create temporary element for screen reader announcements
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
  
  // Public API for external control
  setProgress(progress) {
    if (progress >= 0 && progress <= 1) {
      this.updateScrollProgress(progress);
    }
  }
  
  getProgress() {
    return this.scrollProgress;
  }
  
  // TEMPORARY DEBUG METHOD
  addDebugControls() {
    const debugUI = document.createElement('div');
    debugUI.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px;
      border-radius: 8px;
      z-index: 10000;
      font-family: monospace;
      font-size: 12px;
    `;
    
    debugUI.innerHTML = `
      <div>Scroll Effect Debug</div>
      <div>Progress: <span id="progress-display">0%</span></div>
      <div>Locked: <span id="lock-status">No</span></div>
      <input type="range" id="progress-slider" min="0" max="100" value="0" style="width: 200px;">
      <br><br>
      <button id="test-25">25%</button>
      <button id="test-50">50%</button>
      <button id="test-100">100%</button>
      <button id="toggle-lock">Toggle Lock</button>
    `;
    
    document.body.appendChild(debugUI);
    
    // Set up debug controls
    const progressSlider = document.getElementById('progress-slider');
    const progressDisplay = document.getElementById('progress-display');
    const lockStatus = document.getElementById('lock-status');
    
    progressSlider.addEventListener('input', (e) => {
      const progress = parseInt(e.target.value) / 100;
      this.updateScrollProgress(progress);
      progressDisplay.textContent = `${Math.round(progress * 100)}%`;
    });
    
    document.getElementById('test-25').addEventListener('click', () => {
      this.updateScrollProgress(0.25);
      progressSlider.value = 25;
      progressDisplay.textContent = '25%';
    });
    
    document.getElementById('test-50').addEventListener('click', () => {
      this.updateScrollProgress(0.5);
      progressSlider.value = 50;
      progressDisplay.textContent = '50%';
    });
    
    document.getElementById('test-100').addEventListener('click', () => {
      this.updateScrollProgress(1.0);
      progressSlider.value = 100;
      progressDisplay.textContent = '100%';
    });
    
    document.getElementById('toggle-lock').addEventListener('click', () => {
      if (this.isLocked) {
        this.disableScrollLock();
        lockStatus.textContent = 'No';
      } else {
        this.enableScrollLock();
        lockStatus.textContent = 'Yes';
      }
    });
    
    // Update UI periodically
    setInterval(() => {
      progressDisplay.textContent = `${Math.round(this.scrollProgress * 100)}%`;
      lockStatus.textContent = this.isLocked ? 'Yes' : 'No';
      progressSlider.value = Math.round(this.scrollProgress * 100);
    }, 100);
    
    console.log('🎛️ Debug controls added - check top right corner');
  }

  destroy() {
    // Cleanup method for removing event listeners
    document.removeEventListener('wheel', this.handleWheel.bind(this));
    document.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    document.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    document.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    this.disableScrollLock();
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
