import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Target, Users, TrendingUp } from 'lucide-react';
import { leaderboardApi } from '../../utils/api';

type LeaderboardType = 'predictions' | 'fantasy' | 'teams';

export function UserLeaderboard() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('predictions');
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
    { id: 'predictions' as LeaderboardType, label: 'Predictions', icon: Target, color: 'blue' },
    { id: 'fantasy' as LeaderboardType, label: 'Fantasy Teams', icon: Trophy, color: 'purple' },
    { id: 'teams' as LeaderboardType, label: 'Team Rankings', icon: Users, color: 'green' }
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-600" />
          Leaderboards
        </h2>
        <p className="text-gray-600">See who's leading the competition</p>
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
                  <p>No predictions made yet. Be the first to predict!</p>
                </div>
              ) : (
                <div className="divide-y">
                  {predictionsLeaderboard.map((entry, index) => (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                        index < 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${getRankColor(entry.rank)}`}>
                        {getRankBadge(entry.rank)}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg">{entry.userName}</div>
                        <div className="text-sm text-gray-600">
                          {entry.points} prediction points
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
                  <p>No fantasy teams created yet. Create your dream team!</p>
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
                          by {entry.userName}
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

          {/* Teams Leaderboard */}
          {activeTab === 'teams' && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Team Rankings
                </h3>
                <p className="text-green-100 text-sm">
                  Tournament standings based on match wins
                </p>
              </div>

              {teamsLeaderboard.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No matches completed yet. Check back after matches are played!</p>
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
                            {entry.wins}W - {entry.losses}L ({entry.played} played)
                          </div>
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

          {/* Refresh Button */}
          <div className="mt-6 text-center">
            <button
              onClick={loadLeaderboards}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50"
            >
              <TrendingUp className="w-5 h-5" />
              {loading ? 'Refreshing...' : 'Refresh Leaderboards'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
