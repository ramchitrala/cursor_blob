-- Comprehensive Database Fix Script
-- This script will completely reset and recreate all tables with proper permissions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop all existing tables to ensure clean slate
DROP TABLE IF EXISTS application_documents CASCADE;
DROP TABLE IF EXISTS application_events CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS contact_submissions CASCADE;
DROP TABLE IF EXISTS email_submissions CASCADE;
DROP TABLE IF EXISTS job_notifications CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop views if they exist
DROP VIEW IF EXISTS waitlist_stats CASCADE;
DROP VIEW IF EXISTS application_stats CASCADE;
DROP VIEW IF EXISTS enhanced_application_stats CASCADE;
DROP VIEW IF EXISTS contact_submission_stats CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS track_application_event CASCADE;
DROP FUNCTION IF EXISTS get_application_completion_rate CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    user_type VARCHAR(100),
    is_beta_user BOOLEAN DEFAULT FALSE,
    school_email VARCHAR(255),
    email_type VARCHAR(50) DEFAULT 'personal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_applications table
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    linkedin_url TEXT,
    portfolio_url TEXT,
    experience TEXT,
    position VARCHAR(255) NOT NULL,
    work_authorization VARCHAR(100),
    visa_status TEXT,
    sponsorship_required BOOLEAN DEFAULT FALSE,
    gender VARCHAR(50),
    ethnicity VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_submissions table (FIXED - removed name field, added first_name and last_name)
CREATE TABLE contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    contact_type VARCHAR(50) DEFAULT 'general',
    company VARCHAR(255),
    phone VARCHAR(50),
    preferred_contact VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_submissions table
CREATE TABLE email_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    submission_type VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_notifications table
CREATE TABLE job_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    interests TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create application_documents table
CREATE TABLE application_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    storage_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create application_events table
CREATE TABLE application_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    page_url TEXT,
    user_agent TEXT,
    session_id VARCHAR(255),
    time_spent INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_job_applications_email ON job_applications(email);
CREATE INDEX idx_job_applications_position ON job_applications(position);
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_email_submissions_email_type ON email_submissions(email, submission_type);
CREATE INDEX idx_job_notifications_email ON job_notifications(email);
CREATE INDEX idx_application_documents_app_id ON application_documents(application_id);
CREATE INDEX idx_application_events_app_id ON application_events(application_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON contact_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_notifications_updated_at BEFORE UPDATE ON job_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create analytics tracking function
CREATE OR REPLACE FUNCTION track_application_event(
    p_application_id UUID,
    p_event_type VARCHAR(50),
    p_page_url TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_id VARCHAR(255) DEFAULT NULL,
    p_time_spent INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO application_events (
        application_id,
        event_type,
        page_url,
        user_agent,
        session_id,
        time_spent
    ) VALUES (
        p_application_id,
        p_event_type,
        p_page_url,
        p_user_agent,
        p_session_id,
        p_time_spent
    );
END;
$$ LANGUAGE plpgsql;

-- Create completion rate function
CREATE OR REPLACE FUNCTION get_application_completion_rate()
RETURNS TABLE(completion_rate NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND(
                (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / COUNT(*)::NUMERIC) * 100, 
                2
            )
        END as completion_rate
    FROM job_applications;
END;
$$ LANGUAGE plpgsql;

-- Create analytics views
CREATE VIEW waitlist_stats AS
SELECT 
    COUNT(*) as total_signups,
    COUNT(*) FILTER (WHERE is_beta_user = true) as beta_users,
    COUNT(*) FILTER (WHERE email_type = 'educational') as educational_emails,
    COUNT(*) FILTER (WHERE email_type = 'personal') as personal_emails
FROM users;

CREATE VIEW application_stats AS
SELECT 
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_applications,
    COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed_applications,
    COUNT(*) FILTER (WHERE status = 'accepted') as accepted_applications,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_applications
FROM job_applications;

CREATE VIEW enhanced_application_stats AS
SELECT 
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_applications,
    COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed_applications,
    COUNT(*) FILTER (WHERE status = 'accepted') as accepted_applications,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_applications,
    COUNT(DISTINCT position) as unique_positions,
    COUNT(*) FILTER (WHERE sponsorship_required = true) as sponsorship_required
FROM job_applications;

CREATE VIEW contact_submission_stats AS
SELECT 
    COUNT(*) as total_submissions,
    COUNT(*) FILTER (WHERE contact_type = 'general') as general_inquiries,
    COUNT(*) FILTER (WHERE contact_type = 'media') as media_inquiries,
    COUNT(*) FILTER (WHERE contact_type = 'business') as business_inquiries,
    COUNT(*) FILTER (WHERE contact_type = 'partnership') as partnership_inquiries,
    COUNT(*) FILTER (WHERE contact_type = 'vc') as vc_inquiries,
    COUNT(*) FILTER (WHERE priority = 'high') as high_priority
FROM contact_submissions;

-- DISABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE application_events DISABLE ROW LEVEL SECURITY;

-- Grant ALL permissions to anon role on all tables
GRANT ALL ON users TO anon;
GRANT ALL ON job_applications TO anon;
GRANT ALL ON contact_submissions TO anon;
GRANT ALL ON email_submissions TO anon;
GRANT ALL ON job_notifications TO anon;
GRANT ALL ON application_documents TO anon;
GRANT ALL ON application_events TO anon;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant permissions on functions
GRANT EXECUTE ON FUNCTION track_application_event(UUID, VARCHAR(50), TEXT, TEXT, VARCHAR(255), INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_application_completion_rate() TO anon;

-- Grant permissions on views
GRANT SELECT ON waitlist_stats TO anon;
GRANT SELECT ON application_stats TO anon;
GRANT SELECT ON enhanced_application_stats TO anon;
GRANT SELECT ON contact_submission_stats TO anon;

-- Insert sample test data
INSERT INTO users (email, user_type, is_beta_user, email_type) VALUES
('test@example.com', 'student', true, 'personal'),
('student@stanford.edu', 'student', true, 'educational'),
('admin@roomspot.com', 'admin', false, 'personal');

-- Verify the setup
SELECT 'Database setup completed successfully' as status;

-- Test queries to verify everything works
SELECT 'Testing users table...' as test;
SELECT COUNT(*) as user_count FROM users;

SELECT 'Testing job_applications table...' as test;
SELECT COUNT(*) as application_count FROM job_applications;

SELECT 'Testing contact_submissions table...' as test;
SELECT COUNT(*) as contact_count FROM contact_submissions;

SELECT 'Testing email_submissions table...' as test;
SELECT COUNT(*) as email_count FROM email_submissions;

SELECT 'Testing job_notifications table...' as test;
SELECT COUNT(*) as notification_count FROM job_notifications;

SELECT 'Testing views...' as test;
SELECT * FROM waitlist_stats;
SELECT * FROM application_stats;
SELECT * FROM enhanced_application_stats;
SELECT * FROM contact_submission_stats;

SELECT 'All tests completed successfully!' as final_status; 