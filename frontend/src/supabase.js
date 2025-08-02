// RoomSpot Supabase Client Configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hbodtphwaqabbtzkeixl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhib2R0cGh3YXFhYmJ0emtlaXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwOTgyNjAsImV4cCI6MjA2OTY3NDI2MH0.DtrQYFjJ6dY70U0rvhee7GF6gQnDQSimvYp9e2gVsGQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Utility functions for RoomSpot operations

// Check if email is educational (.edu, .ac, etc.)
export function isEducationalEmail(email) {
    const educationDomains = [
        '.edu', '.edu.', '.ac.', '.edu.au', '.edu.cn', '.edu.in',
        '.ac.uk', '.ac.jp', '.ac.kr', '.ac.ca', '.edu.mx',
        '.edu.br', '.edu.sg', '.edu.hk', '.edu.my'
    ];
    
    return educationDomains.some(domain => 
        email.toLowerCase().includes(domain)
    );
}

// Store user data in Supabase
export async function storeUserData(userData) {
    try {
        // First, check if email already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', userData.email)
            .single();

        if (existingUser) {
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

            if (error) throw error;
            return { success: true, data, updated: true };
        } else {
            // Insert new user
            const { data, error } = await supabase
                .from('users')
                .insert([{
                    email: userData.email,
                    user_type: userData.userType,
                    is_beta_user: userData.isBetaUser,
                    school_email: userData.schoolEmail,
                    email_type: isEducationalEmail(userData.email) ? 'educational' : 'personal'
                }])
                .select();

            if (error) throw error;
            return { success: true, data, updated: false };
        }
    } catch (error) {
        console.error('Error storing user data:', error);
        return { success: false, error };
    }
}

// Check for duplicate email submissions
export async function checkDuplicateEmail(email, submissionType) {
    try {
        const { data, error } = await supabase
            .from('email_submissions')
            .select('id')
            .eq('email', email)
            .eq('submission_type', submissionType)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw error;
        }

        return { isDuplicate: !!data, error: null };
    } catch (error) {
        console.error('Error checking duplicate email:', error);
        return { isDuplicate: false, error };
    }
}

// Store email submission for duplicate tracking
export async function storeEmailSubmission(email, submissionType, metadata = {}) {
    try {
        const { data, error } = await supabase
            .from('email_submissions')
            .insert([{
                email,
                submission_type: submissionType,
                metadata
            }])
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error storing email submission:', error);
        return { success: false, error };
    }
}

// Submit job application
export async function submitJobApplication(applicationData) {
    try {
        // Check for duplicate application
        const duplicateCheck = await checkDuplicateEmail(applicationData.email, 'job_application');
        if (duplicateCheck.isDuplicate) {
            return { success: false, error: 'Email already used for an application' };
        }

        // Store the application
        const { data, error } = await supabase
            .from('job_applications')
            .insert([applicationData])
            .select();

        if (error) throw error;

        // Track email submission
        await storeEmailSubmission(applicationData.email, 'job_application', {
            position: applicationData.position,
            timestamp: new Date().toISOString()
        });

        return { success: true, data };
    } catch (error) {
        console.error('Error submitting job application:', error);
        return { success: false, error };
    }
}

// Submit job notification signup
export async function submitJobNotification(email, interests) {
    try {
        // Check for duplicate notification signup
        const duplicateCheck = await checkDuplicateEmail(email, 'notification');
        if (duplicateCheck.isDuplicate) {
            return { success: false, error: 'Email already subscribed to notifications' };
        }

        // Store the notification signup
        const { data, error } = await supabase
            .from('job_notifications')
            .insert([{
                email,
                interests
            }])
            .select();

        if (error) throw error;

        // Track email submission
        await storeEmailSubmission(email, 'notification', {
            interests,
            timestamp: new Date().toISOString()
        });

        return { success: true, data };
    } catch (error) {
        console.error('Error submitting job notification:', error);
        return { success: false, error };
    }
}

// Submit contact form
export async function submitContactForm(contactData) {
    try {
        // Check for duplicate contact submission (optional, for spam prevention)
        const duplicateCheck = await checkDuplicateEmail(contactData.email, 'contact');
        if (duplicateCheck.isDuplicate) {
            // Allow multiple contact submissions but track them
            console.log('Duplicate contact submission detected');
        }

        // Store the contact submission
        const { data, error } = await supabase
            .from('contact_submissions')
            .insert([contactData])
            .select();

        if (error) throw error;

        // Track email submission
        await storeEmailSubmission(contactData.email, 'contact', {
            subject: contactData.subject,
            timestamp: new Date().toISOString()
        });

        return { success: true, data };
    } catch (error) {
        console.error('Error submitting contact form:', error);
        return { success: false, error };
    }
}

// Get waitlist statistics (for admin dashboard)
export async function getWaitlistStats() {
    try {
        const { data, error } = await supabase
            .rpc('get_waitlist_stats');

        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Error getting waitlist stats:', error);
        return { success: false, error };
    }
}

// Get application statistics (for admin dashboard)
export async function getApplicationStats() {
    try {
        const { data, error } = await supabase
            .rpc('get_application_stats');

        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Error getting application stats:', error);
        return { success: false, error };
    }
} 