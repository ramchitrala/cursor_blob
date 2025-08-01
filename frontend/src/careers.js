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

// Modal Functions
function openApplication() {
    document.getElementById('applicationModal').classList.add('show');
}

function closeApplication() {
    document.getElementById('applicationModal').classList.remove('show');
    // Reset form
    document.querySelector('.job-application-form').reset();
}

function openNotifyModal() {
    document.getElementById('notifyModal').classList.add('show');
}

function closeNotifyModal() {
    document.getElementById('notifyModal').classList.remove('show');
    // Reset form
    document.querySelector('.notification-form').reset();
}

// Form Submissions
document.addEventListener('DOMContentLoaded', function() {
    // Job Application Form
    const applicationForm = document.querySelector('.job-application-form');
    if (applicationForm) {
        applicationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.submit-application-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Submitting...';
            
            // Simulate API call
            setTimeout(() => {
                // Show success message
                const modal = document.getElementById('applicationModal');
                modal.querySelector('.application-form').innerHTML = `
                    <div style="text-align: center; padding: 40px 20px;">
                        <div class="success-icon-wrapper">
                            <div class="success-circle">
                                <svg class="success-checkmark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                    <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                        </div>
                        <h2>Application Submitted!</h2>
                        <p style="color: var(--text-secondary); margin-bottom: 32px;">Thank you for your interest! We'll review your application and get back to you within 5-7 business days.</p>
                        <button class="action-btn" onclick="closeApplication()">Done</button>
                    </div>
                `;
            }, 2000);
        });
    }
    
    // Notification Form
    const notificationForm = document.querySelector('.notification-form');
    if (notificationForm) {
        notificationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.submit-notification-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Subscribing...';
            
            // Simulate API call
            setTimeout(() => {
                // Show success message
                const modal = document.getElementById('notifyModal');
                modal.querySelector('.notify-form').innerHTML = `
                    <div style="text-align: center; padding: 40px 20px;">
                        <div class="success-icon-wrapper">
                            <div class="success-circle">
                                <svg class="success-checkmark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                    <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                        </div>
                        <h2>You're All Set!</h2>
                        <p style="color: var(--text-secondary); margin-bottom: 32px;">We'll notify you as soon as new positions matching your interests are available.</p>
                        <button class="action-btn" onclick="closeNotifyModal()">Done</button>
                    </div>
                `;
            }, 1500);
        });
    }
});

// Close modals on background click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        if (e.target.id === 'applicationModal') {
            closeApplication();
        } else if (e.target.id === 'notifyModal') {
            closeNotifyModal();
        }
    }
});

// Enter key support for forms
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.type !== 'textarea') {
        const form = e.target.closest('form');
        if (form) {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                submitBtn.click();
            }
        }
    }
});

// Make functions globally accessible
window.openApplication = openApplication;
window.closeApplication = closeApplication;
window.openNotifyModal = openNotifyModal;
window.closeNotifyModal = closeNotifyModal; 