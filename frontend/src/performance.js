// Performance optimization utilities for RoomSpot

// Lazy load images
function lazyLoadImages() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Preload critical resources
function preloadCriticalResources() {
    const criticalResources = [
        { href: 'src/styles/styles.css', as: 'style' },
        { href: 'src/assets/logo.png', as: 'image' }
    ];

    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        document.head.appendChild(link);
    });
}

// Minimize initial JavaScript execution
function deferNonCriticalJS() {
    // Defer particle system initialization
    setTimeout(() => {
        if (typeof initParticles === 'function') {
            initParticles();
        }
    }, 100);

    // Defer analytics and non-essential features
    setTimeout(() => {
        // Initialize analytics if available
        if (typeof initAnalytics === 'function') {
            initAnalytics();
        }
    }, 500);
}

// Resource hints for external domains
function addResourceHints() {
    const hints = [
        { rel: 'dns-prefetch', href: '//cdn.jsdelivr.net' },
        { rel: 'dns-prefetch', href: '//hbodtphwaqabbtzkeixl.supabase.co' },
        { rel: 'preconnect', href: 'https://cdn.jsdelivr.net' },
        { rel: 'preconnect', href: 'https://hbodtphwaqabbtzkeixl.supabase.co' }
    ];

    hints.forEach(hint => {
        const link = document.createElement('link');
        link.rel = hint.rel;
        link.href = hint.href;
        if (hint.rel === 'preconnect') {
            link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
    });
}

// Optimize CSS delivery
function optimizeCSSDelivery() {
    // Load non-critical CSS asynchronously
    const nonCriticalCSS = [
        'src/styles/careers-enhanced.css'
    ];

    nonCriticalCSS.forEach(cssFile => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssFile;
        link.media = 'print';
        link.onload = function() {
            this.media = 'all';
        };
        document.head.appendChild(link);
    });
}

// Service Worker registration for caching
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

// Web Vitals monitoring
function initWebVitals() {
    // Simple performance monitoring
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.fetchStart;
            
            console.log('📊 Page Load Metrics:');
            console.log(`Total Load Time: ${loadTime}ms`);
            console.log(`DOM Content Loaded: ${perfData.domContentLoadedEventEnd - perfData.fetchStart}ms`);
            console.log(`First Paint: ${performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 'N/A'}ms`);
            
            // Track in analytics if available
            if (typeof window.trackApplicationEvent === 'function') {
                window.trackApplicationEvent(null, 'page_load', window.location.href, loadTime);
            }
        }, 0);
    });
}

// Initialize all performance optimizations
function initPerformanceOptimizations() {
    // Critical optimizations (run immediately)
    addResourceHints();
    preloadCriticalResources();
    
    // Non-critical optimizations (run after DOM ready)
    document.addEventListener('DOMContentLoaded', () => {
        lazyLoadImages();
        deferNonCriticalJS();
        initWebVitals();
    });
    
    // Background optimizations (run after page load)
    window.addEventListener('load', () => {
        optimizeCSSDelivery();
        registerServiceWorker();
    });
}

// Auto-initialize
initPerformanceOptimizations();

// Export for manual use
window.performanceUtils = {
    lazyLoadImages,
    preloadCriticalResources,
    deferNonCriticalJS,
    addResourceHints,
    optimizeCSSDelivery,
    registerServiceWorker,
    initWebVitals
};