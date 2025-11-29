/**
 * Supabase Client Configuration
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 * See LICENSE file in the project root for full license information.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client for server-side operations
let supabase = null;
let supabaseAdmin = null;

/**
 * Initialize Supabase clients
 * @returns {boolean} Whether Supabase is configured
 */
function initSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('⚠️  Supabase not configured - running with in-memory storage');
    return false;
  }

  try {
    // Public client for client-side operations
    supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Admin client for server-side operations (if service role key is provided)
    if (supabaseServiceKey) {
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }

    console.log('✅ Supabase client initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error.message);
    return false;
  }
}

/**
 * Get the Supabase client
 * @returns {import('@supabase/supabase-js').SupabaseClient|null}
 */
function getSupabase() {
  return supabase;
}

/**
 * Get the Supabase admin client
 * @returns {import('@supabase/supabase-js').SupabaseClient|null}
 */
function getSupabaseAdmin() {
  // Only return admin client if service role key was provided
  // This ensures admin operations fail explicitly rather than silently using anon key
  return supabaseAdmin;
}

/**
 * Check if Supabase is configured
 * @returns {boolean}
 */
function isSupabaseConfigured() {
  return supabase !== null;
}

/**
 * Get Discord OAuth URL from Supabase
 * @param {string} redirectTo - The URL to redirect to after authentication
 * @returns {Promise<{url: string}|null>}
 */
async function getDiscordAuthUrl(redirectTo) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo,
        scopes: 'identify email'
      }
    });

    if (error) {
      console.error('Error getting Discord auth URL:', error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting Discord auth URL:', error.message);
    return null;
  }
}

/**
 * Exchange authorization code for session
 * @param {string} code - The authorization code from the OAuth callback
 * @returns {Promise<{session: object, user: object}|null>}
 */
async function exchangeCodeForSession(code) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error exchanging code for session:', error.message);
    return null;
  }
}

/**
 * Get user from session token
 * @param {string} accessToken - The access token
 * @returns {Promise<object|null>}
 */
async function getUserFromToken(accessToken) {
  if (!supabase) return null;

  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error) {
      console.error('Error getting user from token:', error.message);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting user from token:', error.message);
    return null;
  }
}

/**
 * Sign out user
 * @param {string} accessToken - The access token to invalidate
 * @returns {Promise<boolean>}
 */
async function signOut(accessToken) {
  if (!supabase) return true;

  try {
    // Create a new client with the user's access token
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    });

    const { error } = await userClient.auth.signOut();

    if (error) {
      console.error('Error signing out:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error signing out:', error.message);
    return false;
  }
}

// User Profile Operations

/**
 * Get user profile from database
 * @param {string} userId - The user's ID
 * @returns {Promise<object|null>}
 */
async function getUserProfile(userId) {
  const client = getSupabaseAdmin();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error getting user profile:', error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting user profile:', error.message);
    return null;
  }
}

/**
 * Create or update user profile
 * @param {string} userId - The user's ID
 * @param {object} profileData - The profile data to save
 * @returns {Promise<object|null>}
 */
async function upsertUserProfile(userId, profileData) {
  const client = getSupabaseAdmin();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting user profile:', error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error upserting user profile:', error.message);
    return null;
  }
}

/**
 * Get onboarding status for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<boolean>}
 */
async function getOnboardingStatus(userId) {
  const client = getSupabaseAdmin();
  if (!client) return false;

  try {
    const { data, error } = await client
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('user_id', userId)
      .single();

    if (error) {
      return false;
    }

    return data?.onboarding_completed || false;
  } catch (error) {
    return false;
  }
}

/**
 * Set onboarding status for a user
 * @param {string} userId - The user's ID
 * @param {boolean} completed - Whether onboarding is completed
 * @returns {Promise<boolean>}
 */
async function setOnboardingStatus(userId, completed) {
  const client = getSupabaseAdmin();
  if (!client) return false;

  try {
    const { error } = await client
      .from('user_profiles')
      .upsert({
        user_id: userId,
        onboarding_completed: completed,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error setting onboarding status:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error setting onboarding status:', error.message);
    return false;
  }
}

// Game Lobby Operations

/**
 * Save game to database for persistence
 * @param {string} gameId - The game ID
 * @param {object} gameData - The game data to save
 * @returns {Promise<object|null>}
 */
async function saveGame(gameId, gameData) {
  const client = getSupabaseAdmin();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('games')
      .upsert({
        id: gameId,
        type: gameData.type,
        creator_id: gameData.creator?.id,
        creator_username: gameData.creator?.username,
        is_private: gameData.isPrivate,
        max_players: gameData.maxPlayers,
        status: gameData.status,
        players: gameData.players || [],
        game_state: gameData.gameState || {},
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving game:', error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error saving game:', error.message);
    return null;
  }
}

/**
 * Get game from database
 * @param {string} gameId - The game ID
 * @returns {Promise<object|null>}
 */
async function getGame(gameId) {
  const client = getSupabaseAdmin();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting game:', error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting game:', error.message);
    return null;
  }
}

/**
 * Get all active games from database
 * @returns {Promise<object[]>}
 */
async function getActiveGames() {
  const client = getSupabaseAdmin();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('games')
      .select('*')
      .neq('status', 'finished')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting active games:', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting active games:', error.message);
    return [];
  }
}

/**
 * Delete game from database
 * @param {string} gameId - The game ID
 * @returns {Promise<boolean>}
 */
async function deleteGame(gameId) {
  const client = getSupabaseAdmin();
  if (!client) return false;

  try {
    const { error } = await client
      .from('games')
      .delete()
      .eq('id', gameId);

    if (error) {
      console.error('Error deleting game:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting game:', error.message);
    return false;
  }
}

/**
 * Update game status
 * @param {string} gameId - The game ID
 * @param {string} status - The new status
 * @returns {Promise<boolean>}
 */
async function updateGameStatus(gameId, status) {
  const client = getSupabaseAdmin();
  if (!client) return false;

  try {
    const { error } = await client
      .from('games')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', gameId);

    if (error) {
      console.error('Error updating game status:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating game status:', error.message);
    return false;
  }
}

module.exports = {
  initSupabase,
  getSupabase,
  getSupabaseAdmin,
  isSupabaseConfigured,
  getDiscordAuthUrl,
  exchangeCodeForSession,
  getUserFromToken,
  signOut,
  getUserProfile,
  upsertUserProfile,
  getOnboardingStatus,
  setOnboardingStatus,
  saveGame,
  getGame,
  getActiveGames,
  deleteGame,
  updateGameStatus
};
