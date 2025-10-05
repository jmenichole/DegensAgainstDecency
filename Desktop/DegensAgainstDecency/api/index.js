/**
 * GitHub Pages Serverless API - SQL Database Integration
 * Provides serverless endpoints for Discord bot with Supabase SQL database
 * 
 * Features:
 * - CORS-enabled endpoints for cross-origin requests
 * - Health checks and database connectivity monitoring  
 * - User statistics and leaderboards with SQL queries
 * - Premium purchase analytics and revenue tracking
 * - Guild subscription management
 * - Real-time game session analytics
 * 
 * Revenue Integration: Tracks $2.99 addons, $1.99 features, $1.99/month subscriptions
 * Target: $107K monthly revenue through premium monetization
 */

const DatabaseManager = require('../src/DatabaseManager');

// Initialize database connection
let dbManager;

/**
 * Initialize database manager with error handling
 */
async function initializeDatabase() {
    if (!dbManager) {
        try {
            dbManager = new DatabaseManager();
            await dbManager.initializeConnection();
            console.log('✅ Database initialized for serverless API');
        } catch (error) {
            console.error('❌ Failed to initialize database:', error);
            throw error;
        }
    }
    return dbManager;
}

/**
 * CORS headers for cross-origin requests
 */
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
};

/**
 * Handle CORS preflight requests
 */
function handleCORS(req, res) {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders);
        res.end();
        return true;
    }
    
    // Add CORS headers to all responses
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });
    
    return false;
}

/**
 * Send JSON response with error handling
 */
function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

/**
 * Main serverless function handler
 */
module.exports = async (req, res) => {
    // Handle CORS
    if (handleCORS(req, res)) return;

    try {
        // Initialize database connection
        const db = await initializeDatabase();
        
        // Parse URL and route requests
        const url = new URL(req.url, `https://${req.headers.host}`);
        const path = url.pathname;
        const method = req.method;

        console.log(`📡 API Request: ${method} ${path}`);

        // =====================================================================
        // HEALTH CHECK ENDPOINT
        // =====================================================================
        if (path === '/api/health' && method === 'GET') {
            const health = await db.healthCheck();
            const response = {
                status: 'ok',
                timestamp: new Date().toISOString(),
                database: health,
                version: '1.0.0',
                features: ['sql_integration', 'premium_monetization', 'analytics']
            };
            return sendResponse(res, 200, response);
        }

        // =====================================================================
        // USER STATISTICS ENDPOINTS
        // =====================================================================
        if (path === '/api/users/stats' && method === 'GET') {
            const userId = url.searchParams.get('user_id');
            
            if (!userId) {
                return sendResponse(res, 400, { error: 'user_id parameter required' });
            }

            const user = await db.getUser(userId);
            const purchases = await db.getUserPurchases(userId);
            
            if (!user) {
                return sendResponse(res, 404, { error: 'User not found' });
            }

            const response = {
                user: {
                    id: user.id,
                    username: user.username,
                    games_played: user.games_played,
                    games_won: user.games_won,
                    total_score: user.total_score,
                    win_rate: user.win_rate,
                    is_premium: user.is_premium,
                    premium_type: user.premium_type,
                    total_spent: user.total_spent,
                    lifetime_value: user.lifetime_value
                },
                purchases: purchases.map(p => ({
                    product_type: p.product_type,
                    product_name: p.product_name,
                    amount: p.amount,
                    purchased_at: p.purchased_at,
                    status: p.status
                }))
            };

            return sendResponse(res, 200, response);
        }

        // =====================================================================
        // LEADERBOARD ENDPOINTS
        // =====================================================================
        if (path === '/api/leaderboard' && method === 'GET') {
            const type = url.searchParams.get('type') || 'score';
            const limit = parseInt(url.searchParams.get('limit')) || 10;

            let query, params;

            switch (type) {
                case 'score':
                    query = `
                        SELECT id, username, total_score, games_played, games_won, win_rate, is_premium
                        FROM users 
                        WHERE games_played > 0
                        ORDER BY total_score DESC 
                        LIMIT ?
                    `;
                    params = [limit];
                    break;

                case 'wins':
                    query = `
                        SELECT id, username, games_won, games_played, win_rate, total_score, is_premium
                        FROM users 
                        WHERE games_won > 0
                        ORDER BY games_won DESC 
                        LIMIT ?
                    `;
                    params = [limit];
                    break;

                case 'spending':
                    query = `
                        SELECT id, username, total_spent, lifetime_value, games_played, is_premium
                        FROM users 
                        WHERE total_spent > 0
                        ORDER BY total_spent DESC 
                        LIMIT ?
                    `;
                    params = [limit];
                    break;

                default:
                    return sendResponse(res, 400, { error: 'Invalid leaderboard type' });
            }

            const leaderboard = await db.executeQuery(query, params);
            
            const response = {
                type,
                limit,
                leaderboard: leaderboard.map((user, index) => ({
                    rank: index + 1,
                    ...user
                }))
            };

            return sendResponse(res, 200, response);
        }

        // =====================================================================
        // REVENUE ANALYTICS ENDPOINTS
        // =====================================================================
        if (path === '/api/analytics/revenue' && method === 'GET') {
            const days = parseInt(url.searchParams.get('days')) || 30;
            
            const [dailyRevenue, projection, topSpenders] = await Promise.all([
                db.getDailyRevenue(days),
                db.getRevenueProjection(),
                db.getTopSpenders(5)
            ]);

            const response = {
                period_days: days,
                daily_revenue: dailyRevenue,
                projection: {
                    monthly_revenue: projection.monthly_revenue,
                    projected_annual: projection.projected_annual,
                    target_monthly: projection.target_monthly,
                    target_progress: projection.target_progress,
                    active_subscriptions: projection.active_subscriptions
                },
                top_spenders: topSpenders,
                products: {
                    two_truths_addon: { price: 2.99, description: '2 Truths and a Lie Premium' },
                    extra_redeals: { price: 1.99, description: 'Extra Card Redeals' },
                    guild_subscription: { price: 1.99, description: 'Guild Premium Monthly' }
                }
            };

            return sendResponse(res, 200, response);
        }

        // =====================================================================
        // GUILD ANALYTICS ENDPOINTS  
        // =====================================================================
        if (path === '/api/guild/analytics' && method === 'GET') {
            const guildId = url.searchParams.get('guild_id');
            
            if (!guildId) {
                return sendResponse(res, 400, { error: 'guild_id parameter required' });
            }

            const [analytics, subscription] = await Promise.all([
                db.getGuildAnalytics(guildId),
                db.getGuildSubscription(guildId)
            ]);

            const response = {
                guild_id: guildId,
                analytics: analytics[0] || {
                    total_games: 0,
                    unique_hosts: 0,
                    avg_players_per_game: 0,
                    avg_game_duration: 0,
                    total_revenue: 0
                },
                subscription: subscription ? {
                    status: subscription.status,
                    monthly_price: subscription.monthly_price,
                    expires_at: subscription.expires_at,
                    total_revenue: subscription.total_revenue
                } : null,
                is_premium: subscription && subscription.status === 'active'
            };

            return sendResponse(res, 200, response);
        }

        // =====================================================================
        // PREMIUM PURCHASE ENDPOINT
        // =====================================================================
        if (path === '/api/purchase' && method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                try {
                    const purchaseData = JSON.parse(body);
                    
                    const {
                        user_id,
                        transaction_id,
                        product_type,
                        amount
                    } = purchaseData;

                    if (!user_id || !transaction_id || !product_type || !amount) {
                        return sendResponse(res, 400, { 
                            error: 'Missing required fields: user_id, transaction_id, product_type, amount' 
                        });
                    }

                    // Product catalog
                    const products = {
                        two_truths_addon: { name: '2 Truths and a Lie Addon', price: 2.99 },
                        extra_redeals: { name: 'Extra Redeals Pack', price: 1.99 },
                        guild_subscription: { name: 'Guild Premium Monthly', price: 1.99 }
                    };

                    const product = products[product_type];
                    if (!product) {
                        return sendResponse(res, 400, { error: 'Invalid product type' });
                    }

                    // Calculate expiration for subscriptions
                    let expires_at = null;
                    if (product_type === 'guild_subscription') {
                        const now = new Date();
                        expires_at = new Date(now.setMonth(now.getMonth() + 1));
                    }

                    // Record purchase
                    await db.recordPurchase({
                        user_id,
                        transaction_id,
                        product_type,
                        product_name: product.name,
                        amount: parseFloat(amount),
                        status: 'completed',
                        expires_at,
                        uses_remaining: product_type === 'extra_redeals' ? 5 : null
                    });

                    const response = {
                        success: true,
                        message: 'Purchase recorded successfully',
                        product: {
                            type: product_type,
                            name: product.name,
                            amount: parseFloat(amount)
                        },
                        expires_at
                    };

                    return sendResponse(res, 201, response);

                } catch (error) {
                    console.error('Purchase processing error:', error);
                    return sendResponse(res, 500, { error: 'Failed to process purchase' });
                }
            });

            return; // Prevent further execution
        }

        // =====================================================================
        // GAME SESSION ENDPOINTS
        // =====================================================================
        if (path === '/api/game/start' && method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                try {
                    const gameData = JSON.parse(body);
                    
                    const sessionId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    
                    await db.startGameSession({
                        session_id: sessionId,
                        game_type: gameData.game_type || 'cards_against_humanity',
                        guild_id: gameData.guild_id,
                        channel_id: gameData.channel_id,
                        host_user_id: gameData.host_user_id,
                        participants: gameData.participants || [],
                        total_players: gameData.participants ? gameData.participants.length : 1
                    });

                    const response = {
                        success: true,
                        session_id: sessionId,
                        message: 'Game session started'
                    };

                    return sendResponse(res, 201, response);

                } catch (error) {
                    console.error('Game start error:', error);
                    return sendResponse(res, 500, { error: 'Failed to start game session' });
                }
            });

            return; // Prevent further execution
        }

        // =====================================================================
        // 404 - ENDPOINT NOT FOUND
        // =====================================================================
        return sendResponse(res, 404, { 
            error: 'Endpoint not found',
            available_endpoints: [
                'GET /api/health',
                'GET /api/users/stats?user_id={id}',
                'GET /api/leaderboard?type={score|wins|spending}&limit={number}',
                'GET /api/analytics/revenue?days={number}',
                'GET /api/guild/analytics?guild_id={id}',
                'POST /api/purchase',
                'POST /api/game/start'
            ]
        });

    } catch (error) {
        console.error('API Error:', error);
        
        return sendResponse(res, 500, {
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Export for serverless deployment
module.exports.handler = module.exports;