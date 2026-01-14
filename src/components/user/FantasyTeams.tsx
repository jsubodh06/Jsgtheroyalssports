import React, { useState, useEffect } from 'react';
import { useAppContext, FantasyTeam as FantasyTeamType } from '../../App';
import { Users, Plus, Trophy, Star, Crown } from 'lucide-react';
import { fantasyApi } from '../../utils/api';
import { toast } from 'sonner';

export function FantasyTeams() {
  const { user, games, players, teams, fantasyTeams, setFantasyTeams } = useAppContext();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedGame, setSelectedGame] = useState('');
  const [teamName, setTeamName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [captain, setCaptain] = useState('');
  const [viceCaptain, setViceCaptain] = useState('');
  const [loading, setLoading] = useState(false);

  const myFantasyTeams = fantasyTeams.filter(ft => ft.userId === user?.id);

  // Load user fantasy teams on mount
  useEffect(() => {
    loadFantasyTeams();
  }, []);

  const loadFantasyTeams = async () => {
    try {
      const { fantasyTeams: userTeams } = await fantasyApi.getAll();
      setFantasyTeams(userTeams);
    } catch (error) {
      console.error('Failed to load fantasy teams:', error);
    }
  };

  const handleCreateTeam = async () => {
    if (!selectedGame || !teamName || selectedPlayers.length === 0 || !user) {
      toast.error('Please fill all required fields!');
      return;
    }

    if (selectedPlayers.length < 5) {
      toast.error('Select at least 5 players for your fantasy team!');
      return;
    }

    if (!captain) {
      toast.error('Please select a captain!');
      return;
    }

    setLoading(true);
    try {
      const { fantasyTeam: newTeam } = await fantasyApi.create({
        gameId: selectedGame,
        name: teamName,
        players: selectedPlayers,
        captain,
        viceCaptain,
      });

      setFantasyTeams([...fantasyTeams, newTeam]);
      toast.success('Fantasy team created successfully!');
      setShowCreateForm(false);
      setSelectedGame('');
      setTeamName('');
      setSelectedPlayers([]);
      setCaptain('');
      setViceCaptain('');
    } catch (error: any) {
      console.error('Failed to create fantasy team:', error);
      toast.error(error.message || 'Failed to create fantasy team');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerToggle = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
      if (captain === playerId) setCaptain('');
      if (viceCaptain === playerId) setViceCaptain('');
    } else {
      if (selectedPlayers.length < 11) {
        setSelectedPlayers([...selectedPlayers, playerId]);
      } else {
        toast.error('Maximum 11 players allowed!');
      }
    }
  };

  // Get available players based on selected game and teams they belong to
  const availablePlayers = players.filter(p => {
    if (!selectedGame) return false;
    if (!p.teamId) return false; // Only show players that have been assigned to teams
    return p.games.includes(selectedGame);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Fantasy Teams</h2>
          <p className="text-gray-600">Create your dream team and compete for points</p>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Create Fantasy Team
          </button>
        )}
      </div>

      {/* Create Team Form */}
      {showCreateForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">Create New Fantasy Team</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="My Dream Team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Game/Sport *</label>
                <select
                  value={selectedGame}
                  onChange={(e) => {
                    setSelectedGame(e.target.value);
                    setSelectedPlayers([]);
                    setCaptain('');
                    setViceCaptain('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Game</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>{game.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedGame && (
              <>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Select Players ({selectedPlayers.length}/11)</h4>
                    <span className="text-sm text-gray-600">
                      {availablePlayers.length} players available
                    </span>
                  </div>

                  {availablePlayers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No players available for this game yet.</p>
                      <p className="text-sm">Players must be assigned to teams through the auction first.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                      {availablePlayers.map((player) => {
                        const playerTeam = teams.find(t => t.id === player.teamId);
                        const isSelected = selectedPlayers.includes(player.id);
                        const isCaptain = captain === player.id;
                        const isViceCaptain = viceCaptain === player.id;

                        return (
                          <div
                            key={player.id}
                            className={`border rounded-lg p-3 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                            onClick={() => handlePlayerToggle(player.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {player.husbandName} & {player.wifeName}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {playerTeam?.logo} {playerTeam?.name} • Skill: {player.skillRating}/10
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                {isCaptain && (
                                  <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs rounded font-medium">
                                    Captain
                                  </span>
                                )}
                                {isViceCaptain && (
                                  <span className="px-2 py-0.5 bg-orange-400 text-orange-900 text-xs rounded font-medium">
                                    V. Captain
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {selectedPlayers.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Crown className="w-4 h-4 text-yellow-600" />
                        Captain * (2x points)
                      </label>
                      <select
                        value={captain}
                        onChange={(e) => setCaptain(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="">Select Captain</option>
                        {selectedPlayers.map((playerId) => {
                          const player = players.find(p => p.id === playerId);
                          return player ? (
                            <option key={player.id} value={player.id}>
                              {player.husbandName} & {player.wifeName}
                            </option>
                          ) : null;
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Star className="w-4 h-4 text-orange-600" />
                        Vice Captain (1.5x points)
                      </label>
                      <select
                        value={viceCaptain}
                        onChange={(e) => setViceCaptain(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select Vice Captain (Optional)</option>
                        {selectedPlayers.filter(id => id !== captain).map((playerId) => {
                          const player = players.find(p => p.id === playerId);
                          return player ? (
                            <option key={player.id} value={player.id}>
                              {player.husbandName} & {player.wifeName}
                            </option>
                          ) : null;
                        })}
                      </select>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-xs font-medium text-yellow-900 mb-2">Fantasy Team Rules:</div>
                  <ul className="text-xs text-yellow-800 space-y-1">
                    <li>• Select 5-11 players from teams that have bought players</li>
                    <li>• Captain earns <strong>2x points</strong></li>
                    <li>• Vice Captain earns <strong>1.5x points</strong></li>
                    <li>• Points based on player performance in matches</li>
                  </ul>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCreateTeam}
                disabled={!selectedGame || !teamName || selectedPlayers.length < 5 || !captain || loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Team'}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setSelectedGame('');
                  setTeamName('');
                  setSelectedPlayers([]);
                  setCaptain('');
                  setViceCaptain('');
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Fantasy Teams */}
      <div className="space-y-6">
        {myFantasyTeams.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Fantasy Teams Yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first fantasy team to start competing!
            </p>
          </div>
        ) : (
          myFantasyTeams.map((fantasyTeam) => {
            const game = games.find(g => g.id === fantasyTeam.gameId);
            const teamPlayers = fantasyTeam.players.map(pid => players.find(p => p.id === pid)).filter(Boolean);
            const captainPlayer = players.find(p => p.id === fantasyTeam.captain);
            const viceCaptainPlayer = players.find(p => p.id === fantasyTeam.viceCaptain);

            return (
              <div key={fantasyTeam.id} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-yellow-600" />
                      {fantasyTeam.name}
                    </h3>
                    <p className="text-sm text-gray-600">{game?.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{fantasyTeam.points}</div>
                    <div className="text-sm text-gray-600">Total Points</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex gap-4 mb-2">
                    {captainPlayer && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <Crown className="w-4 h-4 text-yellow-600" />
                        <div>
                          <div className="text-xs text-yellow-700">Captain (2x)</div>
                          <div className="text-sm font-medium">
                            {captainPlayer.husbandName} & {captainPlayer.wifeName}
                          </div>
                        </div>
                      </div>
                    )}
                    {viceCaptainPlayer && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                        <Star className="w-4 h-4 text-orange-600" />
                        <div>
                          <div className="text-xs text-orange-700">Vice Captain (1.5x)</div>
                          <div className="text-sm font-medium">
                            {viceCaptainPlayer.husbandName} & {viceCaptainPlayer.wifeName}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Team Players ({teamPlayers.length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {teamPlayers.map((player: any) => {
                      const playerTeam = teams.find(t => t.id === player.teamId);
                      return (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-sm">
                              {player.husbandName} & {player.wifeName}
                            </div>
                            <div className="text-xs text-gray-600">
                              {playerTeam?.logo} {playerTeam?.name} • Skill: {player.skillRating}/10
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
