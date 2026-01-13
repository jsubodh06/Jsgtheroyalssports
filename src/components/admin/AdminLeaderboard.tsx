import React, { useState } from 'react';
import { useAppContext } from '../../App';
import { Trophy, TrendingUp } from 'lucide-react';

export function AdminLeaderboard() {
  const { teams, matches, games } = useAppContext();
  const [selectedGame, setSelectedGame] = useState<string>('all');

  // Calculate team statistics
  const calculateStats = (teamId: string, gameId?: string) => {
    let relevantMatches = matches.filter(
      m => m.status === 'completed' && (m.team1Id === teamId || m.team2Id === teamId)
    );

    if (gameId) {
      relevantMatches = relevantMatches.filter(m => m.gameId === gameId);
    }

    let wins = 0;
    let losses = 0;
    let draws = 0;
    let totalScore = 0;
    let totalConceded = 0;

    relevantMatches.forEach((match) => {
      const isTeam1 = match.team1Id === teamId;
      const teamScore = isTeam1 ? match.team1Score || 0 : match.team2Score || 0;
      const opponentScore = isTeam1 ? match.team2Score || 0 : match.team1Score || 0;

      totalScore += teamScore;
      totalConceded += opponentScore;

      if (match.winnerId === teamId) {
        wins++;
      } else if (match.winnerId && match.winnerId !== teamId) {
        losses++;
      } else {
        draws++;
      }
    });

    const played = wins + losses + draws;
    const points = wins * 3 + draws * 1;
    const winRate = played > 0 ? ((wins / played) * 100).toFixed(1) : '0.0';

    return {
      played,
      wins,
      losses,
      draws,
      points,
      totalScore,
      totalConceded,
      winRate,
    };
  };

  // Generate leaderboard
  const leaderboard = teams
    .filter(t => t.active)
    .map((team) => ({
      team,
      stats: calculateStats(team.id, selectedGame !== 'all' ? selectedGame : undefined),
    }))
    .sort((a, b) => {
      if (b.stats.points !== a.stats.points) {
        return b.stats.points - a.stats.points;
      }
      return b.stats.totalScore - b.stats.totalConceded - (a.stats.totalScore - a.stats.totalConceded);
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leaderboards & Analytics</h2>
          <p className="text-gray-600">View team standings and performance statistics</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Game</label>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Games</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overall Leaderboard */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">
                {selectedGame === 'all' ? 'Overall' : games.find(g => g.id === selectedGame)?.name} Leaderboard
              </h3>
              <p className="text-yellow-100">Team standings and rankings</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Played
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Won
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lost
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Draw
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Win %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaderboard.map((entry, index) => (
                <tr
                  key={entry.team.id}
                  className={`${
                    index === 0
                      ? 'bg-yellow-50'
                      : index === 1
                      ? 'bg-gray-50'
                      : index === 2
                      ? 'bg-orange-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? 'bg-yellow-400 text-white'
                          : index === 1
                          ? 'bg-gray-300 text-white'
                          : index === 2
                          ? 'bg-orange-400 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{entry.team.logo}</span>
                      <div>
                        <div className="font-medium text-gray-900">{entry.team.name}</div>
                        <div className="text-sm text-gray-500">{entry.team.ownerName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {entry.stats.played}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-green-600">
                    {entry.stats.wins}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-red-600">
                    {entry.stats.losses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {entry.stats.draws}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-lg font-bold text-blue-600">{entry.stats.points}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {entry.stats.totalScore} - {entry.stats.totalConceded}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{entry.stats.winRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {leaderboard.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No match data available yet. Complete some matches to see standings.</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Total Matches</h3>
            <Trophy className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {matches.filter(m => m.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {matches.filter(m => m.status === 'scheduled').length} upcoming
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Active Teams</h3>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">
            {teams.filter(t => t.active).length}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {games.length} sports available
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Average Score</h3>
            <Trophy className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {matches.filter(m => m.status === 'completed').length > 0
              ? Math.round(
                  matches
                    .filter(m => m.status === 'completed')
                    .reduce((acc, m) => acc + (m.team1Score || 0) + (m.team2Score || 0), 0) /
                    (matches.filter(m => m.status === 'completed').length * 2)
                )
              : 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">points per team</div>
        </div>
      </div>
    </div>
  );
}
