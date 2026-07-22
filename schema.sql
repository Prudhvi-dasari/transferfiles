-- Supabase PostgreSQL Database Schema for TransferNow Clone
-- Copy and paste this script directly into the Supabase SQL Editor (https://supabase.com) to create all required tables.

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Transfers Table
CREATE TABLE IF NOT EXISTS public.transfers (
    hash TEXT PRIMARY KEY,
    active_tab TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    recipient_emails TEXT[] NOT NULL DEFAULT '{}',
    subject TEXT,
    message TEXT,
    password_hash TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    total_size BIGINT NOT NULL,
    downloads_count INTEGER DEFAULT 0 NOT NULL,
    uploader TEXT,
    files JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 3. Create Download Logs Table
CREATE TABLE IF NOT EXISTS public.logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    transfer_hash TEXT NOT NULL REFERENCES public.transfers(hash) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    ip TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS) policies - or disable/bypass for backend service_role key
-- Since the Node.js backend connects using the service_role key (which bypasses RLS), 
-- these tables will be fully writable and readable by the backend, but secure from direct anonymous API calls.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Add a policy allowing service_role/admin full bypass, but no public select by default (backend acts as security barrier)
CREATE POLICY "Allow full access for service_role" ON public.users FOR ALL TO service_role USING (true);
CREATE POLICY "Allow full access for service_role" ON public.transfers FOR ALL TO service_role USING (true);
CREATE POLICY "Allow full access for service_role" ON public.logs FOR ALL TO service_role USING (true);
