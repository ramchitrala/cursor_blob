-- Test Database Setup Script
-- Run this after the comprehensive-database-fix.sql to verify everything works

-- Test 1: Check if all tables exist
SELECT 'Test 1: Checking table existence' as test_name;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'job_applications', 'contact_submissions', 'email_submissions', 'job_notifications', 'application_documents', 'application_events')
ORDER BY table_name;

-- Test 2: Check RLS status (should be disabled)
SELECT 'Test 2: Checking RLS status' as test_name;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'job_applications', 'contact_submissions', 'email_submissions', 'job_notifications', 'application_documents', 'application_events')
ORDER BY tablename;

-- Test 3: Check permissions for anon role
SELECT 'Test 3: Checking anon role permissions' as test_name;
SELECT grantee, privilege_type, table_name 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee = 'anon'
ORDER BY table_name, privilege_type;

-- Test 4: Test data insertion
SELECT 'Test 4: Testing data insertion' as test_name;

-- Test users table
INSERT INTO users (email, user_type, is_beta_user, email_type) 
VALUES ('test-insert@example.com', 'test', false, 'personal') 
RETURNING id, email;

-- Test job_applications table
INSERT INTO job_applications (first_name, last_name, email, position, experience) 
VALUES ('Test', 'User', 'test-job@example.com', 'Test Position', 'Test experience') 
RETURNING id, email, position;

-- Test contact_submissions table
INSERT INTO contact_submissions (first_name, last_name, email, message, contact_type) 
VALUES ('Test', 'Contact', 'test-contact@example.com', 'Test message', 'general') 
RETURNING id, email, contact_type;

-- Test email_submissions table
INSERT INTO email_submissions (email, submission_type) 
VALUES ('test-email@example.com', 'test') 
RETURNING id, email, submission_type;

-- Test job_notifications table
INSERT INTO job_notifications (email, interests) 
VALUES ('test-notify@example.com', 'Engineering') 
RETURNING id, email, interests;

-- Test 5: Verify views work
SELECT 'Test 5: Testing views' as test_name;
SELECT 'waitlist_stats' as view_name, COUNT(*) as record_count FROM waitlist_stats
UNION ALL
SELECT 'application_stats' as view_name, COUNT(*) as record_count FROM application_stats
UNION ALL
SELECT 'enhanced_application_stats' as view_name, COUNT(*) as record_count FROM enhanced_application_stats
UNION ALL
SELECT 'contact_submission_stats' as view_name, COUNT(*) as record_count FROM contact_submission_stats;

-- Test 6: Test functions
SELECT 'Test 6: Testing functions' as test_name;
SELECT get_application_completion_rate();

-- Test 7: Clean up test data
SELECT 'Test 7: Cleaning up test data' as test_name;
DELETE FROM users WHERE email LIKE 'test-%';
DELETE FROM job_applications WHERE email LIKE 'test-%';
DELETE FROM contact_submissions WHERE email LIKE 'test-%';
DELETE FROM email_submissions WHERE email LIKE 'test-%';
DELETE FROM job_notifications WHERE email LIKE 'test-%';

-- Final verification
SELECT 'Final verification: Checking clean state' as test_name;
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'job_applications' as table_name, COUNT(*) as count FROM job_applications
UNION ALL
SELECT 'contact_submissions' as table_name, COUNT(*) as count FROM contact_submissions
UNION ALL
SELECT 'email_submissions' as table_name, COUNT(*) as count FROM email_submissions
UNION ALL
SELECT 'job_notifications' as table_name, COUNT(*) as count FROM job_notifications;

SELECT 'Database setup verification completed successfully!' as final_status; 