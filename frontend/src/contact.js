// Reuse main page background animations
let mouseX = 0, mouseY = 0;
let rafId = null;
let lastTime = 0;

function updateGradients() {
    const gradientOrb = document.getElementById('gradientOrb');
    const gradientOrbSecondary = document.getElementById('gradientOrbSecondary');
    
    if (gradientOrb) {
        gradientOrb.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    }
    
    if (gradientOrbSecondary) {
        gradientOrbSecondary.style.transform = `translate(${mouseX - 100}px, ${mouseY + 100}px) translate(-50%, -50%)`;
    }
}

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Throttle to 60fps (16ms)
    const currentTime = Date.now();
    if (currentTime - lastTime < 16) return;
    lastTime = currentTime;
    
    if (!rafId) {
        rafId = requestAnimationFrame(() => {
            updateGradients();
            rafId = null;
        });
    }
});

// Create floating particles
const particlePool = [];
const MAX_PARTICLES = 40;

function createParticle() {
    let particle;
    
    if (particlePool.length >= MAX_PARTICLES) {
        particle = particlePool.shift();
        particle.style.animation = 'none';
        void particle.offsetHeight;
    } else {
        particle = document.createElement('div');
        particle.className = 'particle';
    }
    
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 15 + 20) + 's';
    particle.style.animationDelay = '0s';
    particle.style.animation = 'particleFloat ' + particle.style.animationDuration + ' linear';
    
    document.getElementById('particles').appendChild(particle);
    particlePool.push(particle);
    
    particle.addEventListener('animationend', () => {
        const index = particlePool.indexOf(particle);
        if (index > -1) {
            particlePool.splice(index, 1);
        }
        particle.remove();
    });
}

// Generate initial particles
for (let i = 0; i < 20; i++) {
    setTimeout(createParticle, i * 500);
}
setInterval(createParticle, 2000);

// Contact form handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.submit-contact-btn');
            const originalText = submitBtn.textContent;
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending...';
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Simulate API call
            setTimeout(() => {
                // Show success message
                const formSection = document.querySelector('.contact-form-section');
                formSection.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px;">
                        <div class="success-icon-wrapper">
                            <div class="success-circle">
                                <svg class="success-checkmark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                    <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                        </div>
                        <h2>Message Sent!</h2>
                        <p style="color: var(--text-secondary); margin-bottom: 32px;">Thank you for reaching out. We'll get back to you within 24-48 hours.</p>
                        <button class="action-btn" onclick="location.reload()">Send Another Message</button>
                    </div>
                `;
                
                // Log the contact form submission
                console.log('Contact form submission:', data);
            }, 2000);
        });
    }
    
    // Add smooth scrolling for FAQ section
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', function() {
            this.classList.toggle('expanded');
        });
    });
});

// Make functions globally accessible
window.createParticle = createParticle; 