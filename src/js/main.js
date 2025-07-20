// Store user data
let userData = {
    emails: [],
    userType: '',
    isBetaUser: false,
    signupTime: new Date().toISOString()
};

// Track if user has already submitted
let hasSubmitted = false;

// Interactive gradient that follows mouse - throttled for 60fps
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

// Create floating particles - capped at 40 for performance
const particlePool = [];
const MAX_PARTICLES = 40;

function createParticle() {
    let particle;
    
    // Reuse existing particles if at max
    if (particlePool.length >= MAX_PARTICLES) {
        particle = particlePool.shift();
        particle.style.animation = 'none';
        void particle.offsetHeight; // Force reflow
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
    
    // Clean up after animation
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

// Check if email is educational
function isEducationalEmail(email) {
    const educationDomains = [
        '.edu', '.edu.', '.ac.', '.edu.au', '.edu.cn', '.edu.in',
        '.ac.uk', '.ac.jp', '.ac.kr', '.ac.ca', '.edu.mx',
        '.edu.br', '.edu.sg', '.edu.hk', '.edu.my'
    ];
    
    return educationDomains.some(domain => 
        email.toLowerCase().includes(domain)
    );
}

// Form handling
function handleSubmit() {
    const email = document.getElementById('emailInput').value.trim();
    const error = document.getElementById('error');
    const notice = document.getElementById('emailNotice');
    
    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        error.style.display = 'block';
        notice.classList.remove('show');
        return;
    }
    
    // Clear error
    error.style.display = 'none';
    
    // Add email to userData
    userData.emails.push({
        email: email,
        type: isEducationalEmail(email) ? 'educational' : 'personal',
        timestamp: new Date().toISOString()
    });
    
    // Update modal subtitle based on email type
    const modalSubtitle = document.getElementById('modalSubtitle');
    
    if (isEducationalEmail(email)) {
        modalSubtitle.innerHTML = "Welcome to the <span style='color: var(--success);'>student beta!</span>";
        userData.isBetaUser = true;
    } else {
        modalSubtitle.textContent = "How will you use RoomSpot?";
    }
    
    // Show modal
    document.getElementById('modal').classList.add('show');
    hasSubmitted = true;
}

// Check email type and show notice
function checkEmailType(email) {
    const notice = document.getElementById('emailNotice');
    const emailInput = document.getElementById('emailInput');
    const submitBtn = document.getElementById('submitBtn');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailPattern.test(email)) {
        if (!isEducationalEmail(email)) {
            notice.classList.add('show');
            emailInput.classList.remove('edu-email');
            submitBtn.textContent = 'Request Early Access';
            submitBtn.classList.remove('edu-priority');
        } else {
            notice.classList.remove('show');
            emailInput.classList.add('edu-email');
            submitBtn.textContent = 'Request Early Access';
            submitBtn.classList.add('edu-priority');
        }
    } else {
        notice.classList.remove('show');
        emailInput.classList.remove('edu-email');
        submitBtn.textContent = 'Join the waitlist';
        submitBtn.classList.remove('edu-priority');
    }
}

// Choice selection
function selectChoice(choice) {
    const button = event.currentTarget;
    
    // Disable buttons
    document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
    });
    
    // Add loading
    const loadingSpinner = document.createElement('span');
    loadingSpinner.className = 'loading-spinner';
    button.querySelector('.choice-content').appendChild(loadingSpinner);
    
    // Update user data
    userData.userType = choice;
    
    // Check if user has any school email
    const hasSchoolEmail = userData.emails.some(e => e.type === 'educational');
    
    // Simulate API call
    setTimeout(() => {
        // Update success message based on email type
        const successTitle = document.getElementById('successTitle');
        const successMessage = document.getElementById('successMessage');
        const earlyAccessBadge = document.getElementById('earlyAccessBadge');
        const proTipSection = document.getElementById('proTipSection');
        
        if (hasSchoolEmail) {
            // Student email - beta access
            earlyAccessBadge.style.display = 'inline-flex';
            successTitle.textContent = "Thank you — we'll be in touch";
            successMessage.textContent = "You'll be among the first to access RoomSpot when we launch the student beta.";
            proTipSection.style.display = 'none';
        } else {
            // Personal email - offer upgrade
            earlyAccessBadge.style.display = 'none';
            successTitle.textContent = "Thank you — we'll be in touch";
            successMessage.textContent = "We'll notify you when RoomSpot launches publicly.";
            proTipSection.style.display = 'block';
            setTimeout(() => {
                proTipSection.style.opacity = '1';
                proTipSection.style.transform = 'translateY(0)';
            }, 50);
        }
        
        // Log submission
        console.log('Waitlist submission:', userData);
        
        document.getElementById('questionStep').style.display = 'none';
        document.getElementById('success').style.display = 'block';
    }, 1500);
}

// Add keyboard navigation for choice buttons
document.addEventListener('DOMContentLoaded', function() {
    const choiceButtons = document.querySelectorAll('.choice-btn');
    choiceButtons.forEach(button => {
        button.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const choice = this.getAttribute('onclick').match(/selectChoice\('([^']+)'\)/)[1];
                selectChoice(choice);
            }
        });
    });
});

// Create confetti animation
function createConfetti(container, x, y) {
    const colors = [
        'rgba(0, 255, 136, 0.8)',
        'rgba(0, 128, 255, 0.8)',
        'rgba(128, 0, 255, 0.8)',
        'rgba(255, 255, 255, 0.6)'
    ];
    const shapes = ['circle', 'square', 'ribbon'];
    const confettiCount = 30;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = `confetti-particle ${shapes[Math.floor(Math.random() * shapes.length)]}`;
            
            // Random properties
            const color = colors[Math.floor(Math.random() * colors.length)];
            const startX = x + (Math.random() - 0.5) * 100;
            const drift = (Math.random() - 0.5) * 200;
            const duration = 1.5 + Math.random() * 1;
            
            particle.style.background = color;
            particle.style.left = startX + 'px';
            particle.style.top = y + 'px';
            particle.style.setProperty('--drift', drift + 'px');
            particle.style.animation = `confettiFall ${duration}s ease-out forwards`;
            
            container.appendChild(particle);
            
            // Cleanup
            setTimeout(() => particle.remove(), duration * 1000);
        }, i * 30);
    }
}

// Create minimal confetti for edu emails
function createMinimalConfetti(container, x, y) {
    const colors = [
        'rgba(0, 255, 136, 0.6)',
        'rgba(0, 128, 255, 0.6)'
    ];
    const shapes = ['circle', 'square'];
    const confettiCount = 8; // Much fewer particles
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = `confetti-particle ${shapes[Math.floor(Math.random() * shapes.length)]}`;
            
            // Random properties
            const color = colors[Math.floor(Math.random() * colors.length)];
            const startX = x + (Math.random() - 0.5) * 60; // Smaller spread
            const drift = (Math.random() - 0.5) * 100; // Less drift
            const duration = 1 + Math.random() * 0.5; // Shorter duration
            
            particle.style.background = color;
            particle.style.left = startX + 'px';
            particle.style.top = y + 'px';
            particle.style.setProperty('--drift', drift + 'px');
            particle.style.animation = `confettiFall ${duration}s ease-out forwards`;
            
            container.appendChild(particle);
            
            // Cleanup
            setTimeout(() => particle.remove(), duration * 1000);
        }, i * 50); // Slower spawn rate
    }
}

// Create success ring animation
function createSuccessAnimation(container) {
    const animationWrapper = document.createElement('div');
    animationWrapper.className = 'upgrade-success-animation';
    
    const ring = document.createElement('div');
    ring.className = 'upgrade-success-ring';
    
    const pulse = document.createElement('div');
    pulse.className = 'upgrade-success-pulse';
    
    animationWrapper.appendChild(ring);
    animationWrapper.appendChild(pulse);
    container.appendChild(animationWrapper);
    
    setTimeout(() => animationWrapper.remove(), 2000);
}

// Upgrade to student beta access with animation
function upgradeToStudent() {
    const schoolEmailInput = document.getElementById('schoolEmailInput');
    const schoolEmail = schoolEmailInput.value.trim();
    const upgradeBtn = event.currentTarget;
    
    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(schoolEmail)) {
        schoolEmailInput.style.borderColor = '#ff3b5b';
        setTimeout(() => {
            schoolEmailInput.style.borderColor = '';
        }, 2000);
        return;
    }
    
    if (!isEducationalEmail(schoolEmail)) {
        schoolEmailInput.placeholder = 'Please use a .edu email';
        schoolEmailInput.style.borderColor = '#ff3b5b';
        setTimeout(() => {
            schoolEmailInput.style.borderColor = '';
            schoolEmailInput.placeholder = 'your@school.edu';
        }, 2000);
        return;
    }
    
    // Add school email to userData (no duplicate check needed)
    userData.emails.push({
        email: schoolEmail,
        type: 'educational',
        timestamp: new Date().toISOString()
    });
    userData.isBetaUser = true;
    
    // Show loading
    upgradeBtn.disabled = true;
    upgradeBtn.innerHTML = 'Upgrading...';
    
    // Simulate API call
    setTimeout(() => {
        console.log('User upgraded to beta:', userData);
        
        // Create confetti container
        const modal = document.querySelector('.modal');
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        modal.appendChild(confettiContainer);
        
        // Get button position for confetti origin
        const btnRect = upgradeBtn.getBoundingClientRect();
        const modalRect = modal.getBoundingClientRect();
        const confettiX = btnRect.left - modalRect.left + btnRect.width / 2;
        const confettiY = btnRect.top - modalRect.top + btnRect.height / 2;
        
        // Start animations with minimal confetti for edu emails
        createSuccessAnimation(modal);
        createMinimalConfetti(confettiContainer, confettiX, confettiY);
        
        // Animate content transition
        const successSection = document.getElementById('success');
        successSection.classList.add('content-transition');
        
        // Update UI with animation
        setTimeout(() => {
            // Animate pro tip removal
            const proTip = document.getElementById('proTipSection');
            proTip.style.opacity = '0';
            proTip.style.transform = 'scale(0.95) translateY(20px)';
            proTip.style.transition = 'all 0.4s ease-out';
            
            setTimeout(() => {
                proTip.style.display = 'none';
                proTip.style.opacity = '';
                proTip.style.transform = '';
            }, 400);
            
            const earlyAccessBadge = document.getElementById('earlyAccessBadge');
            earlyAccessBadge.style.display = 'inline-flex';
            earlyAccessBadge.classList.add('badge-appear');
            earlyAccessBadge.classList.add('upgrade-glow');
            
            const successTitle = document.getElementById('successTitle');
            successTitle.textContent = "Thank you — we'll be in touch";
            successTitle.classList.add('upgrade-glow');
            
            document.getElementById('successMessage').innerHTML = "<span style='animation: fadeIn 0.8s ease-out 0.5s both; display: block;'>Perfect! You'll be among the first to access RoomSpot when we launch the <strong style='color: rgba(0, 255, 136, 0.9);'>student beta</strong>.</span>";
            
            // Show success message briefly
            document.getElementById('upgradeSuccess').style.display = 'block';
            
            // Cleanup
            setTimeout(() => {
                confettiContainer.remove();
                successSection.classList.remove('content-transition');
                earlyAccessBadge.classList.remove('upgrade-glow');
                successTitle.classList.remove('upgrade-glow');
            }, 3000);
        }, 400);
        
        // Reset button immediately after success
        upgradeBtn.disabled = false;
        upgradeBtn.innerHTML = 'Get beta access';
    }, 1000);
}

// Input handling
document.getElementById('emailInput').addEventListener('input', function() {
    document.getElementById('error').style.display = 'none';
    checkEmailType(this.value);
});

document.getElementById('emailInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleSubmit();
    }
});

// Add Enter key support for submit button
document.getElementById('submitBtn').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleSubmit();
    }
});

// Add Enter key support for school email input and upgrade button
document.addEventListener('DOMContentLoaded', function() {
    // This will be called when the modal is shown and the input exists
    const modal = document.getElementById('modal');
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (modal.classList.contains('show')) {
                    const schoolEmailInput = document.getElementById('schoolEmailInput');
                    const upgradeBtn = document.querySelector('.upgrade-btn');
                    
                    if (schoolEmailInput) {
                        schoolEmailInput.addEventListener('keypress', function(e) {
                            if (e.key === 'Enter') {
                                upgradeToStudent();
                            }
                        });
                    }
                    
                    if (upgradeBtn) {
                        upgradeBtn.addEventListener('keypress', function(e) {
                            if (e.key === 'Enter') {
                                upgradeToStudent();
                            }
                        });
                    }
                }
            }
        });
    });
    
    observer.observe(modal, { attributes: true });
});

// Close modal
function closeModal() {
    document.getElementById('modal').classList.remove('show');
    
    setTimeout(() => {
        // Only reset form if user hasn't submitted yet
        if (!hasSubmitted) {
            document.getElementById('emailInput').value = '';
            document.getElementById('emailInput').classList.remove('edu-email');
            document.getElementById('submitBtn').textContent = 'Request Early Access';
            document.getElementById('submitBtn').classList.remove('edu-priority');
            document.getElementById('emailNotice').classList.remove('show');
        }
        
        // Reset modal
        document.getElementById('questionStep').style.display = 'block';
        document.getElementById('success').style.display = 'none';
        const proTip = document.getElementById('proTipSection');
        proTip.style.display = 'none';
        proTip.style.opacity = '';
        proTip.style.transform = '';
        proTip.style.transition = '';
        document.getElementById('upgradeSuccess').style.display = 'none';
        document.getElementById('schoolEmailInput').value = '';
        
        // Reset animations
        document.getElementById('earlyAccessBadge').classList.remove('badge-appear', 'upgrade-glow');
        document.getElementById('successTitle').classList.remove('upgrade-glow');
        document.getElementById('successTitle').textContent = "Thank you — we'll be in touch";
        document.getElementById('success').classList.remove('content-transition');
        document.getElementById('successMessage').textContent = "We'll notify you when RoomSpot launches.";
        
        // Reset buttons
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            const spinners = btn.querySelectorAll('.loading-spinner');
            spinners.forEach(spinner => spinner.remove());
        });
    }, 400);
}

// Close modal on background click
document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Reset submission state (for testing)
function resetSubmission() {
    hasSubmitted = false;
    userData = {
        emails: [],
        userType: '',
        isBetaUser: false,
        signupTime: new Date().toISOString()
    };
    document.getElementById('emailInput').value = '';
    document.getElementById('emailInput').classList.remove('edu-email');
    document.getElementById('submitBtn').textContent = 'Request Early Access';
    document.getElementById('submitBtn').classList.remove('edu-priority');
    document.getElementById('emailNotice').classList.remove('show');
}

// Make functions globally accessible
window.handleSubmit = handleSubmit;
window.selectChoice = selectChoice;
window.upgradeToStudent = upgradeToStudent;
window.closeModal = closeModal;
window.resetSubmission = resetSubmission; 