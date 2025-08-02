// Multi-step form functionality with enhanced UX
class MultiStepForm {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5; // Updated to 5 steps
        this.form = document.getElementById('applicationForm');
        this.progressSteps = document.querySelectorAll('.progress-step');
        this.formSteps = document.querySelectorAll('.form-step');
        this.nextBtn = document.getElementById('nextBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.submitBtn = document.getElementById('submitBtn');
        this.positionTitle = document.getElementById('positionTitle');
        
        // Track form data
        this.formData = {};
        
        // Initialize
        this.init();
    }

    init() {
        console.log('Initializing MultiStepForm...');
        this.loadSelectedJob();
        this.setupEventListeners();
        this.setupFileUploads();
        this.setupF1Logic();
        this.updateProgress();
        this.updateNavigation();
        this.setupFormValidation();
    }

    loadSelectedJob() {
        try {
            const selectedJob = localStorage.getItem('selectedJob');
            if (selectedJob) {
                const job = JSON.parse(selectedJob);
                const positionField = document.getElementById('position');
                if (positionField) {
                    positionField.value = job.title;
                    this.formData.position = job.title;
                }
                
                // Update page title and header
                document.title = `Apply for ${job.title} - RoomSpot`;
                if (this.positionTitle) {
                    this.positionTitle.textContent = `Apply for ${job.title}`;
                }
                
                // Clear localStorage after loading
                localStorage.removeItem('selectedJob');
                console.log('Loaded job:', job.title);
            } else {
                console.warn('No selected job found in localStorage');
            }
        } catch (error) {
            console.error('Error loading selected job:', error);
        }
    }

    setupF1Logic() {
        const workAuthSelect = document.getElementById('workAuthorization');
        const f1Fields = document.getElementById('f1Fields');
        
        if (workAuthSelect && f1Fields) {
            workAuthSelect.addEventListener('change', (e) => {
                if (e.target.value === 'f1-student') {
                    f1Fields.style.display = 'block';
                    f1Fields.style.animation = 'slideInDown 0.3s ease';
                } else {
                    f1Fields.style.display = 'none';
                }
            });
        }
    }

    setupEventListeners() {
        // Navigation buttons
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextStep();
            });
        }

        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.previousStep();
            });
        }

        if (this.submitBtn) {
            this.submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSubmit(e);
            });
        }

        // Progress step clicks
        this.progressSteps.forEach((step, index) => {
            step.addEventListener('click', () => {
                const stepNumber = index + 1;
                if (stepNumber <= this.currentStep) {
                    this.goToStep(stepNumber);
                }
            });
        });

        // Form validation on input
        this.form.addEventListener('input', (e) => {
            this.validateField(e.target);
            this.updateNavigation();
        });

        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(e);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                if (this.currentStep < this.totalSteps) {
                    this.nextStep();
                } else {
                    this.handleSubmit(e);
                }
            }
        });

        console.log('Event listeners setup complete');
    }

    setupFormValidation() {
        // Add validation attributes to form fields
        const requiredFields = this.form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.validateField(field));
        });

        // Special validation for email
        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.addEventListener('blur', () => this.validateField(emailField));
        }

        // Special validation for URLs
        const urlFields = document.querySelectorAll('input[type="url"]');
        urlFields.forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
        });

        console.log('Form validation setup complete');
    }

    setupFileUploads() {
        const fileUploads = document.querySelectorAll('.file-upload-area');
        
        fileUploads.forEach(upload => {
            const input = upload.querySelector('input[type="file"]');
            
            // Click to upload
            upload.addEventListener('click', (e) => {
                e.preventDefault();
                input.click();
            });
            
            // Drag and drop
            upload.addEventListener('dragover', (e) => {
                e.preventDefault();
                upload.classList.add('dragover');
            });
            
            upload.addEventListener('dragleave', (e) => {
                e.preventDefault();
                if (!upload.contains(e.relatedTarget)) {
                    upload.classList.remove('dragover');
                }
            });
            
            upload.addEventListener('drop', (e) => {
                e.preventDefault();
                upload.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    input.files = files;
                    this.handleFileUpload(e, upload, files[0]);
                }
            });
            
            // File selection
            input.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileUpload(e, upload, e.target.files[0]);
                }
            });
        });

        console.log('File uploads setup complete');
    }

    handleFileUpload(event, uploadElement, file) {
        if (!file) return;

        const uploadText = uploadElement.querySelector('.upload-text');
        const uploadHint = uploadElement.querySelector('.upload-hint');
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            this.showFileError(uploadElement, 'File size must be less than 5MB');
            return;
        }

        // Validate file type
        const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExtension)) {
            this.showFileError(uploadElement, 'Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG files.');
            return;
        }

        // Clear any existing errors
        this.clearFileError(uploadElement);

        // Update UI
        uploadText.textContent = file.name;
        uploadHint.textContent = `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
        uploadElement.style.borderColor = 'var(--success)';
        uploadElement.style.background = 'rgba(0, 255, 136, 0.05)';
        
        // Add success animation
        uploadElement.style.transform = 'scale(1.02)';
        setTimeout(() => {
            uploadElement.style.transform = 'scale(1)';
        }, 200);

        console.log('File uploaded successfully:', file.name);
    }

    showFileError(uploadElement, message) {
        this.clearFileError(uploadElement);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'file-error-message';
        errorDiv.style.cssText = `
            color: var(--error-color);
            font-size: 0.875rem;
            margin-top: 0.5rem;
            padding: 0.5rem;
            background: rgba(255, 68, 68, 0.1);
            border-radius: var(--radius-sm);
            border: 1px solid rgba(255, 68, 68, 0.2);
        `;
        errorDiv.textContent = message;
        
        uploadElement.appendChild(errorDiv);
        uploadElement.style.borderColor = 'var(--error-color)';
        uploadElement.style.background = 'rgba(255, 68, 68, 0.05)';
    }

    clearFileError(uploadElement) {
        const existingError = uploadElement.querySelector('.file-error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error styling
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation
        if (field.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }

        // URL validation
        if (field.type === 'url' && value && !this.isValidUrl(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid URL';
        }

        // Phone validation
        if (field.type === 'tel' && value && !this.isValidPhone(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }

        // Show error if invalid
        if (!isValid) {
            field.classList.add('error');
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    validateCurrentStep() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            if (this.validateCurrentStep()) {
                this.currentStep++;
                this.updateStep();
                this.updateProgress();
                this.updateNavigation();
                console.log('Moved to step:', this.currentStep);
            } else {
                this.showStepError();
            }
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStep();
            this.updateProgress();
            this.updateNavigation();
            console.log('Moved to step:', this.currentStep);
        }
    }

    goToStep(step) {
        if (step >= 1 && step <= this.currentStep) {
            this.currentStep = step;
            this.updateStep();
            this.updateProgress();
            this.updateNavigation();
            console.log('Jumped to step:', this.currentStep);
        }
    }

    updateStep() {
        // Hide all steps
        this.formSteps.forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }
    }

    updateProgress() {
        this.progressSteps.forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
            }
        });
    }

    updateNavigation() {
        // Previous button
        if (this.prevBtn) {
            if (this.currentStep > 1) {
                this.prevBtn.style.display = 'block';
            } else {
                this.prevBtn.style.display = 'none';
            }
        }

        // Next/Submit button
        if (this.nextBtn && this.submitBtn) {
            if (this.currentStep < this.totalSteps) {
                this.nextBtn.style.display = 'block';
                this.submitBtn.style.display = 'none';
                
                // Disable next button if current step is invalid
                const isValid = this.validateCurrentStep();
                this.nextBtn.disabled = !isValid;
            } else {
                this.nextBtn.style.display = 'none';
                this.submitBtn.style.display = 'block';
                
                // Disable submit button if current step is invalid
                const isValid = this.validateCurrentStep();
                this.submitBtn.disabled = !isValid;
            }
        }
    }

    showFieldError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            ${message}
        `;
        
        field.parentNode.appendChild(errorDiv);
    }

    showStepError() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        const stepContent = currentStepElement.querySelector('.step-content');
        
        // Remove existing error
        const existingError = stepContent.querySelector('.step-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'step-error';
        errorDiv.innerHTML = `
            <div style="
                background: rgba(255, 68, 68, 0.1);
                border: 1px solid var(--error-color);
                border-radius: var(--radius-md);
                padding: 1rem;
                margin-top: 1rem;
                color: var(--error-color);
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                Please complete all required fields before continuing
            </div>
        `;
        
        stepContent.appendChild(errorDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        if (!this.validateCurrentStep()) {
            this.showStepError();
            return;
        }

        // Show loading state
        this.submitBtn.classList.add('loading');
        this.submitBtn.textContent = 'Submitting...';
        this.submitBtn.disabled = true;

        try {
            // Collect form data
            const formData = new FormData(this.form);
            const applicationData = {
                first_name: formData.get('firstName'),
                last_name: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                location: formData.get('location'),
                linkedin_url: formData.get('linkedin'),
                portfolio_url: formData.get('portfolio'),
                experience: formData.get('experience'),
                current_company: formData.get('currentCompany'),
                skills: formData.get('skills'),
                position: formData.get('position'),
                cover_letter: formData.get('coverLetter'),
                salary_expectation: formData.get('salaryExpectation'),
                start_date: formData.get('startDate'),
                referral_source: formData.get('referral'),
                work_authorization: formData.get('workAuthorization'),
                f1_details: formData.get('f1Details'),
                sponsorship: formData.get('sponsorship'),
                relocation: formData.get('relocation'),
                gender: formData.get('gender'),
                race: formData.get('race'),
                veteran: formData.get('veteran'),
                disability: formData.get('disability'),
                status: 'pending'
            };

            console.log('Submitting application data:', applicationData);

            // Submit to Supabase
            if (window.submitEnhancedJobApplication) {
                await window.submitEnhancedJobApplication(applicationData);
                
                // Show success step
                this.currentStep = 6; // Success step
                this.updateStep();
                this.updateProgress();
                this.updateNavigation();
                
                // Hide navigation buttons on success
                const navigation = document.querySelector('.form-navigation');
                if (navigation) {
                    navigation.style.display = 'none';
                }
                
                console.log('Application submitted successfully');
                
            } else {
                throw new Error('Supabase function not available');
            }

        } catch (error) {
            console.error('Submission error:', error);
            
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = `
                <div style="
                    background: rgba(255, 68, 68, 0.1);
                    border: 1px solid var(--error-color);
                    border-radius: var(--radius-md);
                    padding: 1rem;
                    margin-top: 1rem;
                    color: var(--error-color);
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                ">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    Failed to submit application. Please try again.
                </div>
            `;
            
            const stepContent = document.querySelector(`.form-step[data-step="${this.currentStep}"] .step-content`);
            stepContent.appendChild(errorDiv);
            
        } finally {
            // Reset button state
            this.submitBtn.classList.remove('loading');
            this.submitBtn.textContent = 'Submit Application';
            this.submitBtn.disabled = false;
        }
    }
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing MultiStepForm...');
    new MultiStepForm();
}); 