import React, { useState, useEffect, createContext, useContext } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { LiveAuction } from './components/LiveAuction';
import { PublicView } from './components/PublicView';
import { Login } from './components/Login';
import { authApi, teamsApi, gamesApi, playersApi, matchesApi, predictionsApi, fantasyApi, initApi } from './utils/api';
import { toast, Toaster } from 'sonner';

// Types
export type UserRole = 'admin' | 'team_owner' | 'user' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  ownerName: string;
  contact: string;
  budget: number;
  spent: number;
  players: string[];
  active: boolean;
}

export interface Game {
  id: string;
  name: string;
  type: 'individual' | 'team';
  gender: 'men' | 'women' | 'mixed';
  maxPlayers: number;
  scoringMethod: string;
}

export interface Player {
  id: string;
  husbandName: string;
  wifeName: string;
  age: number;
  games: string[];
  skillRating: number;
  basePrice: number;
  playingPreference: 'both' | 'husband' | 'wife';
  teamId?: string;
  soldPrice?: number;
}

export interface Match {
  id: string;
  gameId: string;
  team1Id: string;
  team2Id: string;
  date: string;
  time: string;
  venue: string;
  status: 'scheduled' | 'live' | 'completed';
  team1Score?: number;
  team2Score?: number;
  winnerId?: string;
  bestPlayer?: string;
}

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  predictedWinnerId: string;
  predictedScore?: { team1: number; team2: number };
  points: number;
  locked: boolean;
}

export interface FantasyTeam {
  id: string;
  userId: string;
  gameId: string;
  name: string;
  players: string[];
  captain?: string;
  viceCaptain?: string;
  points: number;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  teams: Team[];
  setTeams: (teams: Team[]) => void;
  games: Game[];
  setGames: (games: Game[]) => void;
  players: Player[];
  setPlayers: (players: Player[]) => void;
  matches: Match[];
  setMatches: (matches: Match[]) => void;
  predictions: Prediction[];
  setPredictions: (predictions: Prediction[]) => void;
  fantasyTeams: FantasyTeam[];
  setFantasyTeams: (teams: FantasyTeam[]) => void;
  auctionActive: boolean;
  setAuctionActive: (active: boolean) => void;
  currentAuctionPlayer: Player | null;
  setCurrentAuctionPlayer: (player: Player | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [fantasyTeams, setFantasyTeams] = useState<FantasyTeam[]>([]);
  const [auctionActive, setAuctionActive] = useState(false);
  const [currentAuctionPlayer, setCurrentAuctionPlayer] = useState<Player | null>(null);
  const [view, setView] = useState<'login' | 'admin' | 'user' | 'auction' | 'public'>('public');
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await authApi.getSession();
      if (session) {
        const { user: userData } = await authApi.getCurrentUser();
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          teamId: userData.teamId
        });
        
        if (userData.role === 'admin') {
          setView('admin');
        } else {
          setView('user');
        }

        // Load initial data
        await loadData();
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      // Load all data from backend
      const [teamsRes, gamesRes, playersRes, matchesRes] = await Promise.all([
        teamsApi.getAll().catch(() => ({ teams: [] })),
        gamesApi.getAll().catch(() => ({ games: [] })),
        playersApi.getAll().catch(() => ({ players: [] })),
        matchesApi.getAll().catch(() => ({ matches: [] }))
      ]);

      setTeams(teamsRes.teams || []);
      setGames(gamesRes.games || []);
      setPlayers(playersRes.players || []);
      setMatches(matchesRes.matches || []);

      // Initialize games if none exist
      if (gamesRes.games?.length === 0) {
        try {
          const initRes = await initApi.initialize();
          if (initRes.games) {
            setGames(initRes.games);
          }
        } catch (error) {
          console.error('Failed to initialize games:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data from server');
    }
  };

  // Refresh data when user changes
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleLogin = async (loggedInUser: User) => {
    setUser(loggedInUser);
    if (loggedInUser.role === 'admin') {
      setView('admin');
    } else {
      setView('user');
    }
    
    // Load data after login
    await loadData();
    toast.success(`Welcome back, ${loggedInUser.name}!`);
  };

  const handleLogout = async () => {
    try {
      await authApi.signOut();
      setUser(null);
      setView('public');
      setTeams([]);
      setGames([]);
      setPlayers([]);
      setMatches([]);
      setPredictions([]);
      setFantasyTeams([]);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const contextValue: AppContextType = {
    user,
    setUser,
    teams,
    setTeams,
    games,
    setGames,
    players,
    setPlayers,
    matches,
    setMatches,
    predictions,
    setPredictions,
    fantasyTeams,
    setFantasyTeams,
    auctionActive,
    setAuctionActive,
    currentAuctionPlayer,
    setCurrentAuctionPlayer,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🏆</div>
              <div>
                <h1 className="font-bold text-xl">Sports Auction & Tournament Manager</h1>
                <p className="text-sm text-gray-600">Multi-Sport League Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {!user ? (
                <>
                  <button
                    onClick={() => setView('public')}
                    className={`px-4 py-2 rounded-lg ${view === 'public' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    Public View
                  </button>
                  <button
                    onClick={() => setView('login')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => setView('admin')}
                      className={`px-4 py-2 rounded-lg ${view === 'admin' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      Admin Dashboard
                    </button>
                  )}
                  {(user.role === 'team_owner' || user.role === 'user') && (
                    <button
                      onClick={() => setView('user')}
                      className={`px-4 py-2 rounded-lg ${view === 'user' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      My Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => setView('auction')}
                    className={`px-4 py-2 rounded-lg ${view === 'auction' ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    🔴 Live Auction
                  </button>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-gray-600 capitalize">{user.role?.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {view === 'login' && <Login onLogin={handleLogin} />}
          {view === 'admin' && user?.role === 'admin' && <AdminDashboard />}
          {view === 'user' && (user?.role === 'team_owner' || user?.role === 'user') && <UserDashboard />}
          {view === 'auction' && <LiveAuction />}
          {view === 'public' && <PublicView onNavigateToLogin={() => setView('login')} />}
        </main>
      </div>
    </AppContext.Provider>
  );
}