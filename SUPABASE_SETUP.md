# Supabase Database Schema

This document describes the database schema required for the Degens Against Decency application when using Supabase.

## Setting Up Supabase

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and API keys from Project Settings > API

### 2. Enable Discord OAuth Provider

1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Discord as a provider
3. Get your Discord OAuth credentials from [Discord Developer Portal](https://discord.com/developers/applications)
   - Create an application if you don't have one
   - Go to OAuth2 > General
   - Copy Client ID and Client Secret
4. Add these to Supabase:
   - Client ID: Your Discord application's Client ID
   - Client Secret: Your Discord application's Client Secret
5. Copy the Supabase callback URL and add it to your Discord application's OAuth2 Redirect URIs:
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

### 3. Configure Supabase Redirect URLs (CRITICAL)

**⚠️ This step is essential for Discord login to work correctly!**

After Discord authenticates the user, Supabase needs to redirect back to your application. You must configure the correct redirect URLs in Supabase:

1. Go to **Authentication > URL Configuration** in your Supabase dashboard
2. Set the **Site URL** to your application's base URL:
   - Local development: `http://localhost:3000`
   - Railway: `https://your-app.up.railway.app`
   - Render: `https://your-app.onrender.com`
   - Other hosting: Your application's domain
3. Add your callback URL to **Redirect URLs**:
   - Add: `{YOUR_SITE_URL}/auth/callback`
   - Example: `http://localhost:3000/auth/callback`
   - Example: `https://your-app.up.railway.app/auth/callback`

**When changing deployment platforms** (e.g., from Vercel to Railway):
1. Update the **Site URL** to your new domain
2. Update the **Redirect URLs** to include your new callback URL
3. Optionally remove old URLs that are no longer in use

**Common Issue**: If Discord login works but redirects to a wrong URL (like an old Vercel deployment), it means the Site URL or Redirect URLs in Supabase are still pointing to the old deployment. Update them to your current domain.

### 4. Create Database Tables

Run the following SQL in your Supabase SQL Editor (SQL Editor in the dashboard):

```sql
-- User Profiles Table
-- Stores user profile information and preferences
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  experience TEXT CHECK (experience IN ('newbie', 'casual', 'veteran', 'degen')),
  game_modes TEXT[],
  preferred_player_count TEXT,
  playstyle TEXT[],
  content_filter TEXT CHECK (content_filter IN ('none', 'mild', 'moderate', 'strict')),
  privacy_settings TEXT[],
  notifications TEXT[],
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games Table
-- Stores active and historical games for lobby persistence
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_username TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  max_players INTEGER DEFAULT 7 CHECK (max_players >= 3 AND max_players <= 10),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  players JSONB DEFAULT '[]'::JSONB,
  game_state JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_is_private ON games(is_private);
CREATE INDEX IF NOT EXISTS idx_games_creator_id ON games(creator_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can access all profiles (for server-side operations)
CREATE POLICY "Service role can access all profiles"
  ON user_profiles FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for games
-- Anyone can read public games
CREATE POLICY "Anyone can read public games"
  ON games FOR SELECT
  USING (NOT is_private OR auth.uid() IS NOT NULL);

-- Authenticated users can create games
CREATE POLICY "Authenticated users can create games"
  ON games FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Game creators can update their games
CREATE POLICY "Creators can update own games"
  ON games FOR UPDATE
  USING (auth.uid() = creator_id);

-- Game creators can delete their games
CREATE POLICY "Creators can delete own games"
  ON games FOR DELETE
  USING (auth.uid() = creator_id);

-- Service role can access all games (for server-side operations)
CREATE POLICY "Service role can access all games"
  ON games FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 5. Configure Environment Variables

Add the following to your `.env` file:

```
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## How It Works

### Authentication Flow

1. User clicks "Sign Up with Discord" on the landing page
2. User is redirected to Supabase's Discord OAuth flow
3. After successful authentication, Supabase creates a user in `auth.users`
4. The callback redirects the user to the onboarding or arena page
5. User session is stored in express-session and verified via Supabase

### Profile Persistence

- User profiles are stored in the `user_profiles` table
- Profiles include display name, bio, preferences, and onboarding status
- Data persists across sessions and devices

### Game Lobby Persistence

- Games can optionally be stored in the `games` table
- This allows for game state recovery if the server restarts
- Public games are visible to all users in the lobby

## Fallback Mode

If Supabase is not configured, the application falls back to:
- In-memory storage for user profiles
- passport-discord for authentication (if configured)
- Guest mode for unauthenticated users

This ensures the application works in development without Supabase setup.

## Troubleshooting

### Discord Login Redirects to Wrong URL

**Problem**: Discord login works (authentication succeeds) but redirects to a wrong URL (e.g., old Vercel deployment, deleted domain).

**Cause**: The redirect URLs in Supabase are still pointing to the old deployment.

**Solution**:
1. Go to your Supabase Dashboard
2. Navigate to **Authentication > URL Configuration**
3. Update the **Site URL** to your current application URL
4. Update **Redirect URLs** to include `{YOUR_CURRENT_URL}/auth/callback`
5. Remove any old/deleted URLs from the Redirect URLs list

### Discord Login Fails with "Invalid redirect_uri"

**Problem**: Discord shows an error about invalid redirect URI.

**Cause**: The callback URL in Discord Developer Portal doesn't match what Supabase is using.

**Solution**:
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Navigate to OAuth2 > General
4. In "Redirects", add: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
5. Save changes

### Authentication Works Locally but Not in Production

**Problem**: Discord login works on localhost but fails in production.

**Solution**:
1. Add your production URL to Supabase's **Redirect URLs**:
   - Example: `https://your-app.up.railway.app/auth/callback`
2. Make sure **Site URL** is set to your production URL
3. Verify your production environment has the correct `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### Switching Deployment Platforms

When moving from one hosting platform to another (e.g., Vercel → Railway):

1. **Update Supabase Settings**:
   - Site URL: Your new domain
   - Redirect URLs: Add new callback URL, remove old ones

2. **Update Environment Variables** in your new platform:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Update Discord Developer Portal** (if using passport-discord fallback):
   - Add new callback URL to OAuth2 Redirects
