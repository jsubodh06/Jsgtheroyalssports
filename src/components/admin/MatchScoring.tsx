import React, { useState } from 'react';
import { useAppContext, Match } from '../../App';
import { Award, Save } from 'lucide-react';

export function MatchScoring() {
  const { matches, setMatches, teams, players } = useAppContext();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
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

  const handleSaveResult = () => {
    if (!selectedMatch) return;

    // Determine winner if not manually set
    let winnerId = scoreData.winnerId;
    if (!winnerId && scoreData.team1Score !== scoreData.team2Score) {
      winnerId = scoreData.team1Score > scoreData.team2Score ? selectedMatch.team1Id : selectedMatch.team2Id;
    }

    setMatches(matches.map(m =>
      m.id === selectedMatch.id
        ? {
            ...m,
            team1Score: scoreData.team1Score,
            team2Score: scoreData.team2Score,
            winnerId,
            bestPlayer: scoreData.bestPlayer,
            status: 'completed',
          }
        : m
    ));

    alert('Match result saved successfully!');
    setSelectedMatch(null);
    setScoreData({
      team1Score: 0,
      team2Score: 0,
      winnerId: '',
      bestPlayer: '',
    });
  };

  const handleMarkLive = (matchId: string) => {
    setMatches(matches.map(m =>
      m.id === matchId ? { ...m, status: 'live' } : m
    ));
  };

  // Get team's players
  const getTeamPlayers = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return [];
    return players.filter(p => team.players.includes(p.id));
  };

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
                {upcomingMatches.map((match) => {
                  const team1 = teams.find(t => t.id === match.team1Id);
                  const team2 = teams.find(t => t.id === match.team2Id);

                  return (
                    <button
                      key={match.id}
                      onClick={() => handleSelectMatch(match)}
                      className={`w-full text-left p-3 rounded-lg mb-2 border transition-colors ${
                        selectedMatch?.id === match.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">{match.date}</span>
                        {match.status === 'live' && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            🔴 Live
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-medium">
                        {team1?.logo} {team1?.name} vs {team2?.logo} {team2?.name}
                      </div>
                    </button>
                  );
                })}
                {upcomingMatches.length === 0 && (
                  <p className="text-sm text-gray-500">No upcoming matches</p>
                )}
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2 mt-4">Completed</div>
                {completedMatches.slice(0, 5).map((match) => {
                  const team1 = teams.find(t => t.id === match.team1Id);
                  const team2 = teams.find(t => t.id === match.team2Id);

                  return (
                    <div
                      key={match.id}
                      className="p-3 rounded-lg mb-2 bg-gray-50 border border-gray-200"
                    >
                      <div className="text-xs text-gray-600 mb-1">{match.date}</div>
                      <div className="text-sm">
                        {team1?.name} {match.team1Score} - {match.team2Score} {team2?.name}
                      </div>
                    </div>
                  );
                })}
                {completedMatches.length === 0 && (
                  <p className="text-sm text-gray-500">No completed matches</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Score Entry Form */}
        <div className="lg:col-span-2">
          {selectedMatch ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">Enter Match Result</h3>

              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      {teams.find(t => t.id === selectedMatch.team1Id)?.logo}
                    </div>
                    <div className="font-medium">
                      {teams.find(t => t.id === selectedMatch.team1Id)?.name}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-gray-400 font-medium mb-2">VS</div>
                    <div className="text-sm text-gray-600">{selectedMatch.date}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      {teams.find(t => t.id === selectedMatch.team2Id)?.logo}
                    </div>
                    <div className="font-medium">
                      {teams.find(t => t.id === selectedMatch.team2Id)?.name}
                    </div>
                  </div>
                </div>
              </div>

              {selectedMatch.status === 'scheduled' && (
                <div className="mb-6">
                  <button
                    onClick={() => handleMarkLive(selectedMatch.id)}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    🔴 Mark as Live
                  </button>
                </div>
              )}

              <div className="space-y-6">
                {/* Scores */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Match Scores</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        {teams.find(t => t.id === selectedMatch.team1Id)?.name} Score
                      </label>
                      <input
                        type="number"
                        value={scoreData.team1Score}
                        onChange={(e) => setScoreData({ ...scoreData, team1Score: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        {teams.find(t => t.id === selectedMatch.team2Id)?.name} Score
                      </label>
                      <input
                        type="number"
                        value={scoreData.team2Score}
                        onChange={(e) => setScoreData({ ...scoreData, team2Score: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Winner */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Declare Winner</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setScoreData({ ...scoreData, winnerId: selectedMatch.team1Id })}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                        scoreData.winnerId === selectedMatch.team1Id
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {teams.find(t => t.id === selectedMatch.team1Id)?.name}
                    </button>
                    <button
                      onClick={() => setScoreData({ ...scoreData, winnerId: '' })}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                        scoreData.winnerId === ''
                          ? 'border-gray-500 bg-gray-50 text-gray-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Draw
                    </button>
                    <button
                      onClick={() => setScoreData({ ...scoreData, winnerId: selectedMatch.team2Id })}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                        scoreData.winnerId === selectedMatch.team2Id
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {teams.find(t => t.id === selectedMatch.team2Id)?.name}
                    </button>
                  </div>
                </div>

                {/* Best Player */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Award className="w-4 h-4 inline mr-1" />
                    Best Player of the Match
                  </label>
                  <select
                    value={scoreData.bestPlayer}
                    onChange={(e) => setScoreData({ ...scoreData, bestPlayer: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Best Player</option>
                    <optgroup label={teams.find(t => t.id === selectedMatch.team1Id)?.name}>
                      {getTeamPlayers(selectedMatch.team1Id).map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.husbandName} & {player.wifeName}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={teams.find(t => t.id === selectedMatch.team2Id)?.name}>
                      {getTeamPlayers(selectedMatch.team2Id).map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.husbandName} & {player.wifeName}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveResult}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <Save className="w-5 h-5" />
                  Save Match Result
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Select a match from the list to enter results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
