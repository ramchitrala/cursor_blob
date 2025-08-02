-- RoomSpot Admin Dashboard Queries
-- Useful queries for monitoring and analytics

-- 1. Waitlist Overview
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_beta_user = true) as beta_users,
    COUNT(*) FILTER (WHERE email_type = 'educational') as educational_emails,
    COUNT(*) FILTER (WHERE user_type = 'looking') as looking_for_rooms,
    COUNT(*) FILTER (WHERE user_type = 'hosting') as hosting_rooms,
    ROUND(
        (COUNT(*) FILTER (WHERE is_beta_user = true)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2
    ) as beta_conversion_rate
FROM users;

-- 2. Recent Signups (Last 7 days)
SELECT 
    email,
    user_type,
    is_beta_user,
    email_type,
    created_at,
    CASE 
        WHEN email_type = 'educational' THEN '🎓 Student'
        ELSE '👤 General'
    END as user_category
FROM users 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- 3. Job Applications Overview
SELECT 
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed,
    COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'accepted')::DECIMAL / COUNT(*)::DECIMAL) * 100, 2
    ) as acceptance_rate
FROM job_applications;

-- 4. Recent Job Applications
SELECT 
    first_name,
    last_name,
    email,
    position,
    status,
    created_at,
    CASE 
        WHEN linkedin_url IS NOT NULL THEN '✅'
        ELSE '❌'
    END as has_linkedin,
    CASE 
        WHEN portfolio_url IS NOT NULL THEN '✅'
        ELSE '❌'
    END as has_portfolio
FROM job_applications 
ORDER BY created_at DESC 
LIMIT 20;

-- 5. Contact Form Submissions
SELECT 
    first_name,
    last_name,
    email,
    subject,
    status,
    created_at,
    LENGTH(message) as message_length
FROM contact_submissions 
ORDER BY created_at DESC 
LIMIT 20;

-- 6. Email Submission Analytics
SELECT 
    submission_type,
    COUNT(*) as total_submissions,
    COUNT(DISTINCT email) as unique_emails,
    DATE_TRUNC('day', created_at) as submission_date
FROM email_submissions 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY submission_type, DATE_TRUNC('day', created_at)
ORDER BY submission_date DESC, submission_type;

-- 7. Top Email Domains
SELECT 
    SPLIT_PART(email, '@', 2) as domain,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE email_type = 'educational') as educational_count
FROM users 
GROUP BY SPLIT_PART(email, '@', 2)
ORDER BY count DESC 
LIMIT 10;

-- 8. Daily Signup Trends
SELECT 
    DATE_TRUNC('day', created_at) as signup_date,
    COUNT(*) as new_users,
    COUNT(*) FILTER (WHERE is_beta_user = true) as beta_users,
    COUNT(*) FILTER (WHERE email_type = 'educational') as educational_emails
FROM users 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY signup_date DESC;

-- 9. User Engagement by Type
SELECT 
    user_type,
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_beta_user = true) as beta_users,
    ROUND(
        (COUNT(*) FILTER (WHERE is_beta_user = true)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2
    ) as beta_rate
FROM users 
GROUP BY user_type;

-- 10. Job Notification Interests
SELECT 
    interests,
    COUNT(*) as subscribers,
    COUNT(*) FILTER (WHERE is_active = true) as active_subscribers
FROM job_notifications 
GROUP BY interests
ORDER BY subscribers DESC;

-- 11. Contact Form Subject Analysis
SELECT 
    subject,
    COUNT(*) as submissions,
    COUNT(*) FILTER (WHERE status = 'new') as new_submissions,
    COUNT(*) FILTER (WHERE status = 'replied') as replied_submissions
FROM contact_submissions 
GROUP BY subject
ORDER BY submissions DESC;

-- 12. System Health Check
SELECT 
    'users' as table_name,
    COUNT(*) as record_count,
    MAX(created_at) as latest_record
FROM users
UNION ALL
SELECT 
    'job_applications' as table_name,
    COUNT(*) as record_count,
    MAX(created_at) as latest_record
FROM job_applications
UNION ALL
SELECT 
    'contact_submissions' as table_name,
    COUNT(*) as record_count,
    MAX(created_at) as latest_record
FROM contact_submissions
UNION ALL
SELECT 
    'job_notifications' as table_name,
    COUNT(*) as record_count,
    MAX(created_at) as latest_record
FROM job_notifications;

-- 13. Duplicate Email Analysis
SELECT 
    email,
    COUNT(*) as submission_count,
    STRING_AGG(submission_type, ', ' ORDER BY submission_type) as submission_types,
    MIN(created_at) as first_submission,
    MAX(created_at) as last_submission
FROM email_submissions 
GROUP BY email 
HAVING COUNT(*) > 1
ORDER BY submission_count DESC;

-- 14. Performance Metrics
SELECT 
    'Average Response Time' as metric,
    ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))), 2) as value_seconds
FROM contact_submissions 
WHERE status IN ('replied', 'closed')
UNION ALL
SELECT 
    'Beta Conversion Rate' as metric,
    ROUND(
        (COUNT(*) FILTER (WHERE is_beta_user = true)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2
    ) as value_percentage
FROM users; 