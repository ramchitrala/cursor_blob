// Initialize Supabase Client - Works with both CDN and modules
window.initSupabase = function() {
    let supabaseClient;
    
    try {
        if (typeof window.supabase !== 'undefined') {
            // CDN version is available
            const { createClient } = window.supabase;
            supabaseClient = createClient(
                'https://hbodtphwaqabbtzkeixl.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhib2R0cGh3YXFhYmJ0emtlaXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwOTgyNjAsImV4cCI6MjA2OTY3NDI2MH0.DtrQYFjJ6dY70U0rvhee7GF6gQnDQSimvYp9e2gVsGQ'
            );
            console.log('✅ Supabase client initialized via CDN');
        } else {
            console.error('❌ Supabase CDN not loaded');
            return null;
        }
    } catch (error) {
        console.error('❌ Error initializing Supabase client:', error);
        return null;
    }
    
    return supabaseClient;
};

// Utility functions
window.isEducationalEmail = function(email) {
    const educationDomains = [
        '.edu', '.edu.', '.ac.', '.edu.au', '.edu.cn', '.edu.in',
        '.ac.uk', '.ac.jp', '.ac.kr', '.ac.ca', '.edu.mx',
        '.edu.br', '.edu.sg', '.edu.hk', '.edu.my'
    ];
    
    return educationDomains.some(domain =>
        email.toLowerCase().includes(domain)
    );
};

// Store user data in Supabase
window.storeUserData = async function(userData) {
    console.log('🔄 storeUserData called with:', userData);
    
    const supabase = window.initSupabase();
    if (!supabase) {
        console.error('❌ Supabase not initialized in storeUserData');
        return { success: false, error: 'Supabase not initialized' };
    }
    
    try {
        console.log('🔄 Storing user data:', userData);
        
        // First, check if email already exists
        console.log('🔄 Checking for existing user with email:', userData.email);
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', userData.email)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('❌ Error checking existing user:', checkError);
            throw checkError;
        }

        if (existingUser) {
            console.log('🔄 Updating existing user:', existingUser);
            // Update existing user
            const { data, error } = await supabase
                .from('users')
                .update({
                    user_type: userData.userType,
                    is_beta_user: userData.isBetaUser,
                    school_email: userData.schoolEmail,
                    updated_at: new Date().toISOString()
                })
                .eq('email', userData.email)
                .select();

            if (error) {
                console.error('❌ Error updating user:', error);
                throw error;
            }
            console.log('✅ Updated existing user:', data);
            return { success: true, data, updated: true };
        } else {
            console.log('🔄 Creating new user');
            // Insert new user
            const { data, error } = await supabase
                .from('users')
                .insert([{
                    email: userData.email,
                    user_type: userData.userType,
                    is_beta_user: userData.isBetaUser,
                    school_email: userData.schoolEmail,
                    email_type: window.isEducationalEmail(userData.email) ? 'educational' : 'personal'
                }])
                .select();

            if (error) {
                console.error('❌ Error creating user:', error);
                throw error;
            }
            console.log('✅ Created new user:', data);
            return { success: true, data, updated: false };
        }
    } catch (error) {
        console.error('❌ Error storing user data:', error);
        return { success: false, error: error.message || error };
    }
};

// Enhanced job application submission with document upload support
window.submitEnhancedJobApplication = async function(applicationData, documents = []) {
    console.log('🔄 submitEnhancedJobApplication called with:', applicationData);
    
    const supabase = window.initSupabase();
    if (!supabase) {
        console.error('❌ Supabase not initialized in submitEnhancedJobApplication');
        return { success: false, error: 'Supabase not initialized' };
    }
    
    try {
        console.log('🔄 Submitting enhanced job application:', applicationData);
        
        // Check for duplicate application
        console.log('🔄 Checking for duplicate application');
        const { data: existingApp, error: checkError } = await supabase
            .from('job_applications')
            .select('id')
            .eq('email', applicationData.email)
            .eq('position', applicationData.position)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('❌ Error checking duplicate application:', checkError);
            throw checkError;
        }

        if (existingApp) {
            console.log('❌ Duplicate application found');
            return { success: false, error: 'You have already applied for this position' };
        }

        // Prepare application data with new fields
        const enhancedApplicationData = {
            first_name: applicationData.first_name,
            last_name: applicationData.last_name,
            email: applicationData.email,
            phone: applicationData.phone || null,
            location: applicationData.location,
            linkedin_url: applicationData.linkedin_url || null,
            portfolio_url: applicationData.portfolio_url || null,
            experience: applicationData.experience,
            current_company: applicationData.current_company || null,
            skills: applicationData.skills || null,
            position: applicationData.position,
            cover_letter: applicationData.cover_letter,
            salary_expectation: applicationData.salary_expectation || null,
            start_date: applicationData.start_date || null,
            referral_source: applicationData.referral_source || null,
            work_authorization: applicationData.work_authorization || null,
            f1_details: applicationData.f1_details || null,
            sponsorship: applicationData.sponsorship || null,
            relocation: applicationData.relocation || null,
            gender: applicationData.gender || null,
            race: applicationData.race || null,
            veteran: applicationData.veteran || null,
            disability: applicationData.disability || null,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        // Submit the application
        console.log('🔄 Inserting application data');
        const { data: application, error: appError } = await supabase
            .from('job_applications')
            .insert([enhancedApplicationData])
            .select()
            .single();

        if (appError) {
            console.error('❌ Error inserting application:', appError);
            throw appError;
        }
        
        console.log('✅ Application submitted:', application);

        // Handle document uploads from form files
        const resumeFile = document.getElementById('resume')?.files[0];
        const additionalFiles = document.getElementById('additionalDocs')?.files;
        
        if (resumeFile) {
            console.log('🔄 Uploading resume');
            const resumeResult = await window.uploadDocument(application.id, resumeFile, 'resume');
            console.log('📄 Resume upload result:', resumeResult);
        }

        if (additionalFiles && additionalFiles.length > 0) {
            console.log('🔄 Uploading additional documents:', additionalFiles.length);
            for (let i = 0; i < additionalFiles.length; i++) {
                const file = additionalFiles[i];
                const docType = `additional_${i + 1}`;
                const uploadResult = await window.uploadDocument(application.id, file, docType);
                console.log(`📄 Additional document ${i + 1} upload result:`, uploadResult);
            }
        }

        // Handle documents passed as parameter (for backward compatibility)
        if (documents.length > 0) {
            console.log('🔄 Uploading documents from parameter:', documents.length);
            const uploadResults = await Promise.all(
                documents.map((doc, index) => uploadDocument(application.id, doc, `param_${index + 1}`))
            );
            
            console.log('📄 Documents uploaded:', uploadResults);
        }

        // Track analytics event
        await window.trackApplicationEvent(application.id, 'submit', window.location.href);

        return { success: true, data: application };
    } catch (error) {
        console.error('❌ Error submitting enhanced application:', error);
        return { success: false, error: error.message || error };
    }
};

// Document upload function
window.uploadDocument = async function(applicationId, documentFile, documentType = 'resume') {
    console.log('🔄 uploadDocument called for application:', applicationId);
    
    const supabase = window.initSupabase();
    if (!supabase) {
        console.error('❌ Supabase not initialized in uploadDocument');
        return { success: false, error: 'Supabase not initialized' };
    }
    
    try {
        const fileName = `${applicationId}/${documentType}_${Date.now()}_${documentFile.name}`;
        
        console.log('🔄 Uploading file to storage:', fileName);
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('application-documents')
            .upload(fileName, documentFile);

        if (uploadError) {
            console.error('❌ Error uploading to storage:', uploadError);
            throw uploadError;
        }

        console.log('🔄 Saving document metadata to database');
        // Save document metadata to database
        const { data: docData, error: docError } = await supabase
            .from('application_documents')
            .insert([{
                application_id: applicationId,
                document_type: documentType,
                file_name: documentFile.name,
                file_size: documentFile.size,
                mime_type: documentFile.type,
                storage_path: uploadData.path
            }])
            .select()
            .single();

        if (docError) {
            console.error('❌ Error saving document metadata:', docError);
            throw docError;
        }

        console.log('✅ Document uploaded successfully:', docData);
        return { success: true, data: docData };
    } catch (error) {
        console.error('❌ Error uploading document:', error);
        return { success: false, error: error.message || error };
    }
};

// Track application analytics
window.trackApplicationEvent = async function(applicationId, eventType, pageUrl = null, timeSpent = null) {
    console.log('🔄 trackApplicationEvent called:', { applicationId, eventType });
    
    const supabase = window.initSupabase();
    if (!supabase) {
        console.warn('⚠️ Supabase not initialized in trackApplicationEvent');
        return;
    }
    
    try {
        await supabase.rpc('track_application_event', {
            p_application_id: applicationId,
            p_event_type: eventType,
            p_page_url: pageUrl,
            p_user_agent: navigator.userAgent,
            p_session_id: sessionStorage.getItem('session_id') || 'anonymous',
            p_time_spent: timeSpent
        });
        console.log('✅ Application event tracked');
    } catch (error) {
        console.warn('⚠️ Analytics tracking failed:', error);
    }
};

// Enhanced contact form submission with categorization
window.submitEnhancedContactForm = async function(contactData) {
    console.log('🔄 submitEnhancedContactForm called with:', contactData);
    
    const supabase = window.initSupabase();
    if (!supabase) {
        console.error('❌ Supabase not initialized in submitEnhancedContactForm');
        return { success: false, error: 'Supabase not initialized' };
    }
    
    try {
        console.log('🔄 Submitting enhanced contact form:', contactData);
        
        // Determine priority based on contact type
        const priority = contactData.contact_type === 'vc' ? 'high' : 
                        contactData.contact_type === 'media' ? 'normal' : 'normal';
        
        const enhancedData = {
            first_name: contactData.first_name,
            last_name: contactData.last_name,
            email: contactData.email,
            message: contactData.message,
            contact_type: contactData.contact_type || 'general',
            company: contactData.company || null,
            phone: contactData.phone || null,
            preferred_contact: contactData.preferred_contact || null,
            priority,
            status: 'new'
        };

        console.log('🔄 Inserting contact submission');
        const { data, error } = await supabase
            .from('contact_submissions')
            .insert([enhancedData])
            .select()
            .single();

        if (error) {
            console.error('❌ Error inserting contact submission:', error);
            throw error;
        }

        console.log('✅ Enhanced contact form submitted:', data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error submitting enhanced contact form:', error);
        return { success: false, error: error.message || error };
    }
};

// Get enhanced analytics
window.getEnhancedAnalytics = async function() {
    console.log('🔄 getEnhancedAnalytics called');
    
    const supabase = window.initSupabase();
    if (!supabase) {
        console.error('❌ Supabase not initialized in getEnhancedAnalytics');
        return { success: false, error: 'Supabase not initialized' };
    }
    
    try {
        const [appStats, contactStats, completionRate] = await Promise.all([
            supabase.from('enhanced_application_stats').select('*').single(),
            supabase.from('contact_submission_stats').select('*').single(),
            supabase.rpc('get_application_completion_rate')
        ]);

        return {
            success: true,
            data: {
                applications: appStats.data,
                contacts: contactStats.data,
                completion: completionRate.data[0]
            }
        };
    } catch (error) {
        console.error('❌ Error getting enhanced analytics:', error);
        return { success: false, error: error.message || error };
    }
};

// Check for duplicate email
window.checkDuplicateEmail = async function(email, submissionType = 'waitlist') {
    console.log('🔄 checkDuplicateEmail called:', { email, submissionType });
    
    const supabase = window.initSupabase();
    if (!supabase) {
        console.error('❌ Supabase not initialized in checkDuplicateEmail');
        return { success: false, error: 'Supabase not initialized' };
    }
    
    try {
        console.log('🔄 Checking for duplicate email:', email);
        
        // Check in users table first for waitlist submissions
        if (submissionType === 'waitlist') {
            console.log('🔄 Checking users table for waitlist submission');
            const { data: existingUser, error: userError } = await supabase
                .from('users')
                .select('id, email')
                .eq('email', email)
                .single();

            if (userError && userError.code !== 'PGRST116') {
                console.error('❌ Error checking users table:', userError);
                throw userError;
            }

            if (existingUser) {
                console.log('✅ Found existing user:', existingUser);
                return { 
                    success: true, 
                    isDuplicate: true, 
                    message: 'You have already enrolled in beta and will be notified accordingly' 
                };
            }
        }

        // Check in email_submissions table
        console.log('🔄 Checking email_submissions table');
        const { data: existingSubmission, error: submissionError } = await supabase
            .from('email_submissions')
            .select('id')
            .eq('email', email)
            .eq('submission_type', submissionType)
            .single();

        if (submissionError && submissionError.code !== 'PGRST116') {
            console.error('❌ Error checking email_submissions table:', submissionError);
            throw submissionError;
        }

        if (existingSubmission) {
            console.log('✅ Found existing submission:', existingSubmission);
            return { 
                success: true, 
                isDuplicate: true, 
                message: 'Email already submitted' 
            };
        }

        console.log('✅ No duplicate found');
        return { success: true, isDuplicate: false };
    } catch (error) {
        console.error('❌ Error checking duplicate email:', error);
        return { success: false, error: error.message || error };
    }
};

// Submit job notification
window.submitJobNotification = async function(email, interests) {
    console.log('🔄 submitJobNotification called:', { email, interests });
    
    const supabase = window.initSupabase();
    if (!supabase) {
        console.error('❌ Supabase not initialized in submitJobNotification');
        return { success: false, error: 'Supabase not initialized' };
    }
    
    try {
        console.log('🔄 Submitting job notification:', { email, interests });
        
        // Check for duplicate notification
        console.log('🔄 Checking for duplicate notification');
        const { data: existingNotification, error: checkError } = await supabase
            .from('job_notifications')
            .select('id')
            .eq('email', email)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('❌ Error checking duplicate notification:', checkError);
            throw checkError;
        }

        if (existingNotification) {
            console.log('❌ Duplicate notification found');
            return { success: false, error: 'You are already subscribed to job notifications' };
        }

        console.log('🔄 Inserting job notification');
        const { data, error } = await supabase
            .from('job_notifications')
            .insert([{
                email: email,
                interests: interests,
                is_active: true
            }])
            .select()
            .single();

        if (error) {
            console.error('❌ Error inserting job notification:', error);
            throw error;
        }

        console.log('✅ Job notification submitted:', data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error submitting job notification:', error);
        return { success: false, error: error.message || error };
    }
};

// Test Supabase connection
window.testSupabaseConnection = async function() {
    console.log('🔄 testSupabaseConnection called');
    
    const supabase = window.initSupabase();
    if (!supabase) {
        console.error('❌ Supabase not initialized in testSupabaseConnection');
        return false;
    }
    
    try {
        console.log('🔄 Testing connection to users table');
        const { data, error } = await supabase.from('users').select('count');
        if (error) {
            console.error('❌ Error testing connection:', error);
            throw error;
        }
        console.log('✅ Supabase connection test successful');
        return true;
    } catch (error) {
        console.error('❌ Supabase connection test failed:', error);
        return false;
    }
};

// Add a comprehensive test function
window.testAllSupabaseFunctions = async function() {
    console.log('🧪 Starting comprehensive Supabase test...');
    
    const results = {
        connection: false,
        users_table: false,
        job_applications_table: false,
        contact_submissions_table: false,
        email_submissions_table: false,
        job_notifications_table: false
    };
    
    try {
        // Test connection
        results.connection = await window.testSupabaseConnection();
        
        if (results.connection) {
            const supabase = window.initSupabase();
            
            // Test each table
            const tables = [
                'users',
                'job_applications', 
                'contact_submissions',
                'email_submissions',
                'job_notifications'
            ];
            
            for (const table of tables) {
                try {
                    console.log(`🔄 Testing ${table} table`);
                    const { data, error } = await supabase.from(table).select('count');
                    if (error) {
                        console.error(`❌ Error testing ${table}:`, error);
                    } else {
                        console.log(`✅ ${table} table accessible`);
                        results[`${table}_table`] = true;
                    }
                } catch (error) {
                    console.error(`❌ Exception testing ${table}:`, error);
                }
            }
        }
        
        console.log('🧪 Test results:', results);
        return results;
        
    } catch (error) {
        console.error('❌ Error in comprehensive test:', error);
        return results;
    }
};