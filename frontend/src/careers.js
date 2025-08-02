// Reuse main page background animations
let mouseX = 0, mouseY = 0;
let rafId = null;
let lastTime = 0;

// Import Supabase functions
import { submitJobApplication, submitJobNotification, checkDuplicateEmail } from './supabase.js';

// Email storage for duplicate checking (fallback to localStorage)
let submittedEmails = JSON.parse(localStorage.getItem('roomspot_submitted_emails') || '[]');

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

// Email validation functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function isDuplicateEmail(email) {
    // First check Supabase
    const result = await checkDuplicateEmail(email, 'job_application');
    if (result.isDuplicate) {
        return true;
    }
    
    // Fallback to localStorage
    return submittedEmails.some(submitted => submitted.email.toLowerCase() === email.toLowerCase());
}

function showError(input, message) {
    // Remove existing error
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error styling
    input.style.borderColor = '#ff3b5b';
    input.style.boxShadow = '0 0 0 1px rgba(255, 59, 91, 0.2)';
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        color: #ff3b5b;
        font-size: 12px;
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 4px;
    `;
    errorDiv.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        ${message}
    `;
    
    input.parentNode.appendChild(errorDiv);
}

function clearError(input) {
    const errorMessage = input.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
    input.style.borderColor = '';
    input.style.boxShadow = '';
}

async function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    
    for (let input of inputs) {
        if (!input.value.trim()) {
            showError(input, 'This field is required');
            isValid = false;
        } else if (input.type === 'email' && !isValidEmail(input.value)) {
            showError(input, 'Please enter a valid email address');
            isValid = false;
        } else if (input.type === 'email' && await isDuplicateEmail(input.value)) {
            showError(input, 'This email has already been used for an application');
            isValid = false;
        } else {
            clearError(input);
        }
    }
    
    return isValid;
}

// Modal Functions
function openApplication() {
    document.getElementById('applicationModal').classList.add('show');
    // Reset form when opening
    const form = document.querySelector('.job-application-form');
    if (form) {
        form.reset();
        // Clear any existing errors
        form.querySelectorAll('input, textarea').forEach(input => clearError(input));
    }
}

function closeApplication() {
    document.getElementById('applicationModal').classList.remove('show');
    // Reset form
    const form = document.querySelector('.job-application-form');
    if (form) {
        form.reset();
        // Clear any existing errors
        form.querySelectorAll('input, textarea').forEach(input => clearError(input));
    }
}

function openNotifyModal() {
    document.getElementById('notifyModal').classList.add('show');
    // Reset form when opening
    const form = document.querySelector('.notification-form');
    if (form) {
        form.reset();
        // Clear any existing errors
        form.querySelectorAll('input, select').forEach(input => clearError(input));
    }
}

function closeNotifyModal() {
    document.getElementById('notifyModal').classList.remove('show');
    // Reset form
    const form = document.querySelector('.notification-form');
    if (form) {
        form.reset();
        // Clear any existing errors
        form.querySelectorAll('input, select').forEach(input => clearError(input));
    }
}

// Form Submissions
document.addEventListener('DOMContentLoaded', function() {
    // Job Application Form
    const applicationForm = document.querySelector('.job-application-form');
    if (applicationForm) {
        // Add real-time validation
        applicationForm.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value.trim()) {
                    if (this.type === 'email' && !isValidEmail(this.value)) {
                        showError(this, 'Please enter a valid email address');
                    } else if (this.type === 'email' && isDuplicateEmail(this.value)) {
                        showError(this, 'This email has already been used for an application');
                    } else {
                        clearError(this);
                    }
                }
            });
            
            input.addEventListener('input', function() {
                clearError(this);
            });
        });
        
        applicationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form
            if (!(await validateForm(this))) {
                return;
            }
            
            const submitBtn = this.querySelector('.submit-application-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Submitting...';
            
            // Prepare application data
            const formData = new FormData(this);
            const applicationData = {
                first_name: formData.get('firstName'),
                last_name: formData.get('lastName'),
                email: formData.get('email'),
                linkedin_url: formData.get('linkedIn') || null,
                portfolio_url: formData.get('portfolio') || null,
                experience: formData.get('experience') || null,
                position: 'Senior Frontend Engineer'
            };
            
            // Submit to Supabase
            const result = await submitJobApplication(applicationData);
            
            if (!result.success) {
                showError(this.querySelector('#email'), result.error || 'Failed to submit application');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Submit Application';
                return;
            }
            
            // Store email locally as fallback
            const email = this.querySelector('#email').value;
            submittedEmails.push({
                email: email,
                type: 'job_application',
                timestamp: new Date().toISOString(),
                position: 'Senior Frontend Engineer'
            });
            localStorage.setItem('roomspot_submitted_emails', JSON.stringify(submittedEmails));
            
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
        // Add real-time validation
        notificationForm.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value.trim()) {
                    if (this.type === 'email' && !isValidEmail(this.value)) {
                        showError(this, 'Please enter a valid email address');
                    } else if (this.type === 'email' && isDuplicateEmail(this.value)) {
                        showError(this, 'This email is already subscribed to notifications');
                    } else {
                        clearError(this);
                    }
                }
            });
            
            input.addEventListener('input', function() {
                clearError(this);
            });
        });
        
        notificationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form
            if (!(await validateForm(this))) {
                return;
            }
            
            const submitBtn = this.querySelector('.submit-notification-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Subscribing...';
            
            // Prepare notification data
            const email = this.querySelector('#notifyEmail').value;
            const interests = this.querySelector('#interests').value;
            
            // Submit to Supabase
            const result = await submitJobNotification(email, interests);
            
            if (!result.success) {
                showError(this.querySelector('#notifyEmail'), result.error || 'Failed to subscribe');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Get Notified';
                return;
            }
            
            // Store email locally as fallback
            submittedEmails.push({
                email: email,
                type: 'notification',
                timestamp: new Date().toISOString(),
                interests: interests
            });
            localStorage.setItem('roomspot_submitted_emails', JSON.stringify(submittedEmails));
            
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