# 🚀 RoomSpot Supabase Integration Setup Guide

## 📋 **Prerequisites**
- Supabase project: `hbodtphwaqabbtzkeixl`
- Project URL: `https://hbodtphwaqabbtzkeixl.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhib2R0cGh3YXFhYmJ0emtlaXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwOTgyNjAsImV4cCI6MjA2OTY3NDI2MH0.DtrQYFjJ6dY70U0rvhee7GF6gQnDQSimvYp9e2gVsGQ`

## 🗄️ **Step 1: Database Schema Setup**

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/hbodtphwaqabbtzkeixl
   - Navigate to SQL Editor

2. **Run Schema Script**
   - Copy and paste the contents of `supabase-schema.sql`
   - Execute the script to create all tables, indexes, and functions

3. **Run Security Script**
   - Copy and paste the contents of `supabase-security.sql`
   - Execute the script to enable RLS and create security policies

## 📦 **Step 2: Frontend Dependencies**

1. **Install Supabase Client**
   ```bash
   cd frontend
   npm install @supabase/supabase-js
   ```

2. **Verify Package.json**
   - Ensure `@supabase/supabase-js` is listed in dependencies

## 🔧 **Step 3: Configuration Files**

1. **Supabase Client** (`frontend/src/supabase.js`)
   - ✅ Already configured with your project credentials
   - ✅ Includes all utility functions for RoomSpot operations

2. **Updated JavaScript Files**
   - ✅ `frontend/src/main.js` - Updated to use Supabase for user data
   - ✅ `frontend/src/careers.js` - Updated to use Supabase for job applications
   - ✅ `frontend/src/contact.js` - Ready for Supabase integration

## 🧪 **Step 4: Testing the Integration**

1. **Test Waitlist Signup**
   - Open your website
   - Try signing up with a regular email
   - Try signing up with a .edu email
   - Check Supabase dashboard → Table Editor → `users` table

2. **Test Job Application**
   - Go to careers page
   - Submit a job application
   - Check `job_applications` table
   - Verify duplicate email prevention

3. **Test Contact Form**
   - Go to contact page
   - Submit a contact form
   - Check `contact_submissions` table

## 📊 **Step 5: Admin Dashboard Queries**

Use the queries in `supabase-queries.sql` for monitoring:

### **Quick Stats Queries:**
```sql
-- Waitlist overview
SELECT * FROM waitlist_stats;

-- Recent signups
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;

-- Job applications
SELECT * FROM job_applications ORDER BY created_at DESC LIMIT 10;
```

## 🔐 **Step 6: Security Verification**

1. **Row Level Security (RLS)**
   - ✅ Enabled on all tables
   - ✅ Public insert policies for forms
   - ✅ Service role access for admin operations

2. **API Key Security**
   - ✅ Using anon key for client-side operations
   - ✅ Service role key for admin operations only

## 🚀 **Step 7: Deployment**

1. **Build and Deploy**
   ```bash
   cd frontend
   npm run build
   # Deploy to your hosting platform
   ```

2. **Environment Variables** (if needed)
   ```env
   SUPABASE_URL=https://hbodtphwaqabbtzkeixl.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhib2R0cGh3YXFhYmJ0emtlaXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwOTgyNjAsImV4cCI6MjA2OTY3NDI2MH0.DtrQYFjJ6dY70U0rvhee7GF6gQnDQSimvYp9e2gVsGQ
   ```

## 📈 **Step 8: Monitoring & Analytics**

### **Key Metrics to Track:**
- **Waitlist Growth**: Total users, beta users, conversion rate
- **User Types**: Looking vs hosting, educational vs personal emails
- **Job Applications**: Application rate, quality metrics
- **Contact Engagement**: Response times, common subjects

### **Dashboard Queries:**
- Use queries from `supabase-queries.sql`
- Set up automated reports in Supabase dashboard
- Monitor real-time data in Table Editor

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **CORS Errors**
   - Check Supabase project settings
   - Verify allowed origins in Authentication settings

2. **RLS Policy Issues**
   - Ensure policies are correctly applied
   - Check service role permissions

3. **Duplicate Email Errors**
   - Verify `email_submissions` table exists
   - Check `check_duplicate_email` function

4. **Connection Issues**
   - Verify project URL and API keys
   - Check network connectivity

### **Debug Commands:**
```javascript
// Test Supabase connection
const { data, error } = await supabase.from('users').select('count');
console.log('Connection test:', { data, error });

// Check table structure
const { data, error } = await supabase.from('users').select('*').limit(1);
console.log('Table structure:', { data, error });
```

## 🎯 **Next Steps**

1. **Real-time Features**
   - Set up real-time subscriptions for live updates
   - Implement live waitlist counters

2. **Email Integration**
   - Connect Supabase with email service (SendGrid, etc.)
   - Set up automated email notifications

3. **Analytics Dashboard**
   - Create custom admin dashboard
   - Set up automated reporting

4. **Advanced Features**
   - User authentication
   - File uploads for job applications
   - Advanced search and filtering

## 📞 **Support**

- **Supabase Docs**: https://supabase.com/docs
- **Project Dashboard**: https://supabase.com/dashboard/project/hbodtphwaqabbtzkeixl
- **SQL Editor**: https://supabase.com/dashboard/project/hbodtphwaqabbtzkeixl/sql

---

**✅ Setup Complete!** Your RoomSpot application is now fully integrated with Supabase! 🚀 