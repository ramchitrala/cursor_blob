-- Fix Application Page Database Schema
-- Run this in your Supabase SQL Editor to add missing fields

-- Add missing F1 and EEO fields to job_applications table
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS f1_details TEXT,
ADD COLUMN IF NOT EXISTS sponsorship TEXT,
ADD COLUMN IF NOT EXISTS relocation TEXT,
ADD COLUMN IF NOT EXISTS race TEXT,
ADD COLUMN IF NOT EXISTS veteran TEXT,
ADD COLUMN IF NOT EXISTS disability TEXT;

-- Update existing columns to match our form field names
ALTER TABLE job_applications 
ALTER COLUMN ethnicity TYPE TEXT,
ALTER COLUMN veteran_status TYPE TEXT,
ALTER COLUMN disability_status TYPE TEXT;

-- Rename columns to match our form field names (only if they exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_applications' AND column_name = 'ethnicity') THEN
        ALTER TABLE job_applications RENAME COLUMN ethnicity TO race;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_applications' AND column_name = 'veteran_status') THEN
        ALTER TABLE job_applications RENAME COLUMN veteran_status TO veteran;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_applications' AND column_name = 'disability_status') THEN
        ALTER TABLE job_applications RENAME COLUMN disability_status TO disability;
    END IF;
END $$;

-- Ensure application_documents table exists with proper structure
CREATE TABLE IF NOT EXISTS application_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    storage_path TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for application documents if it doesn't exist
-- Note: This needs to be done in the Supabase Dashboard under Storage
-- Bucket name: application-documents

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_application_documents_application_id ON application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_application_documents_type ON application_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_job_applications_work_authorization ON job_applications(work_authorization);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

-- Update RLS policies to allow document uploads
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON application_documents;
CREATE POLICY "Enable insert for authenticated users only" ON application_documents
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable select for authenticated users only" ON application_documents;
CREATE POLICY "Enable select for authenticated users only" ON application_documents
    FOR SELECT USING (true);

-- Ensure RLS is enabled
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON application_documents TO anon;
GRANT ALL ON application_documents TO authenticated;

-- Add comments for clarity
COMMENT ON COLUMN job_applications.f1_details IS 'Additional details for F1 student visa holders';
COMMENT ON COLUMN job_applications.sponsorship IS 'Visa sponsorship requirement';
COMMENT ON COLUMN job_applications.relocation IS 'Relocation preference';
COMMENT ON COLUMN job_applications.race IS 'Race/ethnicity for EEO purposes';
COMMENT ON COLUMN job_applications.veteran IS 'Veteran status for EEO purposes';
COMMENT ON COLUMN job_applications.disability IS 'Disability status for EEO purposes';

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'job_applications' 
AND column_name IN ('f1_details', 'sponsorship', 'relocation', 'race', 'veteran', 'disability', 'work_authorization')
ORDER BY column_name; 