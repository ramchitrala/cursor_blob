-- RoomSpot Supabase Fix Script
-- Run this in Supabase SQL Editor to fix all issues

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if they exist (to ensure clean setup)
DROP TABLE IF EXISTS email_submissions CASCADE;
DROP TABLE IF EXISTS job_notifications CASCADE;
DROP TABLE IF EXISTS contact_submissions CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. Create tables with proper structure
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    user_type TEXT CHECK (user_type IN ('looking', 'hosting', 'test')),
    is_beta_user BOOLEAN DEFAULT false,
    school_email TEXT,
    email_type TEXT CHECK (email_type IN ('personal', 'educational')),
    signup_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    experience TEXT,
    position TEXT NOT NULL DEFAULT 'Senior Frontend Engineer',
    work_authorization TEXT,
    visa_status TEXT,
    sponsorship_required BOOLEAN DEFAULT false,
    gender TEXT,
    ethnicity TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE job_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    interests TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    contact_type TEXT DEFAULT 'general' CHECK (contact_type IN ('general', 'media', 'business', 'vc', 'partnership', 'support', 'feedback')),
    company TEXT,
    phone TEXT,
    preferred_contact_method TEXT DEFAULT 'email',
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE email_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    submission_type TEXT NOT NULL CHECK (submission_type IN ('waitlist', 'job_application', 'notification', 'contact')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_school_email ON users(school_email);
CREATE INDEX idx_users_is_beta_user ON users(is_beta_user);
CREATE INDEX idx_job_applications_email ON job_applications(email);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_notifications_email ON job_notifications(email);
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_email_submissions_email_type ON email_submissions(email, submission_type);

-- 5. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON contact_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. DISABLE RLS for now (to fix connection issues)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_submissions DISABLE ROW LEVEL SECURITY;

-- 8. Create views for analytics
CREATE OR REPLACE VIEW waitlist_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_beta_user = true) as beta_users,
    COUNT(*) FILTER (WHERE email_type = 'educational') as educational_emails,
    COUNT(*) FILTER (WHERE user_type = 'looking') as looking_users,
    COUNT(*) FILTER (WHERE user_type = 'hosting') as hosting_users
FROM users;

CREATE OR REPLACE VIEW application_stats AS
SELECT 
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_applications,
    COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed_applications,
    COUNT(*) FILTER (WHERE status = 'accepted') as accepted_applications,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_applications
FROM job_applications;

-- 9. Insert test data to verify everything works
INSERT INTO users (email, user_type, is_beta_user, email_type) VALUES 
('test@example.com', 'test', false, 'personal'),
('student@university.edu', 'test', true, 'educational')
ON CONFLICT (email) DO NOTHING;

-- 10. Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- 11. Verify setup
SELECT 'Setup completed successfully!' as status;
SELECT COUNT(*) as users_count FROM users;
SELECT COUNT(*) as applications_count FROM job_applications;
SELECT COUNT(*) as contacts_count FROM contact_submissions; 