// Modern animation utilities for enhanced user experience

// Intersection Observer for scroll-triggered animations
export const createScrollObserver = (callback, options = {}) => {
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Animate elements when they come into view
export const animateOnScroll = (elements, animationClass = 'fade-in-up') => {
  const observer = createScrollObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add(animationClass);
        observer.unobserve(entry.target);
      }
    });
  });

  elements.forEach(element => {
    if (element) {
      observer.observe(element);
    }
  });

  return observer;
};

// Stagger animation for multiple elements
export const staggerAnimation = (elements, delay = 100, animationClass = 'fade-in-up') => {
  elements.forEach((element, index) => {
    if (element) {
      setTimeout(() => {
        element.classList.add(animationClass);
      }, index * delay);
    }
  });
};

// Smooth parallax effect
export const createParallaxEffect = (element, speed = 0.5) => {
  if (!element) return;

  const handleScroll = () => {
    const scrolled = window.pageYOffset;
    const parallax = scrolled * speed;
    element.style.transform = `translateY(${parallax}px)`;
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
};

// Morphing button animation
export const createMorphingButton = (button, originalText, loadingText = 'Loading...') => {
  if (!button) return;

  const morph = () => {
    button.style.width = button.offsetWidth + 'px';
    button.innerHTML = loadingText;
    button.classList.add('loading-pulse');
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.classList.remove('loading-pulse');
      button.style.width = 'auto';
    }, 2000);
  };

  button.addEventListener('click', morph);
  return () => button.removeEventListener('click', morph);
};

// Floating action animation
export const createFloatingAnimation = (element, intensity = 10, duration = 3000) => {
  if (!element) return;

  let startTime = null;
  
  const animate = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    
    const y = Math.sin(elapsed / duration * Math.PI * 2) * intensity;
    element.style.transform = `translateY(${y}px)`;
    
    requestAnimationFrame(animate);
  };
  
  requestAnimationFrame(animate);
};

// Card hover tilt effect
export const createTiltEffect = (card) => {
  if (!card) return;

  const handleMouseMove = (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / centerY * -10;
    const rotateY = (x - centerX) / centerX * 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  };

  const handleMouseLeave = () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  card.addEventListener('mousemove', handleMouseMove);
  card.addEventListener('mouseleave', handleMouseLeave);
  
  return () => {
    card.removeEventListener('mousemove', handleMouseMove);
    card.removeEventListener('mouseleave', handleMouseLeave);
  };
};

// Smooth page transitions
export const createPageTransition = (duration = 300) => {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, #FF6B35, #000);
    z-index: 9999;
    opacity: 0;
    pointer-events: none;
    transition: opacity ${duration}ms ease;
  `;
  
  document.body.appendChild(overlay);
  
  return {
    enter: () => {
      overlay.style.opacity = '1';
      return new Promise(resolve => setTimeout(resolve, duration));
    },
    exit: () => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, duration);
    }
  };
};

// Text typing animation
export const createTypingAnimation = (element, text, speed = 50) => {
  if (!element) return;

  let i = 0;
  element.innerHTML = '';
  
  const typeWriter = () => {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(typeWriter, speed);
    }
  };
  
  typeWriter();
};

// Loading skeleton animation
export const createSkeletonLoader = (container, count = 3) => {
  if (!container) return;

  const skeletons = Array.from({ length: count }, () => {
    const skeleton = document.createElement('div');
    skeleton.className = 'animate-pulse bg-gray-200 rounded-lg h-20 mb-4';
    return skeleton;
  });

  skeletons.forEach(skeleton => container.appendChild(skeleton));
  
  return () => {
    skeletons.forEach(skeleton => {
      if (skeleton.parentNode) {
        skeleton.parentNode.removeChild(skeleton);
      }
    });
  };
};

// Initialize all animations when DOM is ready
export const initializeAnimations = () => {
  // Animate elements with fade-in-up class
  const fadeElements = document.querySelectorAll('.fade-in-up');
  if (fadeElements.length > 0) {
    animateOnScroll(fadeElements);
  }

  // Animate elements with scale-in class
  const scaleElements = document.querySelectorAll('.scale-in');
  if (scaleElements.length > 0) {
    animateOnScroll(scaleElements, 'scale-in');
  }

  // Add tilt effect to product cards
  const productCards = document.querySelectorAll('.product-card-hover');
  productCards.forEach(card => createTiltEffect(card));

  // Add floating animation to floating elements
  const floatingElements = document.querySelectorAll('.floating');
  floatingElements.forEach(element => createFloatingAnimation(element));

  // Add morphing effect to buttons with btn-hover-lift class
  const morphButtons = document.querySelectorAll('.btn-hover-lift');
  morphButtons.forEach(button => {
    const originalText = button.innerHTML;
    createMorphingButton(button, originalText);
  });
};

// Auto-initialize when module is imported
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAnimations);
  } else {
    initializeAnimations();
  }
}

