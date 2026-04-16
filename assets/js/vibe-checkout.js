// ==========================================
// VIBE LAB - REGISTRATION FORM HANDLER
// ==========================================
// Handles form submission with email fallback.
// To enable Stripe checkout, configure PAYMENT_LINKS
// with live Stripe Payment Link URLs.

// Payment Links - configure with live Stripe Payment Links when ready
const PAYMENT_LINKS = {
  'early-bird': '', // e.g. 'https://buy.stripe.com/live_...'
  'standard': ''    // e.g. 'https://buy.stripe.com/live_...'
};

// Product configuration
const PRODUCTS = {
  'early-bird': {
    name: 'Vibe Lab - Early Bird',
    price: 695,
    description: 'Save $100 - Early bird pricing'
  },
  'standard': {
    name: 'Vibe Lab - Standard Rate',
    price: 795,
    description: 'Full access to the complete 6-week program'
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize on vibe-lab page
  if (!window.location.pathname.includes('vibe-lab')) return;

  initializeRegistrationForm();
});

// Initialize the registration form
function initializeRegistrationForm() {
  const form = document.getElementById('vibe-lab-registration');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    handleFormSubmission(form);
  });
}

// Handle form submission
function handleFormSubmission(form) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Validate required fields
  if (!data.firstName || !data.lastName || !data.studentEmail || !data.country || !data.timeZone || !data.age) {
    alert('Please fill in all required fields.');
    return;
  }

  // Validate age range
  const age = parseInt(data.age);
  if (age < 14 || age > 18) {
    alert('Students must be between 14-18 years old.');
    return;
  }

  // Submit via email (default method)
  submitViaEmail(data);
}

// Submit registration via email
function submitViaEmail(data) {
  const subject = encodeURIComponent('Vibe Lab Registration');
  const body = encodeURIComponent(
    `Hi SureStart team,\n\n` +
    `I'd like to register for the Vibe Lab course.\n\n` +
    `Student Details:\n` +
    `- Name: ${data.firstName} ${data.lastName}\n` +
    `- Email: ${data.studentEmail}\n` +
    `- Country: ${data.country}\n` +
    `- Time Zone: ${data.timeZone}\n` +
    `- Age: ${data.age}\n` +
    (data.parentName ? `- Parent Name: ${data.parentName}\n` : '') +
    (data.parentEmail ? `- Parent Email: ${data.parentEmail}\n` : '') +
    (data.newsletter ? `- Newsletter: Yes\n` : '') +
    `\nPlease send me enrollment details and payment instructions.\n\n` +
    `Thank you!`
  );

  window.location.href = `mailto:hello@surestart.com?subject=${subject}&body=${body}`;
}

// Redirect to Stripe Payment Link (for future use when configured)
function redirectToCheckout(productType) {
  const paymentLink = PAYMENT_LINKS[productType];

  if (paymentLink) {
    window.location.href = paymentLink;
    return;
  }

  // Fallback to email if payment link not configured
  const product = PRODUCTS[productType];
  if (!product) {
    console.error('Invalid product type:', productType);
    return;
  }

  fallbackToEmail(productType);
}

// Fallback email contact for a specific product
function fallbackToEmail(productType) {
  const product = PRODUCTS[productType];
  const subject = encodeURIComponent(`Vibe Lab Registration - ${product.name}`);
  const body = encodeURIComponent(
    `Hi SureStart team,\n\n` +
    `I'd like to register for the Vibe Lab course:\n` +
    `- Product: ${product.name}\n` +
    `- Price: $${product.price}\n\n` +
    `Please send me payment instructions and enrollment details.\n\n` +
    `Thank you!`
  );

  window.location.href = `mailto:hello@surestart.com?subject=${subject}&body=${body}`;
}

// Export functions for global access
window.redirectToCheckout = redirectToCheckout;
window.fallbackToEmail = fallbackToEmail;
