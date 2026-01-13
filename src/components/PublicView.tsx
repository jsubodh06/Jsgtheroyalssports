import React, { useState } from 'react';
import { useAppContext } from '../App';
import { Trophy, Calendar, Users } from 'lucide-react';

interface PublicViewProps {
  onNavigateToLogin: () => void;
}

export function PublicView({ onNavigateToLogin }: PublicViewProps) {
  const { matches, games, teams, players } = useAppContext();
  const [activeTab, setActiveTab] = useState<'fixtures' | 'leaderboard' | 'teams'>('fixtures');

  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, team: teams[0], points: 45, wins: 8, losses: 2 },
    { rank: 2, team: teams[1], points: 42, wins: 7, losses: 3 },
    { rank: 3, team: teams[2], points: 38, wins: 6, losses: 4 },
    { rank: 4, team: teams[3], points: 35, wins: 5, losses: 5 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white mb-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Welcome to the Ultimate Sports League</h1>
          <p className="text-xl mb-6 text-blue-100">
            Multi-sport auction platform featuring live bidding, fantasy leagues, match predictions, and real-time tournaments
          </p>
          <div className="flex gap-4">
            <button
              onClick={onNavigateToLogin}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors"
            >
              Join Now
            </button>
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-400 font-medium transition-colors">
              Watch Live Auction
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Teams</p>
              <p className="text-3xl font-bold text-gray-900">{teams.filter(t => t.active).length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Players</p>
              <p className="text-3xl font-bold text-gray-900">{players.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sports Available</p>
              <p className="text-3xl font-bold text-gray-900">{games.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Upcoming Matches</p>
              <p className="text-3xl font-bold text-gray-900">{matches.filter(m => m.status === 'scheduled').length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab('fixtures')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'fixtures'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📅 Fixtures
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🏆 Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'teams'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              👥 Teams
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'fixtures' && (
            <div className="space-y-4">
              {matches.map((match) => {
                const game = games.find(g => g.id === match.gameId);
                const team1 = teams.find(t => t.id === match.team1Id);
                const team2 = teams.find(t => t.id === match.team2Id);

                return (
                  <div key={match.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {game?.name}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          match.status === 'scheduled' ? 'bg-gray-100 text-gray-700' :
                          match.status === 'live' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {match.status === 'live' ? '🔴 Live' : match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {match.date} • {match.time}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-3xl">{team1?.logo}</div>
                        <div>
                          <div className="font-medium">{team1?.name}</div>
                          {match.status === 'completed' && match.team1Score !== undefined && (
                            <div className="text-sm text-gray-600">Score: {match.team1Score}</div>
                          )}
                        </div>
                      </div>

                      <div className="px-6 text-gray-400 font-medium">VS</div>

                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <div className="text-right">
                          <div className="font-medium">{team2?.name}</div>
                          {match.status === 'completed' && match.team2Score !== undefined && (
                            <div className="text-sm text-gray-600">Score: {match.team2Score}</div>
                          )}
                        </div>
                        <div className="text-3xl">{team2?.logo}</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
                      📍 {match.venue}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    entry.rank === 1
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      entry.rank === 1 ? 'bg-yellow-400 text-white' :
                      entry.rank === 2 ? 'bg-gray-300 text-white' :
                      entry.rank === 3 ? 'bg-orange-400 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {entry.rank}
                    </div>
                    <div className="text-3xl">{entry.team.logo}</div>
                    <div>
                      <div className="font-medium">{entry.team.name}</div>
                      <div className="text-sm text-gray-600">{entry.team.ownerName}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{entry.points}</div>
                      <div className="text-xs text-gray-600">Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-medium text-green-600">{entry.wins}W</div>
                      <div className="text-xs text-gray-600">Wins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-medium text-red-600">{entry.losses}L</div>
                      <div className="text-xs text-gray-600">Losses</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.filter(t => t.active).map((team) => (
                <div key={team.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{team.logo}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">{team.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">Owned by {team.ownerName}</p>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Budget:</span>{' '}
                          <span className="font-medium">${team.budget.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Spent:</span>{' '}
                          <span className="font-medium text-red-600">${team.spent.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-sm text-gray-600">Players:</span>{' '}
                        <span className="font-medium">{team.players.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
