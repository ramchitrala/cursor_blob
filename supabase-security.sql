-- RoomSpot Security Policies
-- Row Level Security (RLS) setup for Supabase

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_submissions ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Allow anyone to insert (for waitlist signups)
CREATE POLICY "Allow public insert on users" ON users
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own data (if authenticated)
CREATE POLICY "Allow users to view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Allow service role full access
CREATE POLICY "Allow service role full access on users" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- Job applications policies
-- Allow anyone to insert (for job applications)
CREATE POLICY "Allow public insert on job_applications" ON job_applications
    FOR INSERT WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access on job_applications" ON job_applications
    FOR ALL USING (auth.role() = 'service_role');

-- Job notifications policies
-- Allow anyone to insert (for notifications signup)
CREATE POLICY "Allow public insert on job_notifications" ON job_notifications
    FOR INSERT WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access on job_notifications" ON job_notifications
    FOR ALL USING (auth.role() = 'service_role');

-- Contact submissions policies
-- Allow anyone to insert (for contact form)
CREATE POLICY "Allow public insert on contact_submissions" ON contact_submissions
    FOR INSERT WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access on contact_submissions" ON contact_submissions
    FOR ALL USING (auth.role() = 'service_role');

-- Email submissions policies
-- Allow anyone to insert (for duplicate checking)
CREATE POLICY "Allow public insert on email_submissions" ON email_submissions
    FOR INSERT WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access on email_submissions" ON email_submissions
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to check for duplicate emails
CREATE OR REPLACE FUNCTION check_duplicate_email(
    p_email TEXT,
    p_submission_type TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM email_submissions 
        WHERE email = p_email 
        AND submission_type = p_submission_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get waitlist statistics
CREATE OR REPLACE FUNCTION get_waitlist_stats()
RETURNS TABLE (
    total_users BIGINT,
    beta_users BIGINT,
    educational_emails BIGINT,
    looking_for_rooms BIGINT,
    hosting_rooms BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_users,
        COUNT(*) FILTER (WHERE is_beta_user = true)::BIGINT as beta_users,
        COUNT(*) FILTER (WHERE email_type = 'educational')::BIGINT as educational_emails,
        COUNT(*) FILTER (WHERE user_type = 'looking')::BIGINT as looking_for_rooms,
        COUNT(*) FILTER (WHERE user_type = 'hosting')::BIGINT as hosting_rooms
    FROM users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get application statistics
CREATE OR REPLACE FUNCTION get_application_stats()
RETURNS TABLE (
    total_applications BIGINT,
    pending_applications BIGINT,
    reviewed_applications BIGINT,
    accepted_applications BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_applications,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_applications,
        COUNT(*) FILTER (WHERE status = 'reviewed')::BIGINT as reviewed_applications,
        COUNT(*) FILTER (WHERE status = 'accepted')::BIGINT as accepted_applications
    FROM job_applications;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 