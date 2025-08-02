-- Enhanced RoomSpot Database Schema with Document Upload Support
-- This supplements the existing schema with additional tables and features

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enhanced job applications table with additional fields
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS work_authorization TEXT,
ADD COLUMN IF NOT EXISTS visa_status TEXT,
ADD COLUMN IF NOT EXISTS sponsorship_required BOOLEAN,
ADD COLUMN IF NOT EXISTS salary_expectation TEXT,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS remote_preference TEXT,
ADD COLUMN IF NOT EXISTS referral_source TEXT,
ADD COLUMN IF NOT EXISTS cover_letter TEXT,
ADD COLUMN IF NOT EXISTS additional_questions TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS ethnicity TEXT,
ADD COLUMN IF NOT EXISTS veteran_status TEXT,
ADD COLUMN IF NOT EXISTS disability_status TEXT;

-- Document storage table for file uploads
CREATE TABLE IF NOT EXISTS application_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('resume', 'cover_letter', 'portfolio', 'other')),
    file_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    storage_path TEXT NOT NULL, -- Supabase Storage path
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email tracking enhancements
ALTER TABLE email_submissions 
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- Application analytics table
CREATE TABLE IF NOT EXISTS application_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('view', 'start', 'submit', 'abandon')),
    page_url TEXT,
    user_agent TEXT,
    ip_address INET,
    session_id TEXT,
    time_spent_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced contact submissions with categorization
ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS contact_type TEXT CHECK (contact_type IN ('general', 'media', 'business', 'vc', 'partnership', 'support', 'feedback')),
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'either'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_application_documents_application_id ON application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_application_documents_type ON application_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_application_analytics_application_id ON application_analytics(application_id);
CREATE INDEX IF NOT EXISTS idx_application_analytics_event_type ON application_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_email_submissions_utm_source ON email_submissions(utm_source);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_type ON contact_submissions(contact_type);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_priority ON contact_submissions(priority);

-- Add triggers for the new tables
CREATE TRIGGER update_application_documents_updated_at 
    BEFORE UPDATE ON application_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enhanced views with new data
CREATE OR REPLACE VIEW enhanced_application_stats AS
SELECT
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_applications,
    COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed_applications,
    COUNT(*) FILTER (WHERE status = 'accepted') as accepted_applications,
    COUNT(*) FILTER (WHERE work_authorization = 'f1-student') as f1_applications,
    COUNT(*) FILTER (WHERE work_authorization = 'us-citizen') as citizen_applications,
    COUNT(*) FILTER (WHERE sponsorship_required = true) as sponsorship_required,
    COUNT(*) FILTER (WHERE remote_preference = 'yes') as prefer_remote,
    AVG(CASE WHEN salary_expectation ~ '^\\$?[0-9,]+' THEN 
        CAST(REGEXP_REPLACE(salary_expectation, '[^0-9]', '', 'g') AS INTEGER) 
        ELSE NULL END) as avg_salary_expectation
FROM job_applications;

CREATE OR REPLACE VIEW contact_submission_stats AS
SELECT
    COUNT(*) as total_submissions,
    COUNT(*) FILTER (WHERE contact_type = 'media') as media_inquiries,
    COUNT(*) FILTER (WHERE contact_type = 'business') as business_inquiries,
    COUNT(*) FILTER (WHERE contact_type = 'vc') as vc_inquiries,
    COUNT(*) FILTER (WHERE contact_type = 'partnership') as partnership_inquiries,
    COUNT(*) FILTER (WHERE priority = 'high') as high_priority,
    COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_priority,
    COUNT(*) FILTER (WHERE status = 'new') as unread_submissions
FROM contact_submissions;

-- Function to track application events
CREATE OR REPLACE FUNCTION track_application_event(
    p_application_id UUID,
    p_event_type TEXT,
    p_page_url TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_time_spent INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO application_analytics (
        application_id, event_type, page_url, user_agent, 
        ip_address, session_id, time_spent_seconds
    ) VALUES (
        p_application_id, p_event_type, p_page_url, p_user_agent,
        p_ip_address, p_session_id, p_time_spent
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get application completion rate
CREATE OR REPLACE FUNCTION get_application_completion_rate()
RETURNS TABLE (
    completion_rate DECIMAL,
    total_started BIGINT,
    total_completed BIGINT,
    avg_time_to_complete INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) FILTER (WHERE event_type = 'start') as started,
            COUNT(*) FILTER (WHERE event_type = 'submit') as completed,
            AVG(time_spent_seconds) FILTER (WHERE event_type = 'submit') as avg_seconds
        FROM application_analytics
    )
    SELECT 
        CASE 
            WHEN started > 0 THEN ROUND((completed::DECIMAL / started::DECIMAL) * 100, 2)
            ELSE 0::DECIMAL 
        END as completion_rate,
        started as total_started,
        completed as total_completed,
        CASE 
            WHEN avg_seconds IS NOT NULL THEN INTERVAL '1 second' * avg_seconds
            ELSE NULL 
        END as avg_time_to_complete
    FROM stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample enhanced data (optional)
INSERT INTO contact_submissions (
    first_name, last_name, email, subject, message, contact_type, priority, company
) VALUES 
(
    'Sarah', 'Chen', 'sarah@techcrunch.com', 'Media Inquiry about RoomSpot',
    'Hi, I''m writing a piece about student housing startups and would love to interview your team.',
    'media', 'normal', 'TechCrunch'
),
(
    'Michael', 'Rodriguez', 'mike@andreessen.com', 'Investment Opportunity',
    'We''re interested in learning more about RoomSpot''s growth metrics and funding plans.',
    'vc', 'high', 'Andreessen Horowitz'
) ON CONFLICT DO NOTHING;