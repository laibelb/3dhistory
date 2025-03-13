document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM selectors for better performance
    const selectors = {
        loadingOverlay: document.querySelector('.loading-overlay'),
        header: document.querySelector('.main-header'),
        menuToggle: document.querySelector('.mobile-menu-toggle'),
        mainNav: document.querySelector('.main-nav'),
        mediaItems: document.querySelectorAll('.media-item'),
        mediaIndicators: document.querySelectorAll('.media-indicator'),
        prevButton: document.querySelector('.media-prev'),
        nextButton: document.querySelector('.media-next'),
        mediaContainer: document.querySelector('.rotating-media-container'),
        sliderTrack: document.querySelector('.slider-track'),
        sliderDots: document.querySelectorAll('.slider-dot'),
        sliderPrev: document.querySelector('.slider-prev'),
        sliderNext: document.querySelector('.slider-next'),
        sliderContainer: document.querySelector('.slider-container'),
        videoItems: document.querySelectorAll('.video-item video, .media-item video'),
        faqItems: document.querySelectorAll('.faq-item'),
        waitlistForm: document.getElementById('waitlist-form')
    };

    // Loading overlay - simplified with a single timeout
    if (selectors.loadingOverlay) {
        setTimeout(() => {
            selectors.loadingOverlay.style.opacity = '0';
            selectors.loadingOverlay.addEventListener('transitionend', () => {
                selectors.loadingOverlay.style.display = 'none';
            }, { once: true });
        }, 1000);
    }

    // Header scroll effect with passive event listener for better performance
    if (selectors.header) {
        const handleScroll = () => {
            selectors.header.classList.toggle('scrolled', window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Mobile menu toggle
    if (selectors.menuToggle && selectors.mainNav) {
        selectors.menuToggle.addEventListener('click', () => {
            const isActive = selectors.menuToggle.classList.toggle('active');
            selectors.mainNav.classList.toggle('active');
            selectors.menuToggle.setAttribute('aria-expanded', isActive);
        });
    }

    // Smooth scrolling for anchor links with event delegation
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;
        
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Close mobile menu if open
            if (selectors.menuToggle && selectors.mainNav && selectors.menuToggle.classList.contains('active')) {
                selectors.menuToggle.classList.remove('active');
                selectors.mainNav.classList.remove('active');
                selectors.menuToggle.setAttribute('aria-expanded', 'false');
            }
            
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });

    // Rotating Media Showcase - optimized
    if (selectors.mediaItems.length > 0) {
        let currentIndex = 0;
        let interval;
        
        // Create fallback images for videos - optimized with DocumentFragment
        const createFallbacks = () => {
            const fragment = document.createDocumentFragment();
            
            selectors.mediaItems.forEach(item => {
                const video = item.querySelector('video');
                if (!video) return;
                
                const source = video.querySelector('source');
                if (!source) return;
                
                // Create a fallback image element
                const fallbackImg = document.createElement('div');
                fallbackImg.className = 'fallback-image';
                fallbackImg.style.cssText = 
                    'background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)); ' +
                    'background-color: #121212; position: absolute; top: 0; left: 0; ' +
                    'width: 100%; height: 100%; z-index: -1;';
                
                item.appendChild(fallbackImg);
                
                // Handle video errors - show fallback image
                video.addEventListener('error', () => {
                    fallbackImg.style.zIndex = '1';
                    video.style.opacity = '0';
                });
                
                // If video fails to play, show fallback
                video.addEventListener('canplay', () => {
                    video.play().catch(() => {
                        fallbackImg.style.zIndex = '1';
                        video.style.opacity = '0';
                    });
                });
            });
            
            return fragment;
        };
        
        // Apply fallbacks
        createFallbacks();

        // Media control functions
        const mediaControls = {
            showMedia: (index) => {
                // Hide all media items
                selectors.mediaItems.forEach(item => {
                    item.classList.remove('active');
                    const video = item.querySelector('video');
                    if (video) {
                        video.pause();
                        video.currentTime = 0;
                    }
                });
                
                // Deactivate all indicators
                selectors.mediaIndicators.forEach(indicator => {
                    indicator.classList.remove('active');
                });
                
                // Show the selected media item
                selectors.mediaItems[index].classList.add('active');
                selectors.mediaIndicators[index].classList.add('active');
                
                // Try to play the video
                const video = selectors.mediaItems[index].querySelector('video');
                if (video) {
                    video.currentTime = 0;
                    video.play().catch(() => {/* Error handled by event listener */});
                }
                
                currentIndex = index;
            },
            
            showNext: () => {
                const nextIndex = (currentIndex + 1) % selectors.mediaItems.length;
                mediaControls.showMedia(nextIndex);
            },
            
            showPrev: () => {
                const prevIndex = (currentIndex - 1 + selectors.mediaItems.length) % selectors.mediaItems.length;
                mediaControls.showMedia(prevIndex);
            },
            
            startAutoRotation: () => {
                clearInterval(interval);
                interval = setInterval(mediaControls.showNext, 8000);
            },
            
            stopAutoRotation: () => {
                clearInterval(interval);
            }
        };

        // Initialize auto rotation
        mediaControls.startAutoRotation();

        // Event listeners for media controls
        selectors.mediaIndicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                mediaControls.showMedia(index);
                mediaControls.startAutoRotation();
            });
        });

        if (selectors.prevButton) {
            selectors.prevButton.addEventListener('click', () => {
                mediaControls.showPrev();
                mediaControls.startAutoRotation();
            });
        }
        
        if (selectors.nextButton) {
            selectors.nextButton.addEventListener('click', () => {
                mediaControls.showNext();
                mediaControls.startAutoRotation();
            });
        }

        // Pause auto rotation on hover
        if (selectors.mediaContainer) {
            selectors.mediaContainer.addEventListener('mouseenter', mediaControls.stopAutoRotation);
            selectors.mediaContainer.addEventListener('mouseleave', mediaControls.startAutoRotation);
        }
        
        // Initialize the first media item
        mediaControls.showMedia(0);
    }

    // Image Slider - optimized
    if (selectors.sliderTrack && selectors.sliderDots.length > 0) {
        let sliderIndex = 0;
        const slides = document.querySelectorAll('.slider-slide');
        let isTransitioning = false;
        let sliderInterval;
        
        // Preload images with low priority
        const preloadImages = () => {
            slides.forEach(slide => {
                const bgImage = slide.style.backgroundImage;
                if (bgImage) {
                    const url = bgImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
                    const img = new Image();
                    img.loading = 'lazy'; // Use lazy loading
                    img.src = url;
                }
            });
        };
        
        // Call preload after a short delay to prioritize initial render
        setTimeout(preloadImages, 100);
        
        // Slider control functions
        const sliderControls = {
            showSlide: (index) => {
                if (isTransitioning) return;
                
                isTransitioning = true;
                
                // Update active dot
                selectors.sliderDots.forEach(dot => dot.classList.remove('active'));
                selectors.sliderDots[index].classList.add('active');
                
                // Animate slide with requestAnimationFrame for better performance
                requestAnimationFrame(() => {
                    selectors.sliderTrack.style.transition = 'transform 0.5s ease-in-out';
                    selectors.sliderTrack.style.transform = `translateX(-${index * 25}%)`;
                    
                    sliderIndex = index;
                    
                    // Reset transition flag after animation completes
                    setTimeout(() => {
                        isTransitioning = false;
                    }, 500);
                });
            },
            
            nextSlide: () => {
                if (isTransitioning) return;
                const newIndex = (sliderIndex + 1) % slides.length;
                sliderControls.showSlide(newIndex);
            },
            
            prevSlide: () => {
                if (isTransitioning) return;
                const newIndex = (sliderIndex - 1 + slides.length) % slides.length;
                sliderControls.showSlide(newIndex);
            },
            
            startAutoRotation: () => {
                clearInterval(sliderInterval);
                sliderInterval = setInterval(sliderControls.nextSlide, 5000);
            },
            
            stopAutoRotation: () => {
                clearInterval(sliderInterval);
            }
        };
        
        // Event listeners for slider controls
        selectors.sliderDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                sliderControls.showSlide(index);
                sliderControls.startAutoRotation();
            });
        });
        
        if (selectors.sliderPrev) {
            selectors.sliderPrev.addEventListener('click', () => {
                sliderControls.prevSlide();
                sliderControls.startAutoRotation();
            });
        }
        
        if (selectors.sliderNext) {
            selectors.sliderNext.addEventListener('click', () => {
                sliderControls.nextSlide();
                sliderControls.startAutoRotation();
            });
        }
        
        // Pause auto rotation on hover
        if (selectors.sliderContainer) {
            selectors.sliderContainer.addEventListener('mouseenter', sliderControls.stopAutoRotation);
            selectors.sliderContainer.addEventListener('mouseleave', sliderControls.startAutoRotation);
        }
        
        // Initialize slider
        sliderControls.showSlide(0);
        sliderControls.startAutoRotation();
    }

    // Video loading optimization
    if (selectors.videoItems.length > 0) {
        // Use Intersection Observer to load videos only when they're near viewport
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                
                if (entry.isIntersecting) {
                    // Set video to preload metadata
                    video.preload = 'metadata';
                    
                    // Load the video
                    if (video.readyState === 0) {
                        video.load();
                    }
                    
                    // Stop observing once loaded
                    videoObserver.unobserve(video);
                }
            });
        }, { rootMargin: '200px' }); // Start loading when video is within 200px of viewport
        
        // Observe all videos
        selectors.videoItems.forEach(video => {
            // Add error handling
            video.addEventListener('error', function(e) {
                // Try to reload from the DigitalOcean Spaces URL
                const source = video.querySelector('source');
                if (source) {
                    const currentSrc = source.getAttribute('src');
                    if (!currentSrc.includes('https://3dhistory.nyc3.digitaloceanspaces.com/')) {
                        // Update to use the DigitalOcean Spaces URL
                        const fileName = currentSrc.split('/').pop();
                        source.setAttribute('src', `https://3dhistory.nyc3.digitaloceanspaces.com/videos/${fileName}`);
                        video.load();
                    }
                }
            });
            
            // Start observing
            videoObserver.observe(video);
        });
    }

    // FAQ Accordion with event delegation
    if (selectors.faqItems.length > 0) {
        const faqContainer = selectors.faqItems[0].parentElement;
        
        faqContainer.addEventListener('click', (e) => {
            const question = e.target.closest('.faq-question');
            if (!question) return;
            
            const item = question.closest('.faq-item');
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            selectors.faqItems.forEach(faq => {
                faq.classList.remove('active');
                const toggle = faq.querySelector('.faq-toggle');
                if (toggle) toggle.textContent = '+';
            });
            
            // If the clicked item wasn't active, open it
            if (!isActive) {
                item.classList.add('active');
                const toggle = item.querySelector('.faq-toggle');
                if (toggle) toggle.textContent = '−';
            }
        });
    }

    // Waitlist Form
    if (selectors.waitlistForm) {
        selectors.waitlistForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formMessage = document.querySelector('.form-message');
            if (formMessage) {
                formMessage.textContent = 'Thank you for your interest! We will contact you soon.';
                formMessage.classList.add('success');
                formMessage.style.display = 'block';
                
                // Use requestAnimationFrame for smoother animation
                requestAnimationFrame(() => {
                    formMessage.style.opacity = '1';
                });
                
                selectors.waitlistForm.reset();
            }
        });
    }
});
