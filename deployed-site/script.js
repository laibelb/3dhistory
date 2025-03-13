document.addEventListener('DOMContentLoaded', function() {
    // Loading overlay
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        setTimeout(() => {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }, 1000);
    }

    // Header scroll effect
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
            
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (menuToggle && mainNav && menuToggle.classList.contains('active')) {
                    menuToggle.classList.remove('active');
                    mainNav.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
                
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Rotating Media Showcase
    const mediaItems = document.querySelectorAll('.media-item');
    const mediaIndicators = document.querySelectorAll('.media-indicator');
    const prevButton = document.querySelector('.media-prev');
    const nextButton = document.querySelector('.media-next');
    
    if (mediaItems.length > 0) {
        let currentIndex = 0;
        let interval;

        // Function to show a specific media item
        const showMedia = (index) => {
            // Hide all media items
            mediaItems.forEach(item => {
                item.classList.remove('active');
            });
            
            // Deactivate all indicators
            mediaIndicators.forEach(indicator => {
                indicator.classList.remove('active');
            });
            
            // Show the selected media item
            mediaItems[index].classList.add('active');
            mediaIndicators[index].classList.add('active');
            
            // Ensure video is playing
            const video = mediaItems[index].querySelector('video');
            if (video) {
                video.currentTime = 0;
                video.play().catch(e => console.log('Video play error:', e));
            }
            
            currentIndex = index;
        };

        // Function to show the next media item
        const showNextMedia = () => {
            let nextIndex = currentIndex + 1;
            if (nextIndex >= mediaItems.length) {
                nextIndex = 0;
            }
            showMedia(nextIndex);
        };

        // Function to show the previous media item
        const showPrevMedia = () => {
            let prevIndex = currentIndex - 1;
            if (prevIndex < 0) {
                prevIndex = mediaItems.length - 1;
            }
            showMedia(prevIndex);
        };

        // Set up automatic rotation
        const startAutoRotation = () => {
            clearInterval(interval);
            interval = setInterval(showNextMedia, 8000);
        };

        // Initialize auto rotation
        startAutoRotation();

        // Add click event listeners to indicators
        mediaIndicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                showMedia(index);
                startAutoRotation();
            });
        });

        // Add click event listeners to prev/next buttons
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                showPrevMedia();
                startAutoRotation();
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                showNextMedia();
                startAutoRotation();
            });
        }

        // Pause auto rotation when hovering over the container
        const mediaContainer = document.querySelector('.rotating-media-container');
        if (mediaContainer) {
            mediaContainer.addEventListener('mouseenter', () => {
                clearInterval(interval);
            });
            
            mediaContainer.addEventListener('mouseleave', () => {
                startAutoRotation();
            });
        }
    }

    // Image Slider
    const sliderTrack = document.querySelector('.slider-track');
    const sliderDots = document.querySelectorAll('.slider-dot');
    const sliderPrev = document.querySelector('.slider-prev');
    const sliderNext = document.querySelector('.slider-next');
    
    if (sliderTrack && sliderDots.length > 0) {
        let sliderIndex = 0;
        const slides = document.querySelectorAll('.slider-slide');
        let isTransitioning = false;
        let sliderInterval;
        
        const showSlide = (index) => {
            if (isTransitioning) return;
            
            isTransitioning = true;
            
            // First update the active dot
            sliderDots.forEach(dot => {
                dot.classList.remove('active');
            });
            
            sliderDots[index].classList.add('active');
            
            // Then animate the slide with a slight delay
            setTimeout(() => {
                sliderTrack.style.transition = 'transform 0.5s ease-in-out';
                sliderTrack.style.transform = `translateX(-${index * 25}%)`;
                
                sliderIndex = index;
                
                // Reset the transitioning flag after animation completes
                setTimeout(() => {
                    isTransitioning = false;
                }, 500);
            }, 50);
        };
        
        // Function to advance to the next slide
        const nextSlide = () => {
            const newIndex = (sliderIndex + 1) % slides.length;
            showSlide(newIndex);
        };
        
        // Set up automatic rotation
        const startAutoRotation = () => {
            clearInterval(sliderInterval);
            sliderInterval = setInterval(nextSlide, 6000);
        };
        
        // Initialize auto rotation
        startAutoRotation();
        
        // Add event listeners to dots
        sliderDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                if (!isTransitioning) {
                    showSlide(index);
                    startAutoRotation(); // Reset timer when manually changing slides
                }
            });
        });
        
        // Add event listeners to prev/next buttons
        if (sliderPrev) {
            sliderPrev.addEventListener('click', () => {
                if (!isTransitioning) {
                    const newIndex = (sliderIndex - 1 + slides.length) % slides.length;
                    showSlide(newIndex);
                    startAutoRotation(); // Reset timer when manually changing slides
                }
            });
        }
        
        if (sliderNext) {
            sliderNext.addEventListener('click', () => {
                if (!isTransitioning) {
                    nextSlide();
                    startAutoRotation(); // Reset timer when manually changing slides
                }
            });
        }
        
        // Pause auto rotation when hovering over the slider
        const sliderContainer = document.querySelector('.slider-container');
        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', () => {
                clearInterval(sliderInterval);
            });
            
            sliderContainer.addEventListener('mouseleave', () => {
                startAutoRotation();
            });
        }
        
        // Initialize the first slide
        showSlide(0);
    }

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all FAQ items
                faqItems.forEach(faq => {
                    faq.classList.remove('active');
                    const toggle = faq.querySelector('.faq-toggle');
                    if (toggle) {
                        toggle.textContent = '+';
                    }
                });
                
                // If the clicked item wasn't active, open it
                if (!isActive) {
                    item.classList.add('active');
                    const toggle = item.querySelector('.faq-toggle');
                    if (toggle) {
                        toggle.textContent = '−';
                    }
                }
            });
        }
    });

    // Form submission
    const waitlistForm = document.getElementById('waitlist-form');
    
    if (waitlistForm) {
        waitlistForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formMessage = document.querySelector('.form-message');
            
            if (formMessage) {
                formMessage.textContent = 'Thank you for your interest! We will contact you soon.';
                formMessage.classList.add('success');
                formMessage.style.display = 'block';
                
                setTimeout(() => {
                    formMessage.style.opacity = '1';
                }, 10);
                
                waitlistForm.reset();
            }
        });
    }
});
