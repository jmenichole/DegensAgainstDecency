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

### 3. Create Database Tables

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

### 4. Configure Environment Variables

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
