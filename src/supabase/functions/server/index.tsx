import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase clients
const getSupabaseAdmin = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const getSupabaseClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Middleware to verify authentication
async function verifyAuth(request: Request): Promise<{ userId: string; error?: string }> {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { userId: '', error: 'No authorization token provided' };
  }

  const supabase = getSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return { userId: '', error: 'Invalid or expired token' };
  }

  return { userId: user.id };
}

// Health check endpoint
app.get("/make-server-8d3deb66/health", (c) => {
  return c.json({ status: "ok" });
});

// ============================================
// AUTH ROUTES
// ============================================

// Sign up
app.post("/make-server-8d3deb66/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, role = 'user' } = body;

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store user data in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      teamId: null,
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      user: {
        id: data.user.id,
        email,
        name,
        role
      },
      message: 'User created successfully'
    });
  } catch (error) {
    console.log(`Error in signup route: ${error}`);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Get current user
app.get("/make-server-8d3deb66/auth/user", async (c) => {
  try {
    const { userId, error } = await verifyAuth(c.req.raw);
    if (error) {
      return c.json({ error }, 401);
    }

    const user = await kv.get(`user:${userId}`);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user });
  } catch (error) {
    console.log(`Error fetching user: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// TEAMS ROUTES
// ============================================

app.get("/make-server-8d3deb66/teams", async (c) => {
  try {
    const teams = await kv.getByPrefix('team:');
    return c.json({ teams: teams || [] });
  } catch (error) {
    console.log(`Error fetching teams: ${error}`);
    return c.json({ error: 'Failed to fetch teams' }, 500);
  }
});

app.post("/make-server-8d3deb66/teams", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const body = await c.req.json();
    const { name, logo, ownerName, contact, budget } = body;

    const teamId = crypto.randomUUID();
    const team = {
      id: teamId,
      name,
      logo,
      ownerName,
      contact,
      budget: budget || 10000,
      spent: 0,
      players: [],
      active: true,
      createdAt: new Date().toISOString()
    };

    await kv.set(`team:${teamId}`, team);
    return c.json({ team, message: 'Team created successfully' });
  } catch (error) {
    console.log(`Error creating team: ${error}`);
    return c.json({ error: 'Failed to create team' }, 500);
  }
});

app.put("/make-server-8d3deb66/teams/:id", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const teamId = c.req.param('id');
    const body = await c.req.json();

    const existingTeam = await kv.get(`team:${teamId}`);
    if (!existingTeam) {
      return c.json({ error: 'Team not found' }, 404);
    }

    const updatedTeam = { ...existingTeam, ...body, id: teamId };
    await kv.set(`team:${teamId}`, updatedTeam);

    return c.json({ team: updatedTeam, message: 'Team updated successfully' });
  } catch (error) {
    console.log(`Error updating team: ${error}`);
    return c.json({ error: 'Failed to update team' }, 500);
  }
});

app.delete("/make-server-8d3deb66/teams/:id", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const teamId = c.req.param('id');
    await kv.del(`team:${teamId}`);

    return c.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.log(`Error deleting team: ${error}`);
    return c.json({ error: 'Failed to delete team' }, 500);
  }
});

// ============================================
// GAMES ROUTES
// ============================================

app.get("/make-server-8d3deb66/games", async (c) => {
  try {
    const games = await kv.getByPrefix('game:');
    return c.json({ games: games || [] });
  } catch (error) {
    console.log(`Error fetching games: ${error}`);
    return c.json({ error: 'Failed to fetch games' }, 500);
  }
});

app.post("/make-server-8d3deb66/games", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const body = await c.req.json();
    const { name, type, gender, maxPlayers, scoringMethod } = body;

    const gameId = crypto.randomUUID();
    const game = {
      id: gameId,
      name,
      type,
      gender,
      maxPlayers,
      scoringMethod,
      createdAt: new Date().toISOString()
    };

    await kv.set(`game:${gameId}`, game);
    return c.json({ game, message: 'Game created successfully' });
  } catch (error) {
    console.log(`Error creating game: ${error}`);
    return c.json({ error: 'Failed to create game' }, 500);
  }
});

app.delete("/make-server-8d3deb66/games/:id", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const gameId = c.req.param('id');
    await kv.del(`game:${gameId}`);

    return c.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.log(`Error deleting game: ${error}`);
    return c.json({ error: 'Failed to delete game' }, 500);
  }
});

// ============================================
// PLAYERS ROUTES
// ============================================

app.get("/make-server-8d3deb66/players", async (c) => {
  try {
    const players = await kv.getByPrefix('player:');
    return c.json({ players: players || [] });
  } catch (error) {
    console.log(`Error fetching players: ${error}`);
    return c.json({ error: 'Failed to fetch players' }, 500);
  }
});

app.post("/make-server-8d3deb66/players", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const body = await c.req.json();
    const { husbandName, wifeName, age, games, skillRating, basePrice, playingPreference } = body;

    const playerId = crypto.randomUUID();
    const player = {
      id: playerId,
      husbandName,
      wifeName,
      age,
      games: games || [],
      skillRating,
      basePrice,
      playingPreference,
      teamId: null,
      soldPrice: null,
      createdAt: new Date().toISOString()
    };

    await kv.set(`player:${playerId}`, player);
    return c.json({ player, message: 'Player created successfully' });
  } catch (error) {
    console.log(`Error creating player: ${error}`);
    return c.json({ error: 'Failed to create player' }, 500);
  }
});

// Bulk import players from CSV
app.post("/make-server-8d3deb66/players/bulk-import", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const body = await c.req.json();
    const { players } = body;

    if (!Array.isArray(players) || players.length === 0) {
      return c.json({ error: 'Invalid players array' }, 400);
    }

    const createdPlayers = [];
    for (const playerData of players) {
      const playerId = crypto.randomUUID();
      const player = {
        id: playerId,
        husbandName: playerData.husbandName,
        wifeName: playerData.wifeName,
        age: parseInt(playerData.age) || 25,
        games: playerData.games || [],
        skillRating: parseInt(playerData.skillRating) || 5,
        basePrice: parseInt(playerData.basePrice) || 500,
        playingPreference: playerData.playingPreference || 'both',
        teamId: null,
        soldPrice: null,
        createdAt: new Date().toISOString()
      };

      await kv.set(`player:${playerId}`, player);
      createdPlayers.push(player);
    }

    return c.json({ 
      players: createdPlayers, 
      count: createdPlayers.length,
      message: `Successfully imported ${createdPlayers.length} players` 
    });
  } catch (error) {
    console.log(`Error importing players: ${error}`);
    return c.json({ error: 'Failed to import players' }, 500);
  }
});

app.put("/make-server-8d3deb66/players/:id", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const playerId = c.req.param('id');
    const body = await c.req.json();

    const existingPlayer = await kv.get(`player:${playerId}`);
    if (!existingPlayer) {
      return c.json({ error: 'Player not found' }, 404);
    }

    const updatedPlayer = { ...existingPlayer, ...body, id: playerId };
    await kv.set(`player:${playerId}`, updatedPlayer);

    return c.json({ player: updatedPlayer, message: 'Player updated successfully' });
  } catch (error) {
    console.log(`Error updating player: ${error}`);
    return c.json({ error: 'Failed to update player' }, 500);
  }
});

app.delete("/make-server-8d3deb66/players/:id", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const playerId = c.req.param('id');
    await kv.del(`player:${playerId}`);

    return c.json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.log(`Error deleting player: ${error}`);
    return c.json({ error: 'Failed to delete player' }, 500);
  }
});

// ============================================
// MATCHES/FIXTURES ROUTES
// ============================================

app.get("/make-server-8d3deb66/matches", async (c) => {
  try {
    const matches = await kv.getByPrefix('match:');
    return c.json({ matches: matches || [] });
  } catch (error) {
    console.log(`Error fetching matches: ${error}`);
    return c.json({ error: 'Failed to fetch matches' }, 500);
  }
});

app.post("/make-server-8d3deb66/matches", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const body = await c.req.json();
    const { gameId, team1Id, team2Id, date, time, venue } = body;

    const matchId = crypto.randomUUID();
    const match = {
      id: matchId,
      gameId,
      team1Id,
      team2Id,
      date,
      time,
      venue,
      status: 'scheduled',
      team1Score: null,
      team2Score: null,
      winnerId: null,
      bestPlayer: null,
      createdAt: new Date().toISOString()
    };

    await kv.set(`match:${matchId}`, match);
    return c.json({ match, message: 'Match created successfully' });
  } catch (error) {
    console.log(`Error creating match: ${error}`);
    return c.json({ error: 'Failed to create match' }, 500);
  }
});

app.put("/make-server-8d3deb66/matches/:id", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const matchId = c.req.param('id');
    const body = await c.req.json();

    const existingMatch = await kv.get(`match:${matchId}`);
    if (!existingMatch) {
      return c.json({ error: 'Match not found' }, 404);
    }

    const updatedMatch = { ...existingMatch, ...body, id: matchId };
    await kv.set(`match:${matchId}`, updatedMatch);

    return c.json({ match: updatedMatch, message: 'Match updated successfully' });
  } catch (error) {
    console.log(`Error updating match: ${error}`);
    return c.json({ error: 'Failed to update match' }, 500);
  }
});

app.delete("/make-server-8d3deb66/matches/:id", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const matchId = c.req.param('id');
    await kv.del(`match:${matchId}`);

    return c.json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.log(`Error deleting match: ${error}`);
    return c.json({ error: 'Failed to delete match' }, 500);
  }
});

// ============================================
// AUCTION ROUTES
// ============================================

// Get auction status
app.get("/make-server-8d3deb66/auction/status", async (c) => {
  try {
    const auctionStatus = await kv.get('auction:status');
    const currentPlayer = await kv.get('auction:currentPlayer');
    const currentBids = await kv.get('auction:currentBids') || [];

    return c.json({ 
      active: auctionStatus?.active || false,
      currentPlayer: currentPlayer || null,
      currentBids: currentBids
    });
  } catch (error) {
    console.log(`Error fetching auction status: ${error}`);
    return c.json({ error: 'Failed to fetch auction status' }, 500);
  }
});

// Start auction
app.post("/make-server-8d3deb66/auction/start", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const body = await c.req.json();
    const { playerId } = body;

    const player = await kv.get(`player:${playerId}`);
    if (!player) {
      return c.json({ error: 'Player not found' }, 404);
    }

    if (player.teamId) {
      return c.json({ error: 'Player already sold' }, 400);
    }

    await kv.set('auction:status', { active: true, startedAt: new Date().toISOString() });
    await kv.set('auction:currentPlayer', player);
    await kv.set('auction:currentBids', []);

    return c.json({ 
      message: 'Auction started',
      player
    });
  } catch (error) {
    console.log(`Error starting auction: ${error}`);
    return c.json({ error: 'Failed to start auction' }, 500);
  }
});

// Place bid
app.post("/make-server-8d3deb66/auction/bid", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const body = await c.req.json();
    const { teamId, amount } = body;

    const auctionStatus = await kv.get('auction:status');
    if (!auctionStatus?.active) {
      return c.json({ error: 'No active auction' }, 400);
    }

    const currentPlayer = await kv.get('auction:currentPlayer');
    if (!currentPlayer) {
      return c.json({ error: 'No player in auction' }, 400);
    }

    const team = await kv.get(`team:${teamId}`);
    if (!team) {
      return c.json({ error: 'Team not found' }, 404);
    }

    const availableBudget = team.budget - team.spent;
    if (amount > availableBudget) {
      return c.json({ error: 'Insufficient budget' }, 400);
    }

    const currentBids = await kv.get('auction:currentBids') || [];
    const highestBid = currentBids.length > 0 ? Math.max(...currentBids.map((b: any) => b.amount)) : currentPlayer.basePrice;

    if (amount <= highestBid) {
      return c.json({ error: `Bid must be higher than current highest bid of ${highestBid}` }, 400);
    }

    const newBid = {
      id: crypto.randomUUID(),
      teamId,
      teamName: team.name,
      amount,
      timestamp: new Date().toISOString()
    };

    currentBids.push(newBid);
    await kv.set('auction:currentBids', currentBids);

    return c.json({ 
      message: 'Bid placed successfully',
      bid: newBid,
      allBids: currentBids
    });
  } catch (error) {
    console.log(`Error placing bid: ${error}`);
    return c.json({ error: 'Failed to place bid' }, 500);
  }
});

// Finalize auction (sell player)
app.post("/make-server-8d3deb66/auction/finalize", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const auctionStatus = await kv.get('auction:status');
    if (!auctionStatus?.active) {
      return c.json({ error: 'No active auction' }, 400);
    }

    const currentPlayer = await kv.get('auction:currentPlayer');
    const currentBids = await kv.get('auction:currentBids') || [];

    if (!currentPlayer) {
      return c.json({ error: 'No player in auction' }, 400);
    }

    if (currentBids.length === 0) {
      // No bids - player unsold
      await kv.set('auction:status', { active: false });
      await kv.set('auction:currentPlayer', null);
      await kv.set('auction:currentBids', []);
      return c.json({ message: 'Player unsold - no bids received' });
    }

    // Find highest bid
    const highestBid = currentBids.reduce((max: any, bid: any) => 
      bid.amount > max.amount ? bid : max
    , currentBids[0]);

    // Update player
    currentPlayer.teamId = highestBid.teamId;
    currentPlayer.soldPrice = highestBid.amount;
    await kv.set(`player:${currentPlayer.id}`, currentPlayer);

    // Update team
    const team = await kv.get(`team:${highestBid.teamId}`);
    team.spent += highestBid.amount;
    team.players.push(currentPlayer.id);
    await kv.set(`team:${highestBid.teamId}`, team);

    // Clear auction
    await kv.set('auction:status', { active: false });
    await kv.set('auction:currentPlayer', null);
    await kv.set('auction:currentBids', []);

    return c.json({ 
      message: 'Player sold successfully',
      player: currentPlayer,
      winningBid: highestBid
    });
  } catch (error) {
    console.log(`Error finalizing auction: ${error}`);
    return c.json({ error: 'Failed to finalize auction' }, 500);
  }
});

// Stop auction without sale
app.post("/make-server-8d3deb66/auction/stop", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    await kv.set('auction:status', { active: false });
    await kv.set('auction:currentPlayer', null);
    await kv.set('auction:currentBids', []);

    return c.json({ message: 'Auction stopped' });
  } catch (error) {
    console.log(`Error stopping auction: ${error}`);
    return c.json({ error: 'Failed to stop auction' }, 500);
  }
});

// ============================================
// PREDICTIONS ROUTES
// ============================================

app.get("/make-server-8d3deb66/predictions", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const predictions = await kv.getByPrefix('prediction:');
    const userPredictions = predictions?.filter((p: any) => p.userId === userId) || [];

    return c.json({ predictions: userPredictions });
  } catch (error) {
    console.log(`Error fetching predictions: ${error}`);
    return c.json({ error: 'Failed to fetch predictions' }, 500);
  }
});

app.post("/make-server-8d3deb66/predictions", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const body = await c.req.json();
    const { matchId, predictedWinnerId, predictedScore } = body;

    const predictionId = crypto.randomUUID();
    const prediction = {
      id: predictionId,
      userId,
      matchId,
      predictedWinnerId,
      predictedScore,
      points: 0,
      locked: false,
      createdAt: new Date().toISOString()
    };

    await kv.set(`prediction:${predictionId}`, prediction);
    return c.json({ prediction, message: 'Prediction saved successfully' });
  } catch (error) {
    console.log(`Error creating prediction: ${error}`);
    return c.json({ error: 'Failed to create prediction' }, 500);
  }
});

// ============================================
// FANTASY TEAMS ROUTES
// ============================================

app.get("/make-server-8d3deb66/fantasy-teams", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const fantasyTeams = await kv.getByPrefix('fantasy:');
    const userTeams = fantasyTeams?.filter((t: any) => t.userId === userId) || [];

    return c.json({ fantasyTeams: userTeams });
  } catch (error) {
    console.log(`Error fetching fantasy teams: ${error}`);
    return c.json({ error: 'Failed to fetch fantasy teams' }, 500);
  }
});

app.post("/make-server-8d3deb66/fantasy-teams", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const body = await c.req.json();
    const { gameId, name, players, captain, viceCaptain } = body;

    const fantasyId = crypto.randomUUID();
    const fantasyTeam = {
      id: fantasyId,
      userId,
      gameId,
      name,
      players: players || [],
      captain,
      viceCaptain,
      points: 0,
      createdAt: new Date().toISOString()
    };

    await kv.set(`fantasy:${fantasyId}`, fantasyTeam);
    return c.json({ fantasyTeam, message: 'Fantasy team created successfully' });
  } catch (error) {
    console.log(`Error creating fantasy team: ${error}`);
    return c.json({ error: 'Failed to create fantasy team' }, 500);
  }
});

app.put("/make-server-8d3deb66/fantasy-teams/:id", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const fantasyId = c.req.param('id');
    const body = await c.req.json();

    const existingTeam = await kv.get(`fantasy:${fantasyId}`);
    if (!existingTeam) {
      return c.json({ error: 'Fantasy team not found' }, 404);
    }

    if (existingTeam.userId !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const updatedTeam = { ...existingTeam, ...body, id: fantasyId, userId };
    await kv.set(`fantasy:${fantasyId}`, updatedTeam);

    return c.json({ fantasyTeam: updatedTeam, message: 'Fantasy team updated successfully' });
  } catch (error) {
    console.log(`Error updating fantasy team: ${error}`);
    return c.json({ error: 'Failed to update fantasy team' }, 500);
  }
});

// ============================================
// LEADERBOARD ROUTES
// ============================================

app.get("/make-server-8d3deb66/leaderboard/predictions", async (c) => {
  try {
    const predictions = await kv.getByPrefix('prediction:');
    const users = await kv.getByPrefix('user:');

    // Calculate user scores
    const userScores = new Map();
    predictions?.forEach((pred: any) => {
      const current = userScores.get(pred.userId) || 0;
      userScores.set(pred.userId, current + pred.points);
    });

    // Build leaderboard
    const leaderboard = Array.from(userScores.entries()).map(([userId, points]) => {
      const user = users?.find((u: any) => u.id === userId);
      return {
        userId,
        userName: user?.name || 'Unknown',
        points,
        rank: 0
      };
    }).sort((a, b) => b.points - a.points);

    // Assign ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return c.json({ leaderboard });
  } catch (error) {
    console.log(`Error fetching prediction leaderboard: ${error}`);
    return c.json({ error: 'Failed to fetch leaderboard' }, 500);
  }
});

app.get("/make-server-8d3deb66/leaderboard/fantasy", async (c) => {
  try {
    const fantasyTeams = await kv.getByPrefix('fantasy:');
    const users = await kv.getByPrefix('user:');

    // Build leaderboard
    const leaderboard = fantasyTeams?.map((team: any) => {
      const user = users?.find((u: any) => u.id === team.userId);
      return {
        teamId: team.id,
        teamName: team.name,
        userId: team.userId,
        userName: user?.name || 'Unknown',
        points: team.points,
        rank: 0
      };
    }).sort((a: any, b: any) => b.points - a.points) || [];

    // Assign ranks
    leaderboard.forEach((entry: any, index: number) => {
      entry.rank = index + 1;
    });

    return c.json({ leaderboard });
  } catch (error) {
    console.log(`Error fetching fantasy leaderboard: ${error}`);
    return c.json({ error: 'Failed to fetch leaderboard' }, 500);
  }
});

app.get("/make-server-8d3deb66/leaderboard/teams", async (c) => {
  try {
    const teams = await kv.getByPrefix('team:');
    const matches = await kv.getByPrefix('match:');

    // Calculate team statistics
    const teamStats = teams?.map((team: any) => {
      const teamMatches = matches?.filter((m: any) => 
        m.team1Id === team.id || m.team2Id === team.id
      ) || [];

      const wins = teamMatches.filter((m: any) => m.winnerId === team.id).length;
      const losses = teamMatches.filter((m: any) => 
        m.winnerId && m.winnerId !== team.id && m.status === 'completed'
      ).length;

      return {
        teamId: team.id,
        teamName: team.name,
        logo: team.logo,
        played: teamMatches.filter((m: any) => m.status === 'completed').length,
        wins,
        losses,
        points: wins * 2, // 2 points per win
        rank: 0
      };
    }).sort((a: any, b: any) => b.points - a.points) || [];

    // Assign ranks
    teamStats.forEach((entry: any, index: number) => {
      entry.rank = index + 1;
    });

    return c.json({ leaderboard: teamStats });
  } catch (error) {
    console.log(`Error fetching team leaderboard: ${error}`);
    return c.json({ error: 'Failed to fetch leaderboard' }, 500);
  }
});

// ============================================
// INITIALIZATION ROUTE (Seed Data)
// ============================================

app.post("/make-server-8d3deb66/init", async (c) => {
  try {
    const { userId, error: authError } = await verifyAuth(c.req.raw);
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    // Check if already initialized
    const existing = await kv.getByPrefix('game:');
    if (existing && existing.length > 0) {
      return c.json({ message: 'System already initialized' });
    }

    // Initialize games
    const games = [
      { id: crypto.randomUUID(), name: 'Badminton', type: 'team', gender: 'mixed', maxPlayers: 4, scoringMethod: 'points' },
      { id: crypto.randomUUID(), name: 'Pickleball', type: 'team', gender: 'mixed', maxPlayers: 4, scoringMethod: 'points' },
      { id: crypto.randomUUID(), name: 'Cricket', type: 'team', gender: 'men', maxPlayers: 11, scoringMethod: 'runs' },
      { id: crypto.randomUUID(), name: 'Bowling', type: 'individual', gender: 'mixed', maxPlayers: 2, scoringMethod: 'points' },
      { id: crypto.randomUUID(), name: 'Arcade Games', type: 'individual', gender: 'mixed', maxPlayers: 2, scoringMethod: 'points' },
    ];

    for (const game of games) {
      await kv.set(`game:${game.id}`, { ...game, createdAt: new Date().toISOString() });
    }

    return c.json({ message: 'System initialized successfully', games });
  } catch (error) {
    console.log(`Error initializing system: ${error}`);
    return c.json({ error: 'Failed to initialize system' }, 500);
  }
});

Deno.serve(app.fetch);
