// Supabase functions are loaded globally via supabase-init.js

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

// Smart contact form updates based on inquiry type
function updateContactForm() {
    const contactType = document.getElementById('contactType').value;
    const dynamicFields = document.getElementById('dynamicFields');
    
    if (!dynamicFields) return;
    
    let additionalFields = '';
    
    switch (contactType) {
        case 'media':
            additionalFields = `
                <div class="form-group">
                    <label for="company">Media Organization *</label>
                    <input type="text" id="company" name="company" placeholder="e.g., TechCrunch, The New York Times" required>
                </div>
                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" name="phone" placeholder="+1 (555) 123-4567">
                </div>
                <div class="form-group">
                    <label for="preferredContact">Preferred Contact Method</label>
                    <select id="preferredContact" name="preferredContact">
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="either">Either</option>
                    </select>
                </div>
            `;
            break;
            
        case 'business':
        case 'partnership':
            additionalFields = `
                <div class="form-group">
                    <label for="company">Company/Organization *</label>
                    <input type="text" id="company" name="company" placeholder="Your company name" required>
                </div>
                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" name="phone" placeholder="+1 (555) 123-4567">
                </div>
            `;
            break;
            
        case 'vc':
            additionalFields = `
                <div class="form-group">
                    <label for="company">Investment Firm *</label>
                    <input type="text" id="company" name="company" placeholder="e.g., Andreessen Horowitz, Sequoia Capital" required>
                </div>
                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" name="phone" placeholder="+1 (555) 123-4567">
                </div>
                <div class="form-group">
                    <label for="preferredContact">Preferred Contact Method</label>
                    <select id="preferredContact" name="preferredContact">
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="either">Either</option>
                    </select>
                </div>
            `;
            break;
            
        case 'support':
            additionalFields = `
                <div class="form-group">
                    <label for="phone">Phone Number (Optional)</label>
                    <input type="tel" id="phone" name="phone" placeholder="+1 (555) 123-4567">
                </div>
                <div class="form-group">
                    <label for="urgency">Issue Urgency</label>
                    <select id="urgency" name="urgency">
                        <option value="low">Low - General question</option>
                        <option value="normal">Normal - Need help</option>
                        <option value="high">High - Blocking issue</option>
                        <option value="urgent">Urgent - Critical problem</option>
                    </select>
                </div>
            `;
            break;
            
        default:
            additionalFields = '';
    }
    
    dynamicFields.innerHTML = additionalFields;
}

// Global function for HTML
window.updateContactForm = updateContactForm;

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
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.submit-contact-btn');
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending...';
            
            // Get form data
            const formData = new FormData(this);
            const contactData = {
                first_name: formData.get('firstName'),
                last_name: formData.get('lastName'),
                email: formData.get('email'),
                message: formData.get('message')
            };
            
            // Enhanced contact data with categorization
            const enhancedContactData = {
                first_name: formData.get('firstName'),
                last_name: formData.get('lastName'),
                email: formData.get('email'),
                message: formData.get('message'),
                contact_type: formData.get('contactType'),
                company: formData.get('company') || null,
                phone: formData.get('phone') || null,
                preferred_contact: formData.get('preferredContact') || 'email'
            };
            
            // Submit to Supabase with enhanced data
            const result = await window.submitEnhancedContactForm(enhancedContactData);
            
            if (!result.success) {
                console.error('Failed to submit contact form:', result.error);
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Send Message';
                alert('Failed to send message. Please try again.');
                return;
            }
            
            // Simulate API call delay for UX
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
                console.log('Contact form submission:', contactData);
            }, 1000);
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