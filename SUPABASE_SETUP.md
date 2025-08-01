# Supabase Setup Guide

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in or create an account
3. Click "New Project"
4. Choose your organization and set up your project

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

## Step 3: Set Up Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 4: Create the Database Table

In your Supabase dashboard, go to **SQL Editor** and run this query:

```sql
-- Create the prompt_sessions table
CREATE TABLE IF NOT EXISTS prompt_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  student_responses JSONB NOT NULL,
  analysis_question TEXT,
  analysis_result TEXT,
  submitted_by TEXT DEFAULT 'Anonymous',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_prompt_sessions_submitted_at 
ON prompt_sessions (submitted_at DESC);

-- Enable Row Level Security (optional, for future authentication)
ALTER TABLE prompt_sessions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read and insert (for now)
-- Note: You might want to modify this later for proper authentication
CREATE POLICY "Allow public read access" ON prompt_sessions
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON prompt_sessions
  FOR INSERT WITH CHECK (true);
```

## Step 5: Test the Setup

1. Restart your development server: `npm run dev`
2. Go to your app and create a prompt with responses
3. Click "Submit to Prompt Gallery"
4. Navigate to the gallery page to see your submitted prompt

## Optional: Configure Authentication

If you want to add user authentication later:

1. In Supabase dashboard, go to **Authentication** > **Settings**
2. Configure your auth providers (email, Google, etc.)
3. Update the RLS policies to require authentication
4. Modify the app to use Supabase Auth

## Troubleshooting

### Environment Variables Not Loading
- Make sure `.env.local` is in your project root
- Restart your development server after adding environment variables
- Check that variable names start with `NEXT_PUBLIC_`

### Database Connection Issues
- Verify your Supabase URL and key are correct
- Check that the table was created successfully in SQL Editor
- Ensure RLS policies allow the operations you're trying to perform

### No Prompts Showing in Gallery
- Check browser console for errors
- Verify the table has data by running: `SELECT * FROM prompt_sessions;`
- Make sure the Supabase client is properly configured 