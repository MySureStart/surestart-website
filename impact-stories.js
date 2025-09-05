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
    
    // Student data with enhanced information and varied node sizes
    this.studentData = [
      {
        id: 'netra',
        name: 'Netra Ramesh',
        program: 'MIT FutureMakers 2021',
        quote: 'My life changed because of the MIT FutureMaker program! I\'ve never been so passionate about my future.',
        image: 'https://mysurestart.com/s/Netra-Ramesh.jpg',
        size: 'extra-large',
        color: '#E7304E' // ss-red
      },
      {
        id: 'vitaliy',
        name: 'Vitaliy Stephanov',
        program: 'Now at Amazon Web Services',
        quote: 'SureStart helped prepare me with the skills I needed to become a Software Development Engineer at Amazon Web Services.',
        image: 'https://mysurestart.com/s/Vitaliy-S.jpg',
        size: 'large',
        color: '#ED7C4B' // ss-orange
      },
      {
        id: 'alexa',
        name: 'Alexa Urrea',
        program: 'SureStart 2021',
        quote: 'SureStart dramatically and directly impacted my life. It helped me land my first ever internship with a great company.',
        image: 'https://mysurestart.com/s/Alexa-Urrea.jpg',
        size: 'medium',
        color: '#FFB65F' // ss-yellow
      },
      {
        id: 'sahana',
        name: 'Sahana Sreeram',
        program: 'SureStart 2021',
        quote: 'The most impactful technology experience I have had so far. Each team product had the potential to change the world.',
        image: 'https://mysurestart.com/s/Sahana-Sreeram.jpg',
        size: 'medium',
        color: '#EE2D6E' // ss-pink
      },
      {
        id: 'jason',
        name: 'Jason Jerome',
        program: 'SureStart 2021',
        quote: 'A learning experience unlike anything I\'ve participated in before. Thanks to their support I was recently offered a summer internship!',
        image: 'https://mysurestart.com/s/Jason-Jerome.jpg',
        size: 'small',
        color: '#E7304E' // ss-red
      },
      {
        id: 'ashmita',
        name: 'Ashmita Kumar',
        program: 'SureStart 2021',
        quote: 'The mentorship and guidance I received through SureStart was invaluable in shaping my career path in AI and technology.',
        image: 'https://mysurestart.com/s/Ashmita-Kumar.jfif',
        size: 'small',
        color: '#ED7C4B' // ss-orange
      },
      {
        id: 'sarah',
        name: 'Sarah Tran',
        program: 'SureStart 2021',
        quote: 'SureStart opened my eyes to the possibilities in AI and gave me the confidence to pursue my dreams.',
        image: 'https://mysurestart.com/s/Sarah-Tran.jfif',
        size: 'extra-small',
        color: '#FFB65F' // ss-yellow
      },
      {
        id: 'walee',
        name: 'Walee Attia',
        program: 'SureStart 2021',
        quote: 'The program completely changed my perspective on what\'s possible in technology and AI.',
        image: 'https://mysurestart.com/s/Walee-Attia.jfif',
        size: 'extra-small',
        color: '#EE2D6E' // ss-pink
      },
      // Additional 12 students with varied sizes
      {
        id: 'maya',
        name: 'Maya Chen',
        program: 'SureStart 2022',
        quote: 'Through SureStart, I discovered my passion for machine learning and landed my dream internship at Google.',
        image: 'https://via.placeholder.com/150',
        size: 'large',
        color: '#E7304E' // ss-red
      },
      {
        id: 'david',
        name: 'David Rodriguez',
        program: 'Now at Microsoft',
        quote: 'The hands-on projects and mentorship at SureStart gave me the confidence to pursue a career in AI research.',
        image: 'https://via.placeholder.com/150',
        size: 'medium',
        color: '#ED7C4B' // ss-orange
      },
      {
        id: 'priya',
        name: 'Priya Patel',
        program: 'Stanford AI Program 2022',
        quote: 'SureStart was the stepping stone that led me to Stanford\'s AI program. The community support was incredible.',
        image: 'https://via.placeholder.com/150',
        size: 'extra-large',
        color: '#FFB65F' // ss-yellow
      },
      {
        id: 'marcus',
        name: 'Marcus Johnson',
        program: 'SureStart 2022',
        quote: 'I went from knowing nothing about AI to building my own neural networks. SureStart made the impossible possible.',
        image: 'https://via.placeholder.com/150',
        size: 'medium',
        color: '#EE2D6E' // ss-pink
      },
      {
        id: 'elena',
        name: 'Elena Vasquez',
        program: 'Now at Tesla',
        quote: 'The ethical AI discussions at SureStart shaped how I approach technology development in my career at Tesla.',
        image: 'https://via.placeholder.com/150',
        size: 'small',
        color: '#E7304E' // ss-red
      },
      {
        id: 'kevin',
        name: 'Kevin Liu',
        program: 'MIT 2023',
        quote: 'SureStart\'s rigorous curriculum prepared me perfectly for MIT\'s computer science program. Forever grateful!',
        image: 'https://via.placeholder.com/150',
        size: 'large',
        color: '#ED7C4B' // ss-orange
      },
      {
        id: 'zara',
        name: 'Zara Ahmed',
        program: 'SureStart 2022',
        quote: 'As a first-generation college student, SureStart gave me the technical skills and confidence to succeed in tech.',
        image: 'https://via.placeholder.com/150',
        size: 'extra-small',
        color: '#FFB65F' // ss-yellow
      },
      {
        id: 'tyler',
        name: 'Tyler Washington',
        program: 'Now at Apple',
        quote: 'The collaborative projects at SureStart taught me how to work in diverse teams, a skill I use daily at Apple.',
        image: 'https://via.placeholder.com/150',
        size: 'small',
        color: '#EE2D6E' // ss-pink
      },
      {
        id: 'aisha',
        name: 'Aisha Okafor',
        program: 'Carnegie Mellon 2023',
        quote: 'SureStart didn\'t just teach me coding - it taught me how to think critically about technology\'s impact on society.',
        image: 'https://via.placeholder.com/150',
        size: 'medium',
        color: '#E7304E' // ss-red
      },
      {
        id: 'ryan',
        name: 'Ryan O\'Connor',
        program: 'SureStart 2023',
        quote: 'The mentorship program connected me with industry professionals who guided my career path in data science.',
        image: 'https://via.placeholder.com/150',
        size: 'extra-small',
        color: '#ED7C4B' // ss-orange
      },
      {
        id: 'sophia',
        name: 'Sophia Kim',
        program: 'Now at Meta',
        quote: 'SureStart\'s focus on real-world applications helped me understand how AI can solve meaningful problems.',
        image: 'https://via.placeholder.com/150',
        size: 'extra-large',
        color: '#FFB65F' // ss-yellow
      },
      {
        id: 'jamal',
        name: 'Jamal Thompson',
        program: 'Berkeley AI Research',
        quote: 'The research opportunities at SureStart ignited my passion for AI research and led me to Berkeley\'s PhD program.',
        image: 'https://via.placeholder.com/150',
        size: 'large',
        color: '#EE2D6E' // ss-pink
      }
    ];
    
    this.init();
  }

  async init() {
    if (!this.canvas) {
      console.warn('Network canvas not found');
      return;
    }
    
    console.log('Initializing StudentNetworkWeb...');
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvas();
    await this.loadImages();
    this.createNodes();
    this.createConnections();
    this.addEventListeners();
    this.startAnimation();
    console.log('StudentNetworkWeb initialized successfully');
  }

  setupCanvas() {
    // Get true full viewport width minus minimal padding
    const dpr = window.devicePixelRatio || 1;
    
    // Use full viewport width with minimal padding
    this.canvasWidth = window.innerWidth - 40; // 20px padding on each side
    
    // Calculate dynamic height based on optimal node distribution
    const nodeCount = this.studentData.length;
    const optimalArea = nodeCount * 15000; // Optimal area per node for good spacing
    const aspectRatio = this.canvasWidth / Math.sqrt(optimalArea);
    this.canvasHeight = Math.max(1000, Math.min(1800, Math.sqrt(optimalArea) / aspectRatio));
    
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

  async loadImages() {
    const imagePromises = this.studentData.map(student => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          student.imageElement = img;
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load image for ${student.name}`);
          resolve(); // Continue even if image fails
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
        pulsePhase: Math.random() * Math.PI * 2
      };
      
      this.nodes.push(node);
    });
  }

  generateOrganicPositions(count) {
    const margin = 80;
    const width = this.canvasWidth - (margin * 2);
    const height = this.canvasHeight - (margin * 2);
    
    // Use Poisson disk sampling for balanced distribution
    const minDistance = Math.sqrt((width * height) / count) * 0.8; // Minimum distance between nodes
    const positions = this.poissonDiskSampling(width, height, minDistance, count);
    
    // Apply Lloyd's relaxation for better spacing
    this.relaxPositions(positions, width, height, 3);
    
    // Offset by margin and add some organic variation
    return positions.map(pos => ({
      x: pos.x + margin + (Math.random() - 0.5) * 20,
      y: pos.y + margin + (Math.random() - 0.5) * 20
    }));
  }

  poissonDiskSampling(width, height, minDistance, targetCount) {
    const cellSize = minDistance / Math.sqrt(2);
    const gridWidth = Math.ceil(width / cellSize);
    const gridHeight = Math.ceil(height / cellSize);
    const grid = new Array(gridWidth * gridHeight).fill(-1);
    const points = [];
    const activeList = [];
    
    // Add initial point
    const initialX = Math.random() * width;
    const initialY = Math.random() * height;
    const initialPoint = { x: initialX, y: initialY };
    points.push(initialPoint);
    activeList.push(0);
    
    const gridX = Math.floor(initialX / cellSize);
    const gridY = Math.floor(initialY / cellSize);
    grid[gridY * gridWidth + gridX] = 0;
    
    while (activeList.length > 0 && points.length < targetCount) {
      const randomIndex = Math.floor(Math.random() * activeList.length);
      const pointIndex = activeList[randomIndex];
      const point = points[pointIndex];
      
      let found = false;
      for (let i = 0; i < 30; i++) { // Try 30 times to find a valid point
        const angle = Math.random() * 2 * Math.PI;
        const distance = minDistance + Math.random() * minDistance;
        const newX = point.x + Math.cos(angle) * distance;
        const newY = point.y + Math.sin(angle) * distance;
        
        if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
          const newGridX = Math.floor(newX / cellSize);
          const newGridY = Math.floor(newY / cellSize);
          
          let valid = true;
          // Check surrounding cells
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const checkX = newGridX + dx;
              const checkY = newGridY + dy;
              if (checkX >= 0 && checkX < gridWidth && checkY >= 0 && checkY < gridHeight) {
                const neighborIndex = grid[checkY * gridWidth + checkX];
                if (neighborIndex !== -1) {
                  const neighbor = points[neighborIndex];
                  const dist = Math.sqrt((newX - neighbor.x) ** 2 + (newY - neighbor.y) ** 2);
                  if (dist < minDistance) {
                    valid = false;
                    break;
                  }
                }
              }
            }
            if (!valid) break;
          }
          
          if (valid) {
            const newPoint = { x: newX, y: newY };
            points.push(newPoint);
            activeList.push(points.length - 1);
            grid[newGridY * gridWidth + newGridX] = points.length - 1;
            found = true;
            break;
          }
        }
      }
      
      if (!found) {
        activeList.splice(randomIndex, 1);
      }
    }
    
    return points.slice(0, targetCount);
  }

  relaxPositions(positions, width, height, iterations) {
    // Lloyd's relaxation algorithm
    for (let iter = 0; iter < iterations; iter++) {
      const newPositions = positions.map((pos, i) => {
        let sumX = 0, sumY = 0, count = 0;
        
        // Find nearby points and calculate centroid
        positions.forEach((otherPos, j) => {
          if (i !== j) {
            const dist = Math.sqrt((pos.x - otherPos.x) ** 2 + (pos.y - otherPos.y) ** 2);
            if (dist < width / 4) { // Consider points within reasonable distance
              sumX += otherPos.x;
              sumY += otherPos.y;
              count++;
            }
          }
        });
        
        if (count > 0) {
          // Move towards the inverse of the centroid (away from crowded areas)
          const centroidX = sumX / count;
          const centroidY = sumY / count;
          const moveX = pos.x - (centroidX - pos.x) * 0.1;
          const moveY = pos.y - (centroidY - pos.y) * 0.1;
          
          // Keep within bounds
          return {
            x: Math.max(0, Math.min(width, moveX)),
            y: Math.max(0, Math.min(height, moveY))
          };
        }
        
        return pos;
      });
      
      positions.splice(0, positions.length, ...newPositions);
    }
  }

  getNodeRadius(size) {
    switch (size) {
      case 'extra-large': return 58;
      case 'large': return 48;
      case 'medium': return 38;
      case 'small': return 30;
      case 'extra-small': return 24;
      default: return 38;
    }
  }

  createConnections() {
    this.connections = [];
    
    // Create a connected network ensuring no isolated nodes
    const nodeCount = this.nodes.length;
    const connectionsPerNode = Math.min(4, Math.ceil(nodeCount / 5)); // Scale with node count
    const maxDistance = Math.min(this.canvasWidth, this.canvasHeight) * 0.4; // Limit connection distance
    
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
    
    // Add additional connections for richer network, but avoid overcrowding
    for (let i = 0; i < nodeCount; i++) {
      const currentConnections = this.connections.filter(
        conn => conn.from === i || conn.to === i
      ).length;
      
      if (currentConnections < connectionsPerNode) {
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
          connectionsPerNode - currentConnections,
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
      this.canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
      
      // Update hover effects
      this.nodes.forEach(node => {
        node.isHovered = node === hoveredNode;
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
    }, 250));
  }

  getNodeAt(x, y) {
    for (const node of this.nodes) {
      const dx = x - node.x;
      const dy = y - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= node.radius * node.scale) {
        return node;
      }
    }
    return null;
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
    node.targetScale = 1.3;
    
    // Set target positions for the new active node
    node.targetX = this.centerX;
    node.targetY = this.centerY;
    
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
    const avatar = document.getElementById('testimonialAvatar');
    const name = document.getElementById('testimonialName');
    const program = document.getElementById('testimonialProgram');
    const text = document.getElementById('testimonialText');
    const linkedIn = document.getElementById('testimonialLinkedIn');
    const story = document.getElementById('testimonialStory');
    
    if (avatar) avatar.src = student.image;
    if (name) name.textContent = student.name;
    if (program) program.textContent = student.program;
    if (text) text.textContent = student.quote;
    
    // Update links (placeholder for now)
    if (linkedIn) linkedIn.href = '#';
    if (story) story.href = '#';
    
    // Position testimonial card dynamically to avoid overlapping centered node
    this.positionTestimonialCard();
    
    // Show testimonial card
    this.testimonialCard.classList.add('active');
  }

  positionTestimonialCard() {
    if (!this.testimonialCard || !this.activeNode) return;
    
    // Get canvas position relative to viewport
    const canvasRect = this.canvas.getBoundingClientRect();
    const cardRect = this.testimonialCard.getBoundingClientRect();
    
    // Calculate centered node position in viewport coordinates
    const centeredNodeX = canvasRect.left + this.centerX;
    const centeredNodeY = canvasRect.top + this.centerY;
    
    // Define safe zones and preferred positions
    const cardWidth = 400; // Approximate testimonial card width
    const cardHeight = 300; // Approximate testimonial card height
    const margin = 40; // Minimum margin from edges and node
    const nodeRadius = this.activeNode.radius * 1.3; // Account for scaled node
    
    // Calculate available space in each direction
    const spaceLeft = centeredNodeX - margin;
    const spaceRight = window.innerWidth - centeredNodeX - margin;
    const spaceTop = centeredNodeY - margin;
    const spaceBottom = window.innerHeight - centeredNodeY - margin;
    
    let positionX, positionY;
    let placement = 'right'; // Default placement
    
    // Determine best horizontal position
    if (spaceRight >= cardWidth + nodeRadius + margin) {
      // Place to the right
      positionX = centeredNodeX + nodeRadius + margin;
      placement = 'right';
    } else if (spaceLeft >= cardWidth + nodeRadius + margin) {
      // Place to the left
      positionX = centeredNodeX - nodeRadius - margin - cardWidth;
      placement = 'left';
    } else if (spaceRight > spaceLeft) {
      // Place to the right with available space
      positionX = centeredNodeX + nodeRadius + margin;
      placement = 'right';
    } else {
      // Place to the left with available space
      positionX = Math.max(margin, centeredNodeX - nodeRadius - margin - cardWidth);
      placement = 'left';
    }
    
    // Determine vertical position
    if (spaceTop >= cardHeight / 2 && spaceBottom >= cardHeight / 2) {
      // Center vertically relative to node
      positionY = centeredNodeY - cardHeight / 2;
    } else if (spaceBottom >= cardHeight) {
      // Place below if there's space
      positionY = centeredNodeY + nodeRadius + margin;
      placement += '-bottom';
    } else if (spaceTop >= cardHeight) {
      // Place above if there's space
      positionY = centeredNodeY - nodeRadius - margin - cardHeight;
      placement += '-top';
    } else {
      // Use available space, prioritizing visibility
      positionY = Math.max(margin, Math.min(
        window.innerHeight - cardHeight - margin,
        centeredNodeY - cardHeight / 2
      ));
    }
    
    // Ensure card stays within viewport bounds
    positionX = Math.max(margin, Math.min(window.innerWidth - cardWidth - margin, positionX));
    positionY = Math.max(margin, Math.min(window.innerHeight - cardHeight - margin, positionY));
    
    // Apply positioning with smooth transition
    this.testimonialCard.style.position = 'fixed';
    this.testimonialCard.style.left = `${positionX}px`;
    this.testimonialCard.style.top = `${positionY}px`;
    this.testimonialCard.style.zIndex = '1000';
    this.testimonialCard.style.transition = 'all 0.3s ease-out';
    
    // Add placement class for styling variations
    this.testimonialCard.className = this.testimonialCard.className.replace(/placement-\w+/g, '');
    this.testimonialCard.classList.add(`placement-${placement}`);
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
    });
    
    if (!hasMovement) {
      this.isAnimating = false;
    }
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
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    
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
      
      // Determine connection opacity and style
      let opacity = 0.3;
      let strokeWidth = 2;
      let color = '#E7304E';
      
      if (this.activeNode && (fromNode === this.activeNode || toNode === this.activeNode)) {
        opacity = 0.8;
        strokeWidth = 3;
        color = this.activeNode.student.color;
      }
      
      // Draw curved connection line
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.hexToRgba(color, opacity);
      this.ctx.lineWidth = strokeWidth;
      this.ctx.lineCap = 'round';
      
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
    this.nodes.forEach(node => {
      this.ctx.save();
      
      // Apply node transformations
      this.ctx.globalAlpha = node.opacity;
      this.ctx.translate(node.x, node.y);
      this.ctx.scale(node.scale, node.scale);
      
      // Draw glow effect for centered nodes
      if (node.glowIntensity > 0) {
        const gradient = this.ctx.createRadialGradient(0, 0, node.radius, 0, 0, node.radius * 2);
        gradient.addColorStop(0, this.hexToRgba(node.student.color, node.glowIntensity * 0.3));
        gradient.addColorStop(1, this.hexToRgba(node.student.color, 0));
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, node.radius * 2, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
      }
      
      // Draw node border
      this.ctx.beginPath();
      this.ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = this.hexToRgba('#ffffff', 0.8);
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
      
      // Create circular clipping path for image
      this.ctx.beginPath();
      this.ctx.arc(0, 0, node.radius - 2, 0, Math.PI * 2);
      this.ctx.clip();
      
      // Draw student image if loaded, otherwise use fallback
      if (node.student.imageElement && node.student.imageElement.complete) {
        const size = (node.radius - 2) * 2;
        this.ctx.drawImage(
          node.student.imageElement,
          -node.radius + 2,
          -node.radius + 2,
          size,
          size
        );
      } else {
        // Fallback: draw colored circle with initials
        this.ctx.beginPath();
        this.ctx.arc(0, 0, node.radius - 2, 0, Math.PI * 2);
        this.ctx.fillStyle = node.student.color;
        this.ctx.fill();
        
        // Add initials
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `bold ${node.radius * 0.6}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const initials = node.student.name.split(' ').map(n => n[0]).join('').substring(0, 2);
        this.ctx.fillText(initials, 0, 0);
      }
      
      // Draw pulse effect for hovered nodes
      if (node.isHovered) {
        const pulseRadius = node.radius + Math.sin(node.pulsePhase) * 5;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = this.hexToRgba(node.student.color, 0.5);
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
      
      this.ctx.restore();
    });
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
      this.components.studentNetworkWeb = new StudentNetworkWeb();
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
