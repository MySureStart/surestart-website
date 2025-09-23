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
// STUDENT NETWORK WEB VISUALIZATION
// ==========================================

class StudentNetworkWeb {
  constructor() {
    this.canvas = document.getElementById('networkCanvas');
    this.ctx = null;
    this.activeNodeCanvas = null;
    this.activeNodeCtx = null;
    this.testimonialCard = document.getElementById('testimonialCard');
    this.testimonialClose = document.getElementById('testimonialClose');
    
    // Network properties
    this.nodes = [];
    this.connections = [];
    this.particles = [];
    this.activeNode = null;
    this.isAnimating = false;
    this.animationId = null;
    
    // Canvas properties
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.centerX = 0;
    this.centerY = 0;
    
    // Animation properties
    this.time = 0;
    this.targetPositions = new Map();
    
    // Student data with exact information from HTML - 20 students total
    this.studentData = [
      {
        id: 'netra',
        name: 'Netra Ramesh',
        program: '2021 trainee',
        quote: 'My life changed because of the MIT FutureMaker program! I\'ve never been so passionate about my future — the program gave me a chance to learn, communicate with people I wanted to be like, and experience a formal and organized community like SureStart. I\'ve searched far and wide and I\'ve only found Surestart to provide a FREE program that provides a mentor and multiple benefits. I would most definitely recommend this program — it changed my vision and focus for the future!',
        image: 'https://mysurestart.com/s/Netra-Ramesh.jpg',
        size: 'large',
        color: '#E7304E' // ss-red
      },
      {
        id: 'ammran',
        name: 'Ammran H Mohamed',
        program: '2021-2022 trainee',
        quote: 'Thank you so much SureStart! From the mentorship provided to the coding gym, you all have helped me enhance my skills and showed me ways to continue to strengthen them well after the programs. I never hesitated to reach out to you whether it was resume help or for guidance on what interviewers want to see. Because of your endless support, I\'ve been able to surprise myself with my work and achievements and you all have helped me reach goals I\'ve set for myself! Because I only have just over 1.5 years of coding experience, I\'ve struggled so much with my internship search. However, with your help I\'ve received offers for roles at the top of my list!',
        image: 'https://mysurestart.com/s/Amman.jpeg',
        size: 'extra-large',
        color: '#ED7C4B' // ss-orange
      },
      {
        id: 'ashmita',
        name: 'Ashmita Kumar',
        program: '2021 trainee',
        quote: 'This program has been truly amazing. StartStart\'s passion really does show through and the experience you created is unforgettable. My team could not have made the app without your support and guidance. You gave me the tools to design a solution to a problem close to my heart, and I really can\'t thank you enough.',
        image: 'https://mysurestart.com/s/Ashmita-Kumar.jfif',
        size: 'medium',
        color: '#FFB65F' // ss-yellow
      },
      {
        id: 'milan',
        name: 'Milan Ferus-Comelo',
        program: '2021 trainee',
        quote: 'Thank you VERY, VERY much for organizing such an amazing program! I\'m incredibly honored to be part of such a tightly-knit community and marvel at how far we\'ve come and how much we have learned. I hope we stay in touch!',
        image: 'https://mysurestart.com/s/Milan-Ferus-Comelo.jfif',
        size: 'small',
        color: '#EE2D6E' // ss-pink
      },
      {
        id: 'nouran',
        name: 'Nouran Ali',
        program: '2021 trainee',
        quote: 'Being a student in the SureStart program boosted my skills and resume and helped me to get job offers and interviews at reputable companies. During the program, the live sessions introduced new topics like CV writing and interview skills, career coaching, other advanced DL topics and more. I\'m glad that I was a part of this program and I encourage all students to apply, it\'s a great opportunity!',
        image: 'https://mysurestart.com/s/Nouran-Ali.jpg',
        size: 'medium',
        color: '#E7304E' // ss-red
      },
      {
        id: 'jed',
        name: 'Jed Rendo Margarcia',
        program: '2021 & 2022 trainee',
        quote: 'I love the fact that the SureStart program is heavily project-based learning. I am able to apply it to future projects instead of just learning the theory behind certain algorithms. I\'m excited to compete in the Create-a-thon so that I can apply what I have learned to projects that could potentially help others and put those learnings into practice.',
        image: 'https://mysurestart.com/s/Jed-Rendo-Margarcia.jfif',
        size: 'large',
        color: '#ED7C4B' // ss-orange
      },
      {
        id: 'sarah',
        name: 'Sarah Tran',
        program: '2020 trainee',
        quote: 'In between the daily curriculum which helps to keep me on track, the fun webinars/chats intertwined that have helped to inspire me to persevere throughout these courses, and my amazing mentor, I have really been enjoying my EMPath experience so far! Thank you for everything you have done to help build such an exciting program. Looking forward to the makeathon phase!',
        image: 'https://mysurestart.com/s/Sarah-Tran.jfif',
        size: 'small',
        color: '#FFB65F' // ss-yellow
      },
      {
        id: 'vitaliy',
        name: 'Vitaliy Stephanov',
        program: '2021 trainee',
        quote: 'SureStart helped prepare me with the skills I needed to become a Software Development Engineer at Amazon Web Services. Amazon takes leadership principles very seriously. I learned how to be a leader from 14 tech talks and the unique entrepreneurial makeathon. Designing and implementing an IoT device provided valuable resume experience and behavioral interview stories. I am now on a IoT team at AWS that impacts billions of devices.',
        image: 'https://mysurestart.com/s/Vitaliy-S.jpg',
        size: 'extra-large',
        color: '#EE2D6E' // ss-pink
      },
      {
        id: 'ashna',
        name: 'Ashna Khetan',
        program: '2020 trainee',
        quote: 'Thank you so much for the amazing opportunity to join this 5 week program. I\'ve learned so much — not just limited to machine learning and coding, but also about how to market myself in the tech world, the necessity for inclusivity in tech workplaces, and how to lead a happy, successful life in general. This program was certainly the highlight of my summer.',
        image: 'https://mysurestart.com/s/Ashna-Khetan.jfif',
        size: 'medium',
        color: '#E7304E' // ss-red
      },
      {
        id: 'walee',
        name: 'Walee Attia',
        program: '2020 trainee',
        quote: 'I really enjoyed learning about computer vision, and working with Affectiva\'s SDK to build the eye closure detector — beyond cool. I\'m grateful to have been inspired by your mentorship and advice throughout the 5 week program. My team\'s presentation really benefited a lot from the tips you gave us and were able to polish up our prototype. Lastly, my mentor was amazing! He often went out of his way to help us or reached out to share other resources that he thought could help us navigate some issues. He also worked around our team\'s time differences even when it was clearly inconvenient to his schedule.',
        image: 'https://mysurestart.com/s/Walee-Attia.jfif',
        size: 'small',
        color: '#ED7C4B' // ss-orange
      },
      {
        id: 'hadeel',
        name: 'Hadeel Mabrouk',
        program: '2020 trainee',
        quote: 'It has been an honor and a pleasure being part of the EMPath program this year. It\'s actually one of the most important highlights of this year for me. Thank you so much for your tremendous support and encouragement since day 1! I so much hope our paths will cross again one day. :)',
        image: 'https://mysurestart.com/s/Hadeel-Mabrouk.jfif',
        size: 'medium',
        color: '#FFB65F' // ss-yellow
      },
      {
        id: 'wilder',
        name: 'Wilder Crosier',
        program: '2020 trainee',
        quote: 'Thank you so much for organizing such an incredible program. I had no idea what I would do this July, I thought I would just be stuck at home. EMPath was a really incredible opportunity to offer all of us students a chance to learn technical skills, meet interesting people, and experience a little bit of what it\'s like to be in a start-up and design a product. The SureStart team was so kind and welcoming to everyone, and for our group specifically, your support in our meetings gave us a clear understanding of what we were doing.',
        image: 'https://mysurestart.com/s/Wilder-Crosier.jfif',
        size: 'extra-small',
        color: '#EE2D6E' // ss-pink
      },
      {
        id: 'roberto',
        name: 'Roberto Martinez',
        program: '2020 trainee',
        quote: 'Taking part in the EMPath program was an incredible and very insightful experience. I will make sure to put everything I learned to good use. I would just once again like to thank SureStart for everything you did during these past 5-6 weeks and I hope we can remain in contact.',
        image: 'https://mysurestart.com/s/Roberto-Martinez.jpg',
        size: 'large',
        color: '#E7304E' // ss-red
      },
      {
        id: 'catherine',
        name: 'Catherine Lu',
        program: '2020 trainee',
        quote: 'The SureStart program was such a great experience, and I\'m so thankful to have been able to attend. Our team is extremely grateful for the positive responses we received towards Introspect. We were very passionate about this project from the beginning of the Makeathon, and we would love to pursue this idea further into a full-fledged product!',
        image: 'https://mysurestart.com/s/Catherine-Lu.jfif',
        size: 'small',
        color: '#ED7C4B' // ss-orange
      },
      {
        id: 'eli',
        name: 'Eli Gnesin',
        program: '2021 trainee',
        quote: 'I\'ve learned a lot of the ins and outs of neural networks in Phase 1, which I enjoyed and which will help me in a wide variety of applications. I\'m excited for the Makeathon to put what we\'ve learned into practice and solve a new and exciting problem.',
        image: 'https://mysurestart.com/s/Eli-Gnesin.jfif',
        size: 'medium',
        color: '#FFB65F' // ss-yellow
      },
      {
        id: 'alexa',
        name: 'Alexa Urrea',
        program: '2021 trainee',
        quote: 'SureStart dramatically and directly impacted my life. Before this program, I had no idea I wanted to be involved in the tech community like I do now. Thanks to SureStart, I found a real passion in computer science and in Artificial Intelligence specifically. It helped me land my first ever internship with a great company as a machine learning intern. I would not have found this passion and I definitely would not have these career doors open without SureStart. Thank you so much for your support and believing in all of us!',
        image: 'https://mysurestart.com/s/Alexa-Urrea.jpg',
        size: 'extra-large',
        color: '#EE2D6E' // ss-pink
      },
      {
        id: 'jonathan',
        name: 'Jonathan Williams',
        program: '2021 trainee',
        quote: 'The SureStart program was truly transformative. The course curriculum and mentor guidance allowed me to gain a deep understanding of ML. Moreover, the program connected me with a fulfilling ML internship opportunity. I simply cannot recommend this program enough!',
        image: 'https://mysurestart.com/s/Jonathan-Williams.jpg',
        size: 'large',
        color: '#E7304E' // ss-red
      },
      {
        id: 'sahana',
        name: 'Sahana Sreeram',
        program: '2021 trainee',
        quote: 'The SureStart summer program was the most impactful technology experience that I have had so far. It combined hands-on applied machine learning concepts with a unique focus on AI ethics, and culminated with an incredible showcase of the team-created projects. The caliber of members of the program and the quality of ideas in the final presentations blew me away, and I felt that each and every one of the final team products had the potential to change the world. The program taught me some important life skills as well - the art of storytelling, how to work collaboratively in a virtual setting, and how to create lasting relationships with mentors. I\'m so thankful to SureStart for providing me with this wonderful opportunity.',
        image: 'https://mysurestart.com/s/Sahana-Sreeram.jpg',
        size: 'extra-small',
        color: '#ED7C4B' // ss-orange
      },
      {
        id: 'mohamed',
        name: 'Mohamed Abead',
        program: '2020 trainee',
        quote: 'I feel like I have grown a lot through EMPath; I have managed to learn a lot about emotional AI and gained hands-on experience working on an app, while growing my interpersonal skills and getting to meet amazing people from all over the U.S and the world. I feel like I have learnt a lot about team collaboration through our daily meetings and by working on our app with the team.',
        image: 'https://mysurestart.com/s/Mohamed-Abead.jpg',
        size: 'medium',
        color: '#FFB65F' // ss-yellow
      },
      {
        id: 'jason',
        name: 'Jason Jerome',
        program: '2021 trainee',
        quote: 'The SureStart program was a learning experience unlike anything I\'ve participated in before. The daily mentorship, team-based learning process, the well-paced curriculum, and the ample resources provided made it possible to learn difficult concepts with no prior experience! Thanks to the dedicated mentors and SureStart staff, I was able to excel in applying the concepts learned from the curriculum in the Makeathon. SureStart has also greatly been involved in helping me find internships after completing the program, and thanks to their support I was recently offered a summer internship!',
        image: 'https://mysurestart.com/s/Jason-Jerome.jpg',
        size: 'small',
        color: '#EE2D6E' // ss-pink
      }
    ];
    
    this.init();
  }

  async init() {
    try {
      if (!this.canvas) {
        console.warn('Network canvas not found');
        return;
      }
      
      console.log('Initializing StudentNetworkWeb...');
      this.ctx = this.canvas.getContext('2d');
      
      if (!this.ctx) {
        console.error('Failed to get canvas context');
        return;
      }
      
      this.setupCanvas();
      this.createActiveNodeCanvas();
      await this.loadImages();
      this.createNodes();
      this.createConnections();
      this.addEventListeners();
      this.startAnimation();
      console.log('StudentNetworkWeb initialized successfully');
    } catch (error) {
      console.error('Error initializing StudentNetworkWeb:', error);
      // Gracefully fail without crashing the page
      if (this.canvas) {
        this.canvas.style.display = 'none';
      }
    }
  }

  setupCanvas() {
    // Get true full viewport width minus minimal padding
    const dpr = window.devicePixelRatio || 1;
    
    // Use full viewport width with minimal padding
    this.canvasWidth = window.innerWidth - 40; // 20px padding on each side
    
    // Calculate dynamic height based on optimal node distribution - reduced spacing
    const nodeCount = this.studentData.length;
    const optimalArea = nodeCount * 20000; // Reduced from 25000 to 20000 for less spacing
    const aspectRatio = this.canvasWidth / Math.sqrt(optimalArea);
    this.canvasHeight = Math.max(800, Math.min(1400, Math.sqrt(optimalArea) / aspectRatio)); // Reduced min/max heights
    
    this.centerX = this.canvasWidth / 2;
    this.centerY = this.canvasHeight / 2;
    
    console.log('Canvas dimensions:', this.canvasWidth, 'x', this.canvasHeight);
    
    // Set actual canvas size for crisp rendering
    this.canvas.width = this.canvasWidth * dpr;
    this.canvas.height = this.canvasHeight * dpr;
    this.ctx.scale(dpr, dpr);
    
    // Set display size
    this.canvas.style.width = this.canvasWidth + 'px';
    this.canvas.style.height = this.canvasHeight + 'px';
  }

