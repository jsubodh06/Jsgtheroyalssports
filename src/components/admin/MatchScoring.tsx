import React, { useState } from 'react';
import { useAppContext, Match } from '../../App';
import { Award, Save, PlayCircle, CheckCircle } from 'lucide-react';
import { matchesApi } from '../../utils/api';
import { toast } from 'sonner';

export function MatchScoring() {
  const { matches, setMatches, teams, players, games } = useAppContext();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(false);
  const [scoreData, setScoreData] = useState({
    team1Score: 0,
    team2Score: 0,
    winnerId: '',
    bestPlayer: '',
  });

  const upcomingMatches = matches.filter(m => m.status === 'scheduled' || m.status === 'live');
  const completedMatches = matches.filter(m => m.status === 'completed');

  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
    setScoreData({
      team1Score: match.team1Score || 0,
      team2Score: match.team2Score || 0,
      winnerId: match.winnerId || '',
      bestPlayer: match.bestPlayer || '',
    });
  };

  const handleSaveResult = async () => {
    if (!selectedMatch) return;

    // Determine winner if not manually set
    let winnerId = scoreData.winnerId;
    if (!winnerId && scoreData.team1Score !== scoreData.team2Score) {
      winnerId = scoreData.team1Score > scoreData.team2Score ? selectedMatch.team1Id : selectedMatch.team2Id;
    }

    setLoading(true);
    try {
      const { match } = await matchesApi.update(selectedMatch.id, {
        ...selectedMatch,
        team1Score: scoreData.team1Score,
        team2Score: scoreData.team2Score,
        winnerId,
        bestPlayer: scoreData.bestPlayer,
        status: 'completed',
      });

      setMatches(matches.map(m => m.id === selectedMatch.id ? match : m));
      toast.success('Match result saved successfully!');
      setSelectedMatch(null);
      setScoreData({
        team1Score: 0,
        team2Score: 0,
        winnerId: '',
        bestPlayer: '',
      });
    } catch (error: any) {
      console.error('Error saving match result:', error);
      toast.error(error.message || 'Failed to save match result');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkLive = async (match: Match) => {
    setLoading(true);
    try {
      const { match: updatedMatch } = await matchesApi.update(match.id, {
        ...match,
        status: 'live'
      });
      setMatches(matches.map(m => m.id === match.id ? updatedMatch : m));
      toast.success('Match marked as live');
    } catch (error: any) {
      console.error('Error updating match:', error);
      toast.error(error.message || 'Failed to update match');
    } finally {
      setLoading(false);
    }
  };

  // Get team's players
  const getTeamPlayers = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return [];
    return players.filter(p => team.players.includes(p.id));
  };

  const allPlayers = selectedMatch 
    ? [...getTeamPlayers(selectedMatch.team1Id), ...getTeamPlayers(selectedMatch.team2Id)]
    : [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Match Scoring & Results</h2>
        <p className="text-gray-600">Enter match results and update standings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4">Select Match</h3>

            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Upcoming / Live</div>
                {upcomingMatches.length === 0 ? (
                  <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded">No upcoming matches</p>
                ) : (
                  upcomingMatches.map((match) => {
                    const team1 = teams.find(t => t.id === match.team1Id);
                    const team2 = teams.find(t => t.id === match.team2Id);
                    const game = games.find(g => g.id === match.gameId);

                    return (
                      <div key={match.id} className="mb-2">
                        <button
                          onClick={() => handleSelectMatch(match)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedMatch?.id === match.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">{game?.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              match.status === 'live' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {match.status === 'live' ? '🔴 LIVE' : 'Scheduled'}
                            </span>
                          </div>
                          <div className="text-sm font-medium">
                            {team1?.logo} {team1?.name} vs {team2?.logo} {team2?.name}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {match.date} • {match.time}
                          </div>
                        </button>
                        {match.status === 'scheduled' && (
                          <button
                            onClick={() => handleMarkLive(match)}
                            disabled={loading}
                            className="w-full mt-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400"
                          >
                            <PlayCircle className="w-3 h-3" />
                            Mark as Live
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-3 border-t">
                <div className="text-sm font-medium text-gray-700 mb-2">Completed Matches</div>
                {completedMatches.length === 0 ? (
                  <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded">No completed matches</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {completedMatches.slice(0, 10).map((match) => {
                      const team1 = teams.find(t => t.id === match.team1Id);
                      const team2 = teams.find(t => t.id === match.team2Id);
                      const game = games.find(g => g.id === match.gameId);

                      return (
                        <div
                          key={match.id}
                          className="p-2 rounded-lg bg-green-50 border border-green-200 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-600">{game?.name}</span>
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          </div>
                          <div className="font-medium">
                            {team1?.name} {match.team1Score} - {match.team2Score} {team2?.name}
                          </div>
                          <div className="text-gray-600 mt-0.5">{match.date}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Score Entry */}
        <div className="lg:col-span-2">
          {selectedMatch ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl">Enter Match Result</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedMatch.status === 'live' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {selectedMatch.status === 'live' ? '🔴 LIVE' : selectedMatch.status.toUpperCase()}
                </span>
              </div>

              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-1">
                  {games.find(g => g.id === selectedMatch.gameId)?.name} • {selectedMatch.date} • {selectedMatch.time}
                </div>
                <div className="text-sm text-gray-600">Venue: {selectedMatch.venue}</div>
              </div>

              {/* Score Input */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">
                      {teams.find(t => t.id === selectedMatch.team1Id)?.logo}
                    </div>
                    <div className="font-bold text-lg">
                      {teams.find(t => t.id === selectedMatch.team1Id)?.name}
                    </div>
                  </div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
                  <input
                    type="number"
                    value={scoreData.team1Score}
                    onChange={(e) => setScoreData({ ...scoreData, team1Score: Number(e.target.value) })}
                    className="w-full px-4 py-3 text-center text-3xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div className="bg-purple-50 rounded-xl p-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">
                      {teams.find(t => t.id === selectedMatch.team2Id)?.logo}
                    </div>
                    <div className="font-bold text-lg">
                      {teams.find(t => t.id === selectedMatch.team2Id)?.name}
                    </div>
                  </div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
                  <input
                    type="number"
                    value={scoreData.team2Score}
                    onChange={(e) => setScoreData({ ...scoreData, team2Score: Number(e.target.value) })}
                    className="w-full px-4 py-3 text-center text-3xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Winner Selection (Optional - Auto-determined) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Winner (Auto-determined from scores, or select manually)
                </label>
                <select
                  value={scoreData.winnerId}
                  onChange={(e) => setScoreData({ ...scoreData, winnerId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Auto-determine from scores</option>
                  <option value={selectedMatch.team1Id}>
                    {teams.find(t => t.id === selectedMatch.team1Id)?.name}
                  </option>
                  <option value={selectedMatch.team2Id}>
                    {teams.find(t => t.id === selectedMatch.team2Id)?.name}
                  </option>
                </select>
              </div>

              {/* Best Player Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Award className="w-4 h-4 inline mr-1" />
                  Player of the Match (Optional)
                </label>
                <select
                  value={scoreData.bestPlayer}
                  onChange={(e) => setScoreData({ ...scoreData, bestPlayer: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select best player</option>
                  {allPlayers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.husbandName} & {player.wifeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveResult}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-green-400"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Match Result'}
              </button>

              {/* Current Winner Preview */}
              {(scoreData.team1Score !== 0 || scoreData.team2Score !== 0) && scoreData.team1Score !== scoreData.team2Score && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm font-medium text-yellow-800">
                    Winner: {teams.find(t => t.id === (scoreData.winnerId || (scoreData.team1Score > scoreData.team2Score ? selectedMatch.team1Id : selectedMatch.team2Id)))?.name}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Match Selected</h3>
              <p className="text-gray-600">
                Select a match from the left panel to enter scores and results
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
