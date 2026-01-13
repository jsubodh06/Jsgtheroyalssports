import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8d3deb66`;

// Create Supabase client
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Token management
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

export const getAccessToken = (): string | null => {
  if (!accessToken) {
    accessToken = localStorage.getItem('accessToken');
  }
  return accessToken;
};

// API helper function
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

// ============================================
// AUTH API
// ============================================

export const authApi = {
  signUp: async (email: string, password: string, name: string, role: string = 'user') => {
    const data = await apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.session?.access_token) {
      setAccessToken(data.session.access_token);
    }

    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    setAccessToken(null);
    if (error) throw error;
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    if (data.session?.access_token) {
      setAccessToken(data.session.access_token);
    }

    return data.session;
  },

  getCurrentUser: async () => {
    return await apiCall('/auth/user');
  },
};

// ============================================
// TEAMS API
// ============================================

export const teamsApi = {
  getAll: async () => {
    return await apiCall('/teams');
  },

  create: async (team: any) => {
    return await apiCall('/teams', {
      method: 'POST',
      body: JSON.stringify(team),
    });
  },

  update: async (id: string, team: any) => {
    return await apiCall(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(team),
    });
  },

  delete: async (id: string) => {
    return await apiCall(`/teams/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// GAMES API
// ============================================

export const gamesApi = {
  getAll: async () => {
    return await apiCall('/games');
  },

  create: async (game: any) => {
    return await apiCall('/games', {
      method: 'POST',
      body: JSON.stringify(game),
    });
  },

  delete: async (id: string) => {
    return await apiCall(`/games/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// PLAYERS API
// ============================================

export const playersApi = {
  getAll: async () => {
    return await apiCall('/players');
  },

  create: async (player: any) => {
    return await apiCall('/players', {
      method: 'POST',
      body: JSON.stringify(player),
    });
  },

  bulkImport: async (players: any[]) => {
    return await apiCall('/players/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ players }),
    });
  },

  update: async (id: string, player: any) => {
    return await apiCall(`/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify(player),
    });
  },

  delete: async (id: string) => {
    return await apiCall(`/players/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// MATCHES API
// ============================================

export const matchesApi = {
  getAll: async () => {
    return await apiCall('/matches');
  },

  create: async (match: any) => {
    return await apiCall('/matches', {
      method: 'POST',
      body: JSON.stringify(match),
    });
  },

  update: async (id: string, match: any) => {
    return await apiCall(`/matches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(match),
    });
  },

  delete: async (id: string) => {
    return await apiCall(`/matches/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// AUCTION API
// ============================================

export const auctionApi = {
  getStatus: async () => {
    return await apiCall('/auction/status');
  },

  start: async (playerId: string) => {
    return await apiCall('/auction/start', {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
  },

  placeBid: async (teamId: string, amount: number) => {
    return await apiCall('/auction/bid', {
      method: 'POST',
      body: JSON.stringify({ teamId, amount }),
    });
  },

  finalize: async () => {
    return await apiCall('/auction/finalize', {
      method: 'POST',
    });
  },

  stop: async () => {
    return await apiCall('/auction/stop', {
      method: 'POST',
    });
  },
};

// ============================================
// PREDICTIONS API
// ============================================

export const predictionsApi = {
  getAll: async () => {
    return await apiCall('/predictions');
  },

  create: async (prediction: any) => {
    return await apiCall('/predictions', {
      method: 'POST',
      body: JSON.stringify(prediction),
    });
  },
};

// ============================================
// FANTASY TEAMS API
// ============================================

export const fantasyApi = {
  getAll: async () => {
    return await apiCall('/fantasy-teams');
  },

  create: async (fantasyTeam: any) => {
    return await apiCall('/fantasy-teams', {
      method: 'POST',
      body: JSON.stringify(fantasyTeam),
    });
  },

  update: async (id: string, fantasyTeam: any) => {
    return await apiCall(`/fantasy-teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fantasyTeam),
    });
  },
};

// ============================================
// LEADERBOARD API
// ============================================

export const leaderboardApi = {
  getPredictions: async () => {
    return await apiCall('/leaderboard/predictions');
  },

  getFantasy: async () => {
    return await apiCall('/leaderboard/fantasy');
  },

  getTeams: async () => {
    return await apiCall('/leaderboard/teams');
  },
};

// ============================================
// INITIALIZATION API
// ============================================

export const initApi = {
  initialize: async () => {
    return await apiCall('/init', {
      method: 'POST',
    });
  },
};

// ============================================
// REAL-TIME AUCTION UPDATES
// ============================================

export const subscribeToAuction = (callback: (payload: any) => void) => {
  // Using polling for real-time updates (fallback approach)
  let intervalId: NodeJS.Timeout;

  const startPolling = () => {
    intervalId = setInterval(async () => {
      try {
        const status = await auctionApi.getStatus();
        callback(status);
      } catch (error) {
        console.error('Error polling auction status:', error);
      }
    }, 2000); // Poll every 2 seconds
  };

  startPolling();

  // Return cleanup function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
};
