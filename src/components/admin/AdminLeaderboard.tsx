import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Target, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { leaderboardApi } from '../../utils/api';

type LeaderboardType = 'predictions' | 'fantasy' | 'teams';

export function AdminLeaderboard() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('teams');
  const [predictionsLeaderboard, setPredictionsLeaderboard] = useState<any[]>([]);
  const [fantasyLeaderboard, setFantasyLeaderboard] = useState<any[]>([]);
  const [teamsLeaderboard, setTeamsLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    setLoading(true);
    try {
      const [predictions, fantasy, teams] = await Promise.all([
        leaderboardApi.getPredictions().catch(() => ({ leaderboard: [] })),
        leaderboardApi.getFantasy().catch(() => ({ leaderboard: [] })),
        leaderboardApi.getTeams().catch(() => ({ leaderboard: [] }))
      ]);

      setPredictionsLeaderboard(predictions.leaderboard || []);
      setFantasyLeaderboard(fantasy.leaderboard || []);
      setTeamsLeaderboard(teams.leaderboard || []);
    } catch (error) {
      console.error('Failed to load leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white';
    return 'bg-gray-100 text-gray-700';
  };

  const tabs = [
    { id: 'teams' as LeaderboardType, label: 'Team Rankings', icon: Users, color: 'green' },
    { id: 'predictions' as LeaderboardType, label: 'Predictions', icon: Target, color: 'blue' },
    { id: 'fantasy' as LeaderboardType, label: 'Fantasy Teams', icon: Trophy, color: 'purple' }
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          Leaderboards & Analytics
        </h2>
        <p className="text-gray-600">View competition standings across all categories</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
            <div className="text-3xl font-bold">{teamsLeaderboard.length}</div>
          </div>
          <div className="text-sm opacity-90">Active Teams</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 opacity-80" />
            <div className="text-3xl font-bold">{predictionsLeaderboard.length}</div>
          </div>
          <div className="text-sm opacity-90">Active Predictors</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-8 h-8 opacity-80" />
            <div className="text-3xl font-bold">{fantasyLeaderboard.length}</div>
          </div>
          <div className="text-sm opacity-90">Fantasy Teams</div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? `bg-${tab.color}-600 text-white shadow-lg`
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      ) : (
        <>
          {/* Teams Leaderboard */}
          {activeTab === 'teams' && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Team Rankings
                </h3>
                <p className="text-green-100 text-sm">
                  Tournament standings based on match wins (2 points per win)
                </p>
              </div>

              {teamsLeaderboard.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No matches completed yet. Teams will appear after matches are scored.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {teamsLeaderboard.map((entry, index) => (
                    <div
                      key={entry.teamId}
                      className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                        index < 3 ? 'bg-gradient-to-r from-green-50 to-transparent' : ''
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${getRankColor(entry.rank)}`}>
                        {getRankBadge(entry.rank)}
                      </div>
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-4xl">{entry.logo}</div>
                        <div>
                          <div className="font-bold text-lg">{entry.teamName}</div>
                          <div className="text-sm text-gray-600">
                            <span className="text-green-600 font-medium">{entry.wins}W</span> - 
                            <span className="text-red-600 font-medium"> {entry.losses}L</span> 
                            <span className="text-gray-500"> ({entry.played} matches)</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xs text-gray-600">Played</div>
                          <div className="text-lg font-bold">{entry.played}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Won</div>
                          <div className="text-lg font-bold text-green-600">{entry.wins}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Lost</div>
                          <div className="text-lg font-bold text-red-600">{entry.losses}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-600">{entry.points}</div>
                        <div className="text-xs text-gray-600">POINTS</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Predictions Leaderboard */}
          {activeTab === 'predictions' && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  Match Predictions Leaderboard
                </h3>
                <p className="text-blue-100 text-sm">
                  Rankings based on correct match outcome predictions
                </p>
              </div>

              {predictionsLeaderboard.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No predictions made yet.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {predictionsLeaderboard.map((entry, index) => (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                        index < 3 ? 'bg-gradient-to-r from-blue-50 to-transparent' : ''
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${getRankColor(entry.rank)}`}>
                        {getRankBadge(entry.rank)}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg">{entry.userName}</div>
                        <div className="text-sm text-gray-600">
                          Prediction enthusiast
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">{entry.points}</div>
                        <div className="text-xs text-gray-600">POINTS</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fantasy Teams Leaderboard */}
          {activeTab === 'fantasy' && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  Fantasy Teams Leaderboard
                </h3>
                <p className="text-purple-100 text-sm">
                  Rankings based on fantasy team performance
                </p>
              </div>

              {fantasyLeaderboard.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No fantasy teams created yet.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {fantasyLeaderboard.map((entry, index) => (
                    <div
                      key={entry.teamId}
                      className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                        index < 3 ? 'bg-gradient-to-r from-purple-50 to-transparent' : ''
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${getRankColor(entry.rank)}`}>
                        {getRankBadge(entry.rank)}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg">{entry.teamName}</div>
                        <div className="text-sm text-gray-600">
                          Created by {entry.userName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-600">{entry.points}</div>
                        <div className="text-xs text-gray-600">POINTS</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Refresh Button */}
          <div className="mt-6 text-center">
            <button
              onClick={loadLeaderboards}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50"
            >
              <TrendingUp className="w-5 h-5" />
              {loading ? 'Refreshing...' : 'Refresh All Leaderboards'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
