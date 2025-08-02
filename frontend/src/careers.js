// Reuse main page background animations
let mouseX = 0, mouseY = 0;
let rafId = null;
let lastTime = 0;

// Use global Supabase functions loaded via CDN
// Available: window.submitJobApplication, window.submitJobNotification, window.checkDuplicateEmail

// Job listings data
const jobListings = [
    {
        id: 'senior-frontend-engineer',
        title: 'Senior Frontend Engineer',
        type: 'Full-time',
        location: 'Remote / San Francisco',
        level: 'Senior Level',
        category: 'Engineering',
        salary: '$120,000 - $180,000',
        equity: '0.1% - 0.5%',
        description: 'Lead the development of our user-facing platform with React and modern web technologies.',
        responsibilities: [
            'Build responsive, animated web applications with React and TypeScript',
            'Collaborate with design and backend teams to create seamless experiences',
            'Optimize performance for 60fps animations and smooth interactions',
            'Implement accessibility best practices and responsive design',
            'Mentor junior developers and contribute to technical decisions',
            'Drive frontend architecture decisions and best practices'
        ],
        requirements: [
            '5+ years of experience with React, TypeScript, and modern CSS',
            'Strong understanding of animation libraries and performance optimization',
            'Experience with responsive design and cross-browser compatibility',
            'Passion for creating beautiful, accessible user interfaces',
            'Experience with modern tooling (Vite, Next.js, Tailwind)',
            'Previous experience in a senior or lead role'
        ],
        benefits: [
            'Competitive salary and equity package',
            'Comprehensive health, dental, and vision insurance',
            'Unlimited PTO and flexible working arrangements',
            '$3K annual learning and development budget',
            'Top-tier equipment and ergonomic home office setup',
            'Stock options with high growth potential'
        ]
    },
    {
        id: 'product-designer',
        title: 'Product Designer',
        type: 'Full-time',
        location: 'Remote / San Francisco',
        level: 'Mid to Senior Level',
        category: 'Design',
        salary: '$100,000 - $140,000',
        equity: '0.05% - 0.3%',
        description: 'Design intuitive experiences that help students find safe, affordable housing.',
        responsibilities: [
            'Design user flows and interfaces for web and mobile applications',
            'Create wireframes, prototypes, and high-fidelity designs',
            'Conduct user research and usability testing',
            'Collaborate with engineering to ensure design implementation',
            'Maintain and evolve our design system',
            'Present design concepts to stakeholders'
        ],
        requirements: [
            '3+ years of product design experience',
            'Proficiency in Figma, Sketch, or similar design tools',
            'Experience with user research and usability testing',
            'Strong understanding of responsive and mobile design',
            'Portfolio demonstrating end-to-end design process',
            'Experience in B2C or marketplace products preferred'
        ],
        benefits: [
            'Competitive salary and equity package',
            'Comprehensive health, dental, and vision insurance',
            'Unlimited PTO and flexible working arrangements',
            '$2K annual design tools and conference budget',
            'Top-tier equipment and ergonomic home office setup',
            'Direct impact on product direction'
        ]
    },
    {
        id: 'backend-engineer',
        title: 'Backend Engineer',
        type: 'Full-time',
        location: 'Remote / San Francisco',
        level: 'Mid to Senior Level',
        category: 'Engineering',
        salary: '$110,000 - $160,000',
        equity: '0.05% - 0.4%',
        description: 'Build scalable backend systems that power our housing platform.',
        responsibilities: [
            'Design and implement scalable API endpoints',
            'Work with databases, caching, and message queues',
            'Implement security best practices and data protection',
            'Optimize system performance and reliability',
            'Collaborate with frontend team on API design',
            'Monitor and maintain production systems'
        ],
        requirements: [
            '3+ years of backend development experience',
            'Proficiency in Node.js, Python, or Go',
            'Experience with PostgreSQL and Redis',
            'Knowledge of cloud platforms (AWS, GCP, or Azure)',
            'Understanding of microservices architecture',
            'Experience with API design and RESTful services'
        ],
        benefits: [
            'Competitive salary and equity package',
            'Comprehensive health, dental, and vision insurance',
            'Unlimited PTO and flexible working arrangements',
            '$3K annual learning and development budget',
            'Top-tier equipment and ergonomic home office setup',
            'Opportunity to build systems from the ground up'
        ]
    }
];

// Email storage for duplicate checking (fallback to localStorage)
let submittedEmails = JSON.parse(localStorage.getItem('roomspot_submitted_emails') || '[]');

// Current selected job for application
let currentJob = null;

// Render job listings
function renderJobListings() {
    const container = document.getElementById('job-listings');
    if (!container) return;
    
    container.innerHTML = '';
    
    jobListings.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'position-card';
        
        jobCard.innerHTML = `
            <div class="position-header">
                <div class="position-info">
                    <h3 class="position-title">${job.title}</h3>
                    <div class="position-meta">
                        <span class="position-type">${job.type}</span>
                        <span class="position-location">${job.location}</span>
                        <span class="position-level">${job.level}</span>
                        <span class="position-salary">${job.salary}</span>
                    </div>
                    <p class="position-description">${job.description}</p>
                </div>
                <div class="position-apply">
                    <button class="apply-btn" onclick="viewJobDetails('${job.id}')">View Details</button>
                </div>
            </div>
        `;
        
        container.appendChild(jobCard);
    });
}

// View job details
function viewJobDetails(jobId) {
    const job = jobListings.find(j => j.id === jobId);
    if (!job) return;
    
    currentJob = job;
    
    const modal = document.getElementById('jobDetailsModal') || createJobDetailsModal();
    const content = modal.querySelector('.job-details-content');
    
    content.innerHTML = `
        <div class="job-details-header">
            <h2>${job.title}</h2>
            <div class="job-meta">
                <span class="job-type">${job.type}</span>
                <span class="job-location">${job.location}</span>
                <span class="job-salary">${job.salary}</span>
                <span class="job-equity">Equity: ${job.equity}</span>
            </div>
        </div>
        
        <div class="job-details-body">
            <div class="job-section">
                <h3>About the Role</h3>
                <p>${job.description}</p>
            </div>
            
            <div class="job-section">
                <h3>What You'll Do</h3>
                <ul>
                    ${job.responsibilities.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            
            <div class="job-section">
                <h3>What We're Looking For</h3>
                <ul>
                    ${job.requirements.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            
            <div class="job-section">
                <h3>Benefits & Perks</h3>
                <ul>
                    ${job.benefits.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        </div>
        
        <div class="job-details-actions">
            <button class="cancel-btn" onclick="closeJobDetails()">Close</button>
            <button class="apply-btn primary" onclick="openApplication('${job.id}')">Apply for this Role</button>
        </div>
    `;
    
    modal.style.display = 'flex';
    modal.classList.add('show');
}

// Create job details modal
function createJobDetailsModal() {
    const modal = document.createElement('div');
    modal.id = 'jobDetailsModal';
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal job-details-modal" role="dialog" aria-label="Job Details">
            <div class="job-details-content">
                <!-- Content will be populated dynamically -->
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

// Close job details
function closeJobDetails() {
    const modal = document.getElementById('jobDetailsModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
}

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
    const result = await window.checkDuplicateEmail(email, 'job_application');
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
function openApplication(jobId) {
    const job = jobId ? jobListings.find(j => j.id === jobId) : currentJob;
    if (!job) return;
    
    // Store the selected job in localStorage for the application page
    localStorage.setItem('selectedJob', JSON.stringify(job));
    
    // Redirect to the separate application page
    window.location.href = 'careers-apply.html';
}

function createEnhancedApplicationForm(form, job) {
    if (!form) return;
    
    form.innerHTML = `
        <!-- Personal Information -->
        <div class="form-section">
            <h3>Personal Information</h3>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="firstName">First Name *</label>
                    <input type="text" id="firstName" name="firstName" required>
                </div>
                <div class="form-group">
                    <label for="lastName">Last Name *</label>
                    <input type="text" id="lastName" name="lastName" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="email">Email Address *</label>
                <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" placeholder="+1 (555) 123-4567">
            </div>
        </div>

        <!-- Professional Information -->
        <div class="form-section">
            <h3>Professional Information</h3>
            
            <div class="form-group">
                <label for="linkedIn">LinkedIn Profile</label>
                <input type="url" id="linkedIn" name="linkedIn" placeholder="https://linkedin.com/in/yourprofile">
            </div>
            
            <div class="form-group">
                <label for="portfolio">Portfolio/GitHub</label>
                <input type="url" id="portfolio" name="portfolio" placeholder="https://github.com/yourusername">
            </div>
            
            <div class="form-group">
                <label for="resume">Resume/CV (Optional)</label>
                <input type="file" id="resume" name="resume" accept=".pdf,.doc,.docx" />
                <small>Upload your resume in PDF or Word format (max 5MB)</small>
            </div>
            
            <div class="form-group">
                <label for="experience">Why are you interested in this ${job.title} role? *</label>
                <textarea id="experience" name="experience" rows="4" placeholder="Tell us about your relevant experience and what excites you about this opportunity..." required></textarea>
            </div>
        </div>

        <!-- Work Authorization -->
        <div class="form-section">
            <h3>Work Authorization</h3>
            
            <div class="form-group">
                <label for="workAuth">Work Authorization Status *</label>
                <select id="workAuth" name="workAuth" required>
                    <option value="">Please select</option>
                    <option value="us-citizen">US Citizen</option>
                    <option value="permanent-resident">Permanent Resident</option>
                    <option value="f1-student">F1 Student (OPT/CPT eligible)</option>
                    <option value="h1b">H1B Visa Holder</option>
                    <option value="other-visa">Other Visa Status</option>
                    <option value="require-sponsorship">Will require sponsorship</option>
                </select>
            </div>
            
            <div class="form-group" id="visaDetails" style="display: none;">
                <label for="visaStatus">Visa Details</label>
                <input type="text" id="visaStatus" name="visaStatus" placeholder="e.g., F1 with OPT eligible May 2024">
            </div>
        </div>

        <!-- EEO Section -->
        <div class="form-section">
            <h3>Equal Opportunity Employment (Optional)</h3>
            <p class="eeo-notice">
                RoomSpot is committed to diversity. This information helps us track our recruiting efforts. 
                <strong>Completion is voluntary and won't affect your application.</strong>
            </p>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="gender">Gender Identity</label>
                    <select id="gender" name="gender">
                        <option value="">Prefer not to answer</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="ethnicity">Race/Ethnicity</label>
                    <select id="ethnicity" name="ethnicity">
                        <option value="">Prefer not to answer</option>
                        <option value="asian">Asian</option>
                        <option value="black">Black or African American</option>
                        <option value="hispanic">Hispanic or Latino</option>
                        <option value="white">White</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="application-actions">
            <button type="button" class="cancel-btn" onclick="closeApplication()">Cancel</button>
            <button type="submit" class="submit-application-btn">Submit Application</button>
        </div>
    `;
    
    // Add conditional logic for visa details
    const workAuthSelect = form.querySelector('#workAuth');
    const visaDetails = form.querySelector('#visaDetails');
    
    if (workAuthSelect && visaDetails) {
        workAuthSelect.addEventListener('change', function() {
            if (this.value === 'f1-student' || this.value === 'other-visa') {
                visaDetails.style.display = 'block';
            } else {
                visaDetails.style.display = 'none';
            }
        });
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
    // Notification Form
    const notificationForm = document.querySelector('.notification-form');
    if (notificationForm) {
        setupNotificationFormListeners(notificationForm);
    }
});

// Set up application form listeners
function setupApplicationFormListeners(form) {
    if (!form) return;
    
    // Add real-time validation
    form.querySelectorAll('input, textarea').forEach(input => {
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
    
    form.addEventListener('submit', async function(e) {
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
            position: currentJob ? currentJob.title : 'Unknown Position'
        };
        
        // Collect documents if any
        const documents = [];
        const resumeFile = formData.get('resume');
        if (resumeFile && resumeFile.size > 0) {
            documents.push({ file: resumeFile, type: 'resume' });
        }
        
        // Enhanced application data
        const enhancedApplicationData = {
            first_name: formData.get('firstName'),
            last_name: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone') || null,
            linkedin_url: formData.get('linkedIn') || null,
            portfolio_url: formData.get('portfolio') || null,
            experience: formData.get('experience') || null,
            position: currentJob ? currentJob.title : 'Unknown Position',
            work_authorization: formData.get('workAuth') || null,
            visa_status: formData.get('visaStatus') || null,
            sponsorship_required: formData.get('workAuth') === 'require-sponsorship',
            gender: formData.get('gender') || null,
            ethnicity: formData.get('ethnicity') || null
        };
        
        // Submit to Supabase with enhanced data
        const result = await window.submitEnhancedJobApplication(enhancedApplicationData, documents);
        
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
            position: currentJob ? currentJob.title : 'Unknown Position'
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

// Set up notification form listeners
function setupNotificationFormListeners(form) {
    if (!form) return;
    
    // Add real-time validation
    form.querySelectorAll('input, select').forEach(input => {
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
    
    form.addEventListener('submit', async function(e) {
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
        const result = await window.submitJobNotification(email, interests);
        
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

// Initialize job listings when page loads
document.addEventListener('DOMContentLoaded', function() {
    renderJobListings();
});

// Global functions for HTML onclick handlers
window.viewJobDetails = viewJobDetails;
window.closeJobDetails = closeJobDetails; 