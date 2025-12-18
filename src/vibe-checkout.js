// ==========================================
// VIBE LAB - STRIPE CHECKOUT INTEGRATION
// ==========================================

// Stripe configuration - using actual publishable key from .env
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SKhnRDY0bpNXGvuLOrg7CvEE6MPXTKvRVdxl4yjagnBSgurFxh5bD3KWRnt80lbiapN8qhBJe6H2f66x5KG9VBP00zDTaOiaA';

// Product configuration with actual Stripe product IDs
const PRODUCTS = {
  'early-bird': {
    name: 'Vibe Lab - Early Bird',
    price: 50000, // $500 in cents
    description: 'Save $99 - Limited time offer for first 15 students',
    productId: 'prod_THHHMgUhBhCn14' // Actual Stripe product ID
  },
  'standard': {
    name: 'Vibe Lab - Standard Rate',
    price: 59900, // $599 in cents
    description: 'Full access to the complete 5-week program',
    productId: 'prod_THHJCm5n5Psa' // Actual Stripe product ID
  }
};

// Initialize Stripe
let stripe;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize Stripe if we're on the vibe coding page
  if (window.location.pathname.includes('vibe-coding.html')) {
    initializeStripe();
  }
  
  // Initialize scroll animations
  initializeScrollAnimations();
});

// Initialize Stripe
function initializeStripe() {
  try {
    stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
  } catch (error) {
    console.error('Error initializing Stripe:', error);
    // Fallback to email contact
    setupFallbackCheckout();
  }
}

// Redirect to Stripe Payment Links (for static websites)
async function redirectToCheckout(productType) {
  const product = PRODUCTS[productType];
  if (!product) {
    console.error('Invalid product type:', productType);
    return;
  }

  // Show loading state
  showCheckoutLoading(true);
  
  // Payment Links from your Stripe Dashboard
  const PAYMENT_LINKS = {
    'early-bird': 'https://buy.stripe.com/test_00w9AT1encoo4e412u28801', // Early Bird payment link
    'standard': 'https://buy.stripe.com/test_dRm00jf5dbkkeSI9z028800'     // Standard payment link
  };
  
  try {
    const paymentLink = PAYMENT_LINKS[productType];
    
    if (paymentLink && !paymentLink.includes('_link_here')) {
      // Direct redirect to Stripe Payment Link
      window.location.href = paymentLink;
      return;
    }
    
    // If payment link not created yet, fall back to email
    console.warn('Payment link not configured for:', productType);
    throw new Error('Payment link not configured');
    
  } catch (error) {
    console.error('Error redirecting to Stripe:', error);
    hideCheckoutLoading();
    
    // Fallback to direct contact
    fallbackToEmail(productType);
  }
}

// Fallback when Stripe is not available
function fallbackToEmail(productType) {
  const product = PRODUCTS[productType];
  const subject = encodeURIComponent(`Vibe Lab Registration - ${product.name}`);
  const body = encodeURIComponent(`Hi SureStart team,

I'd like to register for the Vibe Lab course:
- Product: ${product.name}
- Price: $${product.price / 100}
- Cohort: January 2026

Please send me payment instructions and enrollment details.

Thank you!`);
  
  window.location.href = `mailto:hello@surestart.com?subject=${subject}&body=${body}`;
}

// Setup fallback checkout for when Stripe is not configured
function setupFallbackCheckout() {
  // Replace all checkout buttons with email contact
  const checkoutButtons = document.querySelectorAll('[onclick*="redirectToCheckout"]');
  checkoutButtons.forEach(button => {
    const productType = button.getAttribute('onclick').match(/redirectToCheckout\('([^']+)'\)/)[1];
    button.setAttribute('onclick', `fallbackToEmail('${productType}')`);
    
    // Update button text to indicate email contact
    const span = button.querySelector('span');
    if (span) {
      span.textContent = span.textContent.replace('Secure Your Spot', 'Contact Us');
      span.textContent = span.textContent.replace('Join the Cohort', 'Contact Us');
    }
  });
}

// Show/hide checkout loading
function showCheckoutLoading(show = true) {
  let loadingDiv = document.getElementById('checkout-loading');
  
  if (!loadingDiv) {
    loadingDiv = document.createElement('div');
    loadingDiv.id = 'checkout-loading';
    loadingDiv.className = 'checkout-loading';
    loadingDiv.innerHTML = '<div>Redirecting to secure checkout...</div>';
    document.body.appendChild(loadingDiv);
  }
  
  if (show) {
    loadingDiv.classList.add('active');
    // Disable all checkout buttons
    document.querySelectorAll('.btn-pricing').forEach(btn => {
      btn.disabled = true;
    });
  } else {
    hideCheckoutLoading();
  }
}

function hideCheckoutLoading() {
  const loadingDiv = document.getElementById('checkout-loading');
  if (loadingDiv) {
    loadingDiv.classList.remove('active');
  }
  
  // Re-enable checkout buttons
  document.querySelectorAll('.btn-pricing').forEach(btn => {
    btn.disabled = false;
  });
}

// Scroll animations
function initializeScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, observerOptions);

  // Observe all fade-up elements
  document.querySelectorAll('.fade-up').forEach(el => {
    observer.observe(el);
  });
}

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', function() {
  // Handle smooth scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});

// Export functions for global access
window.redirectToCheckout = redirectToCheckout;
window.fallbackToEmail = fallbackToEmail;