  createActiveNodeCanvas() {
    // Create a separate canvas for the active node that will appear above the testimonial card
    this.activeNodeCanvas = document.createElement('canvas');
    this.activeNodeCanvas.style.position = 'fixed';
    this.activeNodeCanvas.style.top = '0';
    this.activeNodeCanvas.style.left = '0';
    this.activeNodeCanvas.style.pointerEvents = 'none';
    this.activeNodeCanvas.style.zIndex = '900'; // Higher than testimonial card (800)
    
    // Insert into document body for fixed positioning
    document.body.appendChild(this.activeNodeCanvas);
    this.activeNodeCtx = this.activeNodeCanvas.getContext('2d');
    
    // Set up the active node canvas to cover full viewport
    const dpr = window.devicePixelRatio || 1;
    this.activeNodeCanvas.width = window.innerWidth * dpr;
    this.activeNodeCanvas.height = window.innerHeight * dpr;
    this.activeNodeCtx.scale(dpr, dpr);
    
    this.activeNodeCanvas.style.width = window.innerWidth + 'px';
    this.activeNodeCanvas.style.height = window.innerHeight + 'px';
  }

  async loadImages() {
    const imagePromises = this.studentData.map(student => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        // Remove crossOrigin to avoid CORS issues when loading from local files
        // img.crossOrigin = 'anonymous';
        img.onload = () => {
          student.imageElement = img;
          console.log(`Successfully loaded image for ${student.name}`);
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load image for ${student.name}, will use fallback`);
          // Try loading without CORS restrictions
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            student.imageElement = fallbackImg;
            console.log(`Fallback image loaded for ${student.name}`);
            resolve();
          };
          fallbackImg.onerror = () => {
            console.warn(`Fallback also failed for ${student.name}`);
            resolve(); // Continue even if image fails
          };
          fallbackImg.src = student.image;
        };
        img.src = student.image;
      });
    });
    
    await Promise.all(imagePromises);
  }

  createNodes() {
    this.nodes = [];
    
    // Create nodes in an organic web pattern
    const positions = this.generateOrganicPositions(this.studentData.length);
    
    this.studentData.forEach((student, index) => {
      const pos = positions[index];
      const radius = this.getNodeRadius(student.size);
      
      const node = {
        id: student.id,
        x: pos.x,
        y: pos.y,
        targetX: pos.x,
        targetY: pos.y,
        originalX: pos.x,
        originalY: pos.y,
        radius: radius,
        student: student,
        isActive: false,
        isCentered: false,
        scale: 1,
        targetScale: 1,
        opacity: 1,
        targetOpacity: 1,
        glowIntensity: 0,
        pulsePhase: Math.random() * Math.PI * 2,
        // Floating animation properties
        floatPhase: Math.random() * Math.PI * 2, // Random starting phase for natural movement
        floatSpeed: 0.008 + Math.random() * 0.004, // Slightly different speeds (0.008-0.012)
        floatAmplitudeX: 1.5 + Math.random() * 1, // Horizontal float range (1.5-2.5px)
        floatAmplitudeY: 2 + Math.random() * 1.5, // Vertical float range (2-3.5px)
        baseX: pos.x, // Store the base position for floating calculations
        baseY: pos.y
      };
      
      this.nodes.push(node);
    });
  }

  generateOrganicPositions(count) {
    const margin = 60;
    const width = this.canvasWidth - (margin * 2);
    const height = this.canvasHeight - (margin * 2);
    
    const positions = [];
    const minDistance = 120; // Minimum distance between node centers to prevent overlap
    
    // Create a deterministic seeded random function for consistent positioning
    const seededRandom = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    // Create a more distributed grid-based approach with deterministic organic variation
    const cols = Math.ceil(Math.sqrt(count * (width / height)));
    const rows = Math.ceil(count / cols);
    const cellWidth = width / cols;
    const cellHeight = height / rows;
    
    let nodeIndex = 0;
    
    // Distribute nodes across the entire canvas area
    for (let row = 0; row < rows && nodeIndex < count; row++) {
      for (let col = 0; col < cols && nodeIndex < count; col++) {
        // Base position in grid cell
        const baseCellX = col * cellWidth + cellWidth / 2;
        const baseCellY = row * cellHeight + cellHeight / 2;
        
        // Add deterministic organic variation using node index as seed
        const seedX = nodeIndex * 7.3 + row * 2.1 + col * 3.7; // Different seeds for X and Y
        const seedY = nodeIndex * 5.7 + row * 4.2 + col * 1.9;
        
        const variationX = (seededRandom(seedX) - 0.5) * cellWidth * 0.6; // Reduced variation for better control
        const variationY = (seededRandom(seedY) - 0.5) * cellHeight * 0.6;
        
        let x = baseCellX + variationX + margin;
        let y = baseCellY + variationY + margin;
        
        // Ensure position is within canvas bounds
        x = Math.max(margin + 50, Math.min(this.canvasWidth - margin - 50, x));
        y = Math.max(margin + 50, Math.min(this.canvasHeight - margin - 50, y));
        
        // Check for overlaps with existing positions and adjust if needed
        let attempts = 0;
        const maxAttempts = 50; // Increased attempts for better overlap resolution
        
        while (attempts < maxAttempts) {
          let hasOverlap = false;
          let closestDistance = Infinity;
          let closestNode = null;
          
          // Find the closest overlapping node
          for (const existingPos of positions) {
            const distance = Math.sqrt(
              Math.pow(x - existingPos.x, 2) + Math.pow(y - existingPos.y, 2)
            );
            
            if (distance < minDistance && distance < closestDistance) {
              hasOverlap = true;
              closestDistance = distance;
              closestNode = existingPos;
            }
          }
          
          if (!hasOverlap) break;
          
          // Move away from the closest overlapping node deterministically
          const dx = x - closestNode.x;
          const dy = y - closestNode.y;
          const currentDistance = Math.sqrt(dx * dx + dy * dy);
          
          if (currentDistance > 0) {
            // Normalize direction and move to minimum distance
            const normalizedDx = dx / currentDistance;
            const normalizedDy = dy / currentDistance;
            
            x = closestNode.x + normalizedDx * minDistance;
            y = closestNode.y + normalizedDy * minDistance;
          } else {
            // If nodes are at exact same position, use deterministic angle
            const angle = seededRandom(nodeIndex * 11.3 + attempts * 2.7) * Math.PI * 2;
            x = closestNode.x + Math.cos(angle) * minDistance;
            y = closestNode.y + Math.sin(angle) * minDistance;
          }
          
          // Keep within bounds
          x = Math.max(margin + 50, Math.min(this.canvasWidth - margin - 50, x));
          y = Math.max(margin + 50, Math.min(this.canvasHeight - margin - 50, y));
          
          attempts++;
        }
        
        positions.push({ x, y });
        nodeIndex++;
      }
    }
    
    return positions;
  }


  getNodeRadius(size) {
    switch (size) {
      case 'extra-large': return 85;
      case 'large': return 75;
      case 'medium': return 65;
      case 'small': return 58;
      case 'extra-small': return 52;
      default: return 65;
    }
  }

  createConnections() {
    this.connections = [];
    
    // Create a connected network ensuring no isolated nodes
    const nodeCount = this.nodes.length;
    const minConnectionsPerNode = 2; // Ensure at least 2 connections per node
    const maxConnectionsPerNode = Math.min(5, Math.ceil(nodeCount / 4)); // Scale with node count
    const maxDistance = Math.min(this.canvasWidth, this.canvasHeight) * 0.45; // Slightly increased for better connectivity
    
    // First, create a minimum spanning tree to ensure connectivity
    const connected = new Set([0]);
    const unconnected = new Set();
    for (let i = 1; i < nodeCount; i++) {
      unconnected.add(i);
    }
    
    // Connect each unconnected node to the nearest connected node
    while (unconnected.size > 0) {
      let minDistance = Infinity;
      let bestConnection = null;
      
      for (const unconnectedIndex of unconnected) {
        for (const connectedIndex of connected) {
          const distance = this.getDistance(
            this.nodes[unconnectedIndex],
            this.nodes[connectedIndex]
          );
          
          if (distance < minDistance && distance <= maxDistance) {
            minDistance = distance;
            bestConnection = { from: connectedIndex, to: unconnectedIndex };
          }
        }
      }
      
      // If no close connection found, connect to any connected node
      if (!bestConnection) {
        const connectedArray = Array.from(connected);
        const randomConnected = connectedArray[Math.floor(Math.random() * connectedArray.length)];
        const unconnectedArray = Array.from(unconnected);
        bestConnection = { from: randomConnected, to: unconnectedArray[0] };
      }
      
      if (bestConnection) {
        this.connections.push(bestConnection);
        connected.add(bestConnection.to);
        unconnected.delete(bestConnection.to);
      }
    }
    
    // Ensure every node has at least minConnectionsPerNode connections
    for (let i = 0; i < nodeCount; i++) {
      const currentConnections = this.connections.filter(
        conn => conn.from === i || conn.to === i
      ).length;
      
      if (currentConnections < minConnectionsPerNode) {
        const distances = [];
        for (let j = 0; j < nodeCount; j++) {
          if (i !== j) {
            const distance = this.getDistance(this.nodes[i], this.nodes[j]);
            if (distance <= maxDistance) { // Only consider nearby nodes
              distances.push({ index: j, distance });
            }
          }
        }
        
        distances.sort((a, b) => a.distance - b.distance);
        
        const neededConnections = minConnectionsPerNode - currentConnections;
        
        for (let k = 0; k < Math.min(neededConnections, distances.length); k++) {
          const { index } = distances[k];
          
          // Check if connection already exists
          const exists = this.connections.some(
            conn => (conn.from === i && conn.to === index) || 
                    (conn.from === index && conn.to === i)
          );
          
          if (!exists) {
            this.connections.push({ from: i, to: index });
          }
        }
      }
    }
    
    // Add additional connections for richer network, but respect max limit
    for (let i = 0; i < nodeCount; i++) {
      const currentConnections = this.connections.filter(
        conn => conn.from === i || conn.to === i
      ).length;
      
      if (currentConnections < maxConnectionsPerNode) {
        const distances = [];
        for (let j = 0; j < nodeCount; j++) {
          if (i !== j) {
            const distance = this.getDistance(this.nodes[i], this.nodes[j]);
            if (distance <= maxDistance) { // Only consider nearby nodes
              distances.push({ index: j, distance });
            }
          }
        }
        
        distances.sort((a, b) => a.distance - b.distance);
        
        const additionalConnections = Math.min(
          maxConnectionsPerNode - currentConnections,
          distances.length
        );
        
        for (let k = 0; k < additionalConnections; k++) {
          const { index } = distances[k];
          
          // Check if connection already exists
          const exists = this.connections.some(
            conn => (conn.from === i && conn.to === index) || 
                    (conn.from === index && conn.to === i)
          );
          
          if (!exists) {
            this.connections.push({ from: i, to: index });
          }
        }
      }
    }
  }

  getDistance(node1, node2) {
    const dx = node1.x - node2.x;
    const dy = node1.y - node2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  addEventListeners() {
    // Canvas click handling
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const clickedNode = this.getNodeAt(x, y);
      
      if (clickedNode) {
        this.centerNode(clickedNode);
      } else {
        this.resetNetwork();
      }
    });
    
    // Canvas hover handling
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const hoveredNode = this.getNodeAt(x, y);
      const hoveredConnection = this.getConnectionAt(x, y);
      
      this.canvas.style.cursor = (hoveredNode || hoveredConnection) ? 'pointer' : 'default';
      
      // Update hover effects
      this.nodes.forEach(node => {
        node.isHovered = node === hoveredNode;
      });
      
      // Update connection hover effects
      this.connections.forEach(conn => {
        conn.isHovered = conn === hoveredConnection;
      });
    });
    
    // Testimonial card close button
    if (this.testimonialClose) {
      this.testimonialClose.addEventListener('click', () => {
        this.hideTestimonial();
        this.resetNetwork();
      });
    }
    
    // Window resize handling
    window.addEventListener('resize', debounce(() => {
      this.setupCanvas();
      this.createNodes();
      this.createConnections();
      // Reposition testimonial card if active (for window resize only)
      if (this.activeNode) {
        this.positionTestimonialCard();
      }
    }, 250));
  }

  getNodeAt(x, y) {
    // Check nodes in reverse order so nodes drawn on top (active nodes) are detected first
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      const dx = x - node.x;
      const dy = y - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Use actual visual radius including scale for accurate detection
      const effectiveRadius = node.radius * node.scale;
      
      if (distance <= effectiveRadius) {
        return node;
      }
    }
    return null;
  }

  getConnectionAt(x, y) {
    // First check if the mouse position is inside any node
    // If it is, don't detect any connections
    for (const node of this.nodes) {
      const dx = x - node.x;
      const dy = y - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const effectiveRadius = node.radius * node.scale;
      
      if (distance <= effectiveRadius) {
        return null; // Mouse is inside a node, don't detect connections
      }
    }
    
    let tolerance = 6; // Increased base tolerance for easier detection
    let closestConnection = null;
    let closestDistance = Infinity;
    
    for (const conn of this.connections) {
      const fromNode = this.nodes[conn.from];
      const toNode = this.nodes[conn.to];
      
      // Skip connections involving nodes that are currently scaled (active/centered)
      // as they might be harder to detect accurately
      const fromNodeScaled = fromNode.scale !== 1;
      const toNodeScaled = toNode.scale !== 1;
      
      // Calculate the curved path (quadratic curve) for precise detection
      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Skip very short connections to avoid detection issues
      if (distance < 50) continue;
      
      // Calculate control point for curve (same as in drawConnections)
      const curvature = 0.2;
      const controlX = midX + (-dy / distance) * distance * curvature;
      const controlY = midY + (dx / distance) * distance * curvature;
      
      // Check multiple points along the quadratic curve with higher resolution
      let minDistance = Infinity;
      const steps = 30; // Increased steps for better accuracy
      
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        
        // Quadratic Bézier curve formula: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
        const curveX = Math.pow(1 - t, 2) * fromNode.x + 
                      2 * (1 - t) * t * controlX + 
                      Math.pow(t, 2) * toNode.x;
        const curveY = Math.pow(1 - t, 2) * fromNode.y + 
                      2 * (1 - t) * t * controlY + 
                      Math.pow(t, 2) * toNode.y;
        
        // Check if this point on the curve is inside any node
        let pointInsideNode = false;
        for (const node of this.nodes) {
          const nodeDx = curveX - node.x;
          const nodeDy = curveY - node.y;
          const nodeDistance = Math.sqrt(nodeDx * nodeDx + nodeDy * nodeDy);
          const nodeEffectiveRadius = node.radius * node.scale;
          
          if (nodeDistance <= nodeEffectiveRadius) {
            pointInsideNode = true;
            break;
          }
        }
        
        // Only consider points on the curve that are outside of nodes
        if (!pointInsideNode) {
          const distToPoint = Math.sqrt(Math.pow(x - curveX, 2) + Math.pow(y - curveY, 2));
          minDistance = Math.min(minDistance, distToPoint);
        }
      }
      
      // Adjust tolerance based on connection state
      let currentTolerance = tolerance;
      if (conn.isHovered) {
        currentTolerance += 2; // Slightly larger tolerance for already hovered connections
      }
      if (fromNodeScaled || toNodeScaled) {
        currentTolerance += 3; // Larger tolerance for connections with scaled nodes
      }
      
      // Track the closest connection within tolerance
      if (minDistance <= currentTolerance && minDistance < closestDistance) {
        closestDistance = minDistance;
        closestConnection = conn;
      }
    }
    
    return closestConnection;
  }

  centerNode(node) {
    if (this.activeNode === node) return;
    
    // Reset previous active node to original position
    if (this.activeNode) {
      this.activeNode.isCentered = false;
      this.activeNode.targetX = this.activeNode.originalX;
      this.activeNode.targetY = this.activeNode.originalY;
      this.activeNode.targetScale = 1;
      this.activeNode.targetOpacity = 1;
    }
    
    this.activeNode = node;
    node.isCentered = true;
    
    // Calculate scale to make node reach extra-large size (85px)
    const extraLargeRadius = this.getNodeRadius('extra-large');
    const currentRadius = node.radius;
    node.targetScale = extraLargeRadius / currentRadius;
    
    // Position the node at the center of the network canvas (relative to the network web)
    node.targetX = this.centerX; // Center horizontally within the canvas
    node.targetY = this.centerY - 140; // Move upwards by 60px from center
    
    // Update all nodes based on new active state
    this.nodes.forEach(otherNode => {
      if (otherNode !== node) {
        // Reset non-active nodes to original positions
        otherNode.targetX = otherNode.originalX;
        otherNode.targetY = otherNode.originalY;
        otherNode.targetOpacity = 0.4;
        otherNode.targetScale = 0.9;
        otherNode.isCentered = false;
      } else {
        otherNode.targetOpacity = 1;
      }
    });
    
    // Show testimonial
    this.showTestimonial(node.student);
    
    this.isAnimating = true;
  }

  resetNetwork() {
    if (this.activeNode) {
      this.activeNode.isCentered = false;
      this.activeNode = null;
    }
    
    // Reset all nodes to original positions
    this.nodes.forEach(node => {
      node.targetX = node.originalX;
      node.targetY = node.originalY;
      node.targetScale = 1;
      node.targetOpacity = 1;
      node.isCentered = false;
    });
    
    this.hideTestimonial();
    this.isAnimating = true;
  }

  showTestimonial(student) {
    if (!this.testimonialCard) return;
    
    // Update testimonial content
    const avatarImg = document.getElementById('testimonialAvatarImg');
    const name = document.getElementById('testimonialName');
    const subtitle = document.getElementById('testimonialSubtitle');
    const text = document.getElementById('testimonialText');
    
    if (avatarImg) {
      avatarImg.src = student.image;
      avatarImg.alt = student.name;
    }
    
    if (name) {
      name.textContent = student.name;
      // Match student name color to dot's shadow color (using the student's brand color)
      name.style.color = student.color;
    }
    
    if (subtitle) {
      subtitle.textContent = student.program;
    }
    
    if (text) {
      text.textContent = student.quote;
    }
    
    // Position testimonial card dynamically to avoid overlapping centered node
    this.positionTestimonialCard();
    
    // Show testimonial card
    this.testimonialCard.classList.add('active');
  }

  positionTestimonialCard() {
    if (!this.testimonialCard || !this.activeNode) return;
    
    // Position the testimonial card at a fixed location on screen, independent of scroll position
    // This ensures it always appears at the same place regardless of where the user clicked or scrolled
    
    const scaledNodeRadius = this.getNodeRadius('extra-large'); // Final scaled radius
    const nodeGap = 20; // Gap between node bottom and content start
    
    // Use fixed screen coordinates - center horizontally, position vertically to accommodate the overlapping node
    const cardX = window.innerWidth / 2; // Always center horizontally on screen
    const cardY = (window.innerHeight / 2) + (scaledNodeRadius / 2) + nodeGap; // Below screen center, accounting for node overlap
    
    // Position testimonial card at fixed screen location
    this.testimonialCard.style.position = 'fixed';
    this.testimonialCard.style.left = cardX + 'px';
    this.testimonialCard.style.top = cardY + 'px';
    this.testimonialCard.style.transform = 'translate(-50%, 0)'; // Center horizontally
    this.testimonialCard.style.zIndex = '800'; // Below the centered node (900) so node appears on top
    this.testimonialCard.style.transition = 'all 0.3s ease-out';
    
    // Remove any placement classes since we're using fixed positioning
    this.testimonialCard.className = this.testimonialCard.className.replace(/placement-\w+/g, '');
  }

  hideTestimonial() {
    if (this.testimonialCard) {
      this.testimonialCard.classList.remove('active');
      // Reset positioning
      this.testimonialCard.style.position = '';
      this.testimonialCard.style.left = '';
      this.testimonialCard.style.top = '';
      this.testimonialCard.style.zIndex = '';
    }
  }

  startAnimation() {
    const animate = () => {
      this.time += 0.016; // ~60fps
      this.updateNodes();
      this.updateParticles();
      this.render();
      
      this.animationId = requestAnimationFrame(animate);
    };
    
    animate();
  }

  updateNodes() {
    let hasMovement = false;
    
    this.nodes.forEach(node => {
      // Update floating animation phase
      node.floatPhase += node.floatSpeed;
      
      // Calculate floating offset from base position
      const floatOffsetX = Math.sin(node.floatPhase) * node.floatAmplitudeX;
      const floatOffsetY = Math.sin(node.floatPhase * 0.7) * node.floatAmplitudeY; // Different frequency for Y
      
      // Apply floating animation to base positions (but not when centered)
      if (!node.isCentered) {
        // Update base positions with floating effect
        node.baseX = node.originalX + floatOffsetX;
        node.baseY = node.originalY + floatOffsetY;
        
        // Set target positions to floating positions
        node.targetX = node.baseX;
        node.targetY = node.baseY;
      }
      
      // Smooth position transitions
      const dx = node.targetX - node.x;
      const dy = node.targetY - node.y;
      const dScale = node.targetScale - node.scale;
      const dOpacity = node.targetOpacity - node.opacity;
      
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        node.x += dx * 0.08;
        node.y += dy * 0.08;
        hasMovement = true;
      }
      
      if (Math.abs(dScale) > 0.01) {
        node.scale += dScale * 0.1;
        hasMovement = true;
      }
      
      if (Math.abs(dOpacity) > 0.01) {
        node.opacity += dOpacity * 0.1;
        hasMovement = true;
      }
      
      // Update pulse phase
      node.pulsePhase += 0.02;
      
      // Update glow intensity
      if (node.isCentered) {
        node.glowIntensity = Math.min(1, node.glowIntensity + 0.05);
      } else {
        node.glowIntensity = Math.max(0, node.glowIntensity - 0.05);
      }
      
      // Always keep animating for floating effect
      hasMovement = true;
    });
    
    // Keep animation running for floating effect
    this.isAnimating = true;
  }

  updateParticles() {
    // Create particles along active connections
    if (this.activeNode && Math.random() < 0.3) {
      this.connections.forEach(conn => {
        const fromNode = this.nodes[conn.from];
        const toNode = this.nodes[conn.to];
        
        if (fromNode === this.activeNode || toNode === this.activeNode) {
          this.createParticle(fromNode, toNode);
        }
      });
    }
    
    // Update existing particles
    this.particles = this.particles.filter(particle => {
      particle.progress += particle.speed;
      particle.life -= 0.02;
      
      if (particle.progress >= 1 || particle.life <= 0) {
        return false;
      }
      
      // Update particle position along the curve
      const t = particle.progress;
      particle.x = this.lerp(particle.startX, particle.endX, t);
      particle.y = this.lerp(particle.startY, particle.endY, t);
      
      return true;
    });
  }

  createParticle(fromNode, toNode) {
    this.particles.push({
      startX: fromNode.x,
      startY: fromNode.y,
      endX: toNode.x,
      endY: toNode.y,
      x: fromNode.x,
      y: fromNode.y,
      progress: 0,
      speed: 0.02 + Math.random() * 0.02,
      life: 1,
      color: fromNode.student.color
    });
  }

  render() {
    // Clear main canvas
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Clear active node canvas (full viewport size)
    if (this.activeNodeCtx) {
      this.activeNodeCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
    
    // Draw connections
    this.drawConnections();
    
    // Draw particles
    this.drawParticles();
    
    // Draw nodes
    this.drawNodes();
  }

  drawConnections() {
    this.connections.forEach(conn => {
      const fromNode = this.nodes[conn.from];
      const toNode = this.nodes[conn.to];
      
      // Determine connection opacity and style - made lines thicker overall
      let opacity = 0.3;
      let strokeWidth = 4; // Increased from 2 to 4
      let useGradient = false;
      
      // Check for active node connections
      if (this.activeNode && (fromNode === this.activeNode || toNode === this.activeNode)) {
        opacity = 0.8;
        strokeWidth = 6; // Increased from 3 to 6
        useGradient = true;
      }
      
      // Check for hovered connections
      if (conn.isHovered) {
        opacity = 0.7;
        strokeWidth = 8; // Increased from 4 to 8
        useGradient = true;
      }
      
      // Create a subtle curve
      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate control point for curve
      const curvature = 0.2;
      const controlX = midX + (-dy / distance) * distance * curvature;
      const controlY = midY + (dx / distance) * distance * curvature;
      
      // Draw curved connection line
      this.ctx.beginPath();
      this.ctx.lineWidth = strokeWidth;
      this.ctx.lineCap = 'round';
      
      if (useGradient) {
        // Create SureStart gradient (yellow-orange-red-pink)
        const gradient = this.ctx.createLinearGradient(fromNode.x, fromNode.y, toNode.x, toNode.y);
        gradient.addColorStop(0, this.hexToRgba('#FFB65F', opacity)); // ss-yellow
        gradient.addColorStop(0.33, this.hexToRgba('#ED7C4B', opacity)); // ss-orange
        gradient.addColorStop(0.66, this.hexToRgba('#E7304E', opacity)); // ss-red
        gradient.addColorStop(1, this.hexToRgba('#EE2D6E', opacity)); // ss-pink
        this.ctx.strokeStyle = gradient;
      } else {
        this.ctx.strokeStyle = this.hexToRgba('#E7304E', opacity);
      }
      
      // Draw quadratic curve
      this.ctx.moveTo(fromNode.x, fromNode.y);
      this.ctx.quadraticCurveTo(controlX, controlY, toNode.x, toNode.y);
      this.ctx.stroke();
    });
  }

  drawParticles() {
    this.particles.forEach(particle => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
      this.ctx.fillStyle = this.hexToRgba(particle.color, particle.life);
      this.ctx.fill();
    });
  }

  drawNodes() {
    // Draw non-active nodes on main canvas
    this.nodes.forEach(node => {
      if (!node.isCentered) {
        this.drawSingleNode(node, this.ctx);
      }
    });
    
    // Draw the active/centered node on the separate high z-index canvas
    if (this.activeNode && this.activeNodeCtx) {
      // Calculate the screen position of the centered node
      const canvasRect = this.canvas.getBoundingClientRect();
      const screenX = canvasRect.left + this.activeNode.x;
      const screenY = canvasRect.top + this.activeNode.y;
      
      // Draw the active node at its screen position on the overlay canvas
      this.activeNodeCtx.save();
      this.activeNodeCtx.globalAlpha = this.activeNode.opacity;
      this.activeNodeCtx.translate(screenX, screenY);
      this.activeNodeCtx.scale(this.activeNode.scale, this.activeNode.scale);
      
      // Draw glow effect for centered nodes
      if (this.activeNode.glowIntensity > 0) {
        const gradient = this.activeNodeCtx.createRadialGradient(0, 0, this.activeNode.radius, 0, 0, this.activeNode.radius * 2);
        gradient.addColorStop(0, this.hexToRgba(this.activeNode.student.color, this.activeNode.glowIntensity * 0.3));
        gradient.addColorStop(1, this.hexToRgba(this.activeNode.student.color, 0));
        
        this.activeNodeCtx.beginPath();
        this.activeNodeCtx.arc(0, 0, this.activeNode.radius * 2, 0, Math.PI * 2);
        this.activeNodeCtx.fillStyle = gradient;
        this.activeNodeCtx.fill();
      }
      
      // Draw node border
      this.activeNodeCtx.beginPath();
      this.activeNodeCtx.arc(0, 0, this.activeNode.radius, 0, Math.PI * 2);
      this.activeNodeCtx.strokeStyle = this.hexToRgba('#ffffff', 0.8);
      this.activeNodeCtx.lineWidth = 3;
      this.activeNodeCtx.stroke();
      
      // Create circular clipping path for image
      this.activeNodeCtx.beginPath();
      this.activeNodeCtx.arc(0, 0, this.activeNode.radius - 2, 0, Math.PI * 2);
      this.activeNodeCtx.clip();
      
      // Draw student image if loaded, otherwise use fallback
      if (this.activeNode.student.imageElement && this.activeNode.student.imageElement.complete) {
        const size = (this.activeNode.radius - 2) * 2;
        this.activeNodeCtx.drawImage(
          this.activeNode.student.imageElement,
          -this.activeNode.radius + 2,
          -this.activeNode.radius + 2,
          size,
          size
        );
      } else {
        // Fallback: draw colored circle with initials
        this.activeNodeCtx.beginPath();
        this.activeNodeCtx.arc(0, 0, this.activeNode.radius - 2, 0, Math.PI * 2);
        this.activeNodeCtx.fillStyle = this.activeNode.student.color;
        this.activeNodeCtx.fill();
        
        // Add initials
        this.activeNodeCtx.fillStyle = '#ffffff';
        this.activeNodeCtx.font = `bold ${this.activeNode.radius * 0.6}px Arial`;
        this.activeNodeCtx.textAlign = 'center';
        this.activeNodeCtx.textBaseline = 'middle';
        const initials = this.activeNode.student.name.split(' ').map(n => n[0]).join('').substring(0, 2);
        this.activeNodeCtx.fillText(initials, 0, 0);
      }
      
      this.activeNodeCtx.restore();
    }
  }
  
  drawSingleNode(node, ctx) {
    ctx.save();
    
    // Apply node transformations
    ctx.globalAlpha = node.opacity;
    ctx.translate(node.x, node.y);
    ctx.scale(node.scale, node.scale);
    
    // Draw glow effect for centered nodes
    if (node.glowIntensity > 0) {
      const gradient = ctx.createRadialGradient(0, 0, node.radius, 0, 0, node.radius * 2);
      gradient.addColorStop(0, this.hexToRgba(node.student.color, node.glowIntensity * 0.3));
      gradient.addColorStop(1, this.hexToRgba(node.student.color, 0));
      
      ctx.beginPath();
      ctx.arc(0, 0, node.radius * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    // Draw node border
    ctx.beginPath();
    ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
    ctx.strokeStyle = this.hexToRgba('#ffffff', 0.8);
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Create circular clipping path for image
    ctx.beginPath();
    ctx.arc(0, 0, node.radius - 2, 0, Math.PI * 2);
    ctx.clip();
    
    // Draw student image if loaded, otherwise use fallback
    if (node.student.imageElement && node.student.imageElement.complete) {
      const size = (node.radius - 2) * 2;
      ctx.drawImage(
        node.student.imageElement,
        -node.radius + 2,
        -node.radius + 2,
        size,
        size
      );
    } else {
      // Fallback: draw colored circle with initials
      ctx.beginPath();
      ctx.arc(0, 0, node.radius - 2, 0, Math.PI * 2);
      ctx.fillStyle = node.student.color;
      ctx.fill();
      
      // Add initials
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${node.radius * 0.6}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initials = node.student.name.split(' ').map(n => n[0]).join('').substring(0, 2);
      ctx.fillText(initials, 0, 0);
    }
    
    // Draw pulse effect for hovered nodes
    if (node.isHovered) {
      const pulseRadius = node.radius + Math.sin(node.pulsePhase) * 5;
      ctx.beginPath();
      ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = this.hexToRgba(node.student.color, 0.5);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    ctx.restore();
  }

  // Utility methods
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  lerp(start, end, factor) {
    return start + (end - start) * factor;
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
// CASE STUDIES TESTIMONIALS CAROUSEL
// ==========================================

class CaseStudiesCarousel {
  constructor() {
    this.track = document.getElementById('testimonialsTrack');
    this.dots = document.querySelectorAll('.testimonial-dot');
    this.currentIndex = 0;
    this.totalSlides = 3; // Jonathan, Lili, and third testimonial
    this.isTransitioning = false;
    
    this.init();
  }

  init() {
    if (!this.track) return;
    
    this.setupInfiniteLoop();
    this.addEventListeners();
    this.updateCarousel();
  }

  setupInfiniteLoop() {
    // Clone the first and last slides for seamless infinite scrolling
    const cards = this.track.querySelectorAll('.testimonial-case-card');
    if (cards.length === 0) return;
    
    // Clone first card and append to end
    const firstCardClone = cards[0].cloneNode(true);
    firstCardClone.classList.add('clone');
    this.track.appendChild(firstCardClone);
    
    // Clone last card and prepend to beginning
    const lastCardClone = cards[cards.length - 1].cloneNode(true);
    lastCardClone.classList.add('clone');
    this.track.insertBefore(lastCardClone, cards[0]);
    
    // Adjust starting position to account for the prepended clone
    this.currentIndex = 1; // Start at the first real slide (after the cloned last slide)
    this.track.style.transform = `translateX(-${this.currentIndex * this.getScrollDistance()}%)`;
  }

  addEventListeners() {
    // Dot navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.goToSlide(index + 1); // +1 to account for the prepended clone
      });
    });

    // Keyboard navigation - listen globally when carousel section is visible
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.previousSlide();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.nextSlide();
      }
    });

    // Touch/swipe support
    this.addTouchSupport();
    
    // Auto-advance every 8 seconds (optional - can be removed if not desired)
    this.startAutoAdvance();
    
    // Listen for transition end to handle infinite loop jumps
    this.track.addEventListener('transitionend', () => {
      this.handleTransitionEnd();
    });
  }

  startAutoAdvance() {
    // Clear any existing interval
    if (this.autoAdvanceInterval) {
      clearInterval(this.autoAdvanceInterval);
    }
    
    // Auto-advance every 8 seconds
    this.autoAdvanceInterval = setInterval(() => {
      this.nextSlide();
    }, 8000);
    
    // Pause auto-advance on hover
    if (this.track) {
      this.track.addEventListener('mouseenter', () => {
        if (this.autoAdvanceInterval) {
          clearInterval(this.autoAdvanceInterval);
        }
      });
      
      this.track.addEventListener('mouseleave', () => {
        this.startAutoAdvance();
      });
    }
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
      const currentTransform = -(this.currentIndex * this.getScrollDistance());
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

  getScrollDistance() {
    const containerWidth = this.track.parentElement.offsetWidth;
    const cardWidth = 85; // Card takes 85% of container width
    const gap = 2; // Approximate gap between cards as percentage
    
    let scrollDistance;
    
    if (containerWidth >= 1400) {
      // Large screens: scroll by exactly the card width to center the next card
      scrollDistance = cardWidth;
    } else if (containerWidth >= 1024) {
      // Medium-large screens: scroll by card width plus small gap
      scrollDistance = cardWidth + (gap / 2);
    } else {
      // Smaller screens: scroll by full card width plus gap for complete visibility
      scrollDistance = cardWidth + gap;
    }
    
    return scrollDistance;
  }

  goToSlide(index) {
    if (this.isTransitioning) return;
    
    this.currentIndex = index;
    this.updateCarousel();
  }

  nextSlide() {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    this.currentIndex++;
    this.updateCarousel();
  }

  previousSlide() {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    this.currentIndex--;
    this.updateCarousel();
  }

  handleTransitionEnd() {
    this.isTransitioning = false;
    
    // Handle infinite loop jumps
    const totalCards = this.track.querySelectorAll('.testimonial-case-card').length;
    
    if (this.currentIndex === 0) {
      // We're at the cloned last slide, jump to the real last slide
      this.track.style.transition = 'none';
      this.currentIndex = this.totalSlides;
      this.track.style.transform = `translateX(-${this.currentIndex * this.getScrollDistance()}%)`;
      // Force reflow
      this.track.offsetHeight;
      this.track.style.transition = '';
    } else if (this.currentIndex === totalCards - 1) {
      // We're at the cloned first slide, jump to the real first slide
      this.track.style.transition = 'none';
      this.currentIndex = 1;
      this.track.style.transform = `translateX(-${this.currentIndex * this.getScrollDistance()}%)`;
      // Force reflow
      this.track.offsetHeight;
      this.track.style.transition = '';
    }
    
    this.updateDots();
  }

  updateCarousel() {
    if (!this.track) return;
    
    const scrollDistance = this.getScrollDistance();
    const translateX = -(this.currentIndex * scrollDistance);
    
    this.track.style.transform = `translateX(${translateX}%)`;
    this.updateDots();
  }

  updateDots() {
    // Update dots based on the real slide index (accounting for clones)
    let realIndex = this.currentIndex - 1; // -1 to account for the prepended clone
    
    // Handle edge cases for cloned slides
    if (this.currentIndex === 0) {
      realIndex = this.totalSlides - 1; // Last real slide
    } else if (this.currentIndex === this.totalSlides + 1) {
      realIndex = 0; // First real slide
    }
    
    this.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === realIndex);
    });
  }

  destroy() {
    // Clean up event listeners and intervals
    if (this.autoAdvanceInterval) {
      clearInterval(this.autoAdvanceInterval);
    }
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
      this.components.studentNetworkWeb = new StudentNetworkWeb();
      this.components.videoPlayer = new VideoPlayer();
      this.components.parallaxEffects = new ParallaxEffects();
      this.components.smoothNavigation = new SmoothNavigation();
      this.components.accessibilityEnhancements = new AccessibilityEnhancements();
      this.components.caseStudiesCarousel = new CaseStudiesCarousel();
      this.components.testimonialsCarousel = new TestimonialsCarousel();


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
  }

  pauseAnimations() {
    // Pause animations when tab is not visible
  }

  resumeAnimations() {
    // Resume animations when tab becomes visible
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
