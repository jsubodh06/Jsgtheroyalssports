import React, { useState } from 'react';
import { useAppContext, FantasyTeam as FantasyTeamType } from '../../App';
import { Users, Plus, Trophy } from 'lucide-react';

export function FantasyTeams() {
  const { user, games, players, teams, fantasyTeams, setFantasyTeams } = useAppContext();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedGame, setSelectedGame] = useState('');
  const [teamName, setTeamName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [captain, setCaptain] = useState('');

  const myFantasyTeams = fantasyTeams.filter(ft => ft.userId === user?.id);

  const handleCreateTeam = () => {
    if (!selectedGame || !teamName || selectedPlayers.length === 0 || !user) {
      alert('Please fill all required fields!');
      return;
    }

    const newTeam: FantasyTeamType = {
      id: Date.now().toString(),
      userId: user.id,
      gameId: selectedGame,
      name: teamName,
      players: selectedPlayers,
      captain,
      viceCaptain: '',
      points: 0,
    };

    setFantasyTeams([...fantasyTeams, newTeam]);
    alert('Fantasy team created successfully!');
    setShowCreateForm(false);
    setSelectedGame('');
    setTeamName('');
    setSelectedPlayers([]);
    setCaptain('');
  };

  const handlePlayerToggle = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
      if (captain === playerId) setCaptain('');
    } else {
      if (selectedPlayers.length < 11) {
        setSelectedPlayers([...selectedPlayers, playerId]);
      }
    }
  };

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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="My Dream Team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Game/Sport *</label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Game</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>{game.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Players (Max 11) - {selectedPlayers.length}/11 selected
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-4 bg-white rounded-lg border border-gray-200">
                {players.filter(p => p.teamId).map((player) => {
                  const playerTeam = teams.find(t => t.id === player.teamId);
                  return (
                    <div
                      key={player.id}
                      onClick={() => handlePlayerToggle(player.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedPlayers.includes(player.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{player.husbandName} & {player.wifeName}</div>
                      <div className="text-sm text-gray-600">
                        {playerTeam?.name} • Skill: {player.skillRating}/10
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedPlayers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Captain (2x points)</label>
                <select
                  value={captain}
                  onChange={(e) => setCaptain(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Captain</option>
                  {selectedPlayers.map((playerId) => {
                    const player = players.find(p => p.id === playerId);
                    return (
                      <option key={playerId} value={playerId}>
                        {player?.husbandName} & {player?.wifeName}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCreateTeam}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Create Team
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setSelectedGame('');
                  setTeamName('');
                  setSelectedPlayers([]);
                  setCaptain('');
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Fantasy Teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myFantasyTeams.map((team) => {
          const game = games.find(g => g.id === team.gameId);
          const captainPlayer = players.find(p => p.id === team.captain);

          return (
            <div key={team.id} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{team.name}</h3>
                  <p className="text-sm text-gray-600">{game?.name}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{team.points}</div>
                  <div className="text-xs text-gray-600">Points</div>
                </div>
              </div>

              {captainPlayer && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                    <div className="text-sm">
                      <span className="font-medium">Captain:</span> {captainPlayer.husbandName} & {captainPlayer.wifeName}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Players ({team.players.length})</div>
                <div className="space-y-2">
                  {team.players.slice(0, 5).map((playerId) => {
                    const player = players.find(p => p.id === playerId);
                    const playerTeam = teams.find(t => t.id === player?.teamId);
                    return player ? (
                      <div key={playerId} className="flex items-center justify-between text-sm">
                        <span>{player.husbandName} & {player.wifeName}</span>
                        <span className="text-gray-600">{playerTeam?.name}</span>
                      </div>
                    ) : null;
                  })}
                  {team.players.length > 5 && (
                    <div className="text-sm text-gray-600">+{team.players.length - 5} more...</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {myFantasyTeams.length === 0 && !showCreateForm && (
          <div className="col-span-2 text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No fantasy teams created yet. Click "Create Fantasy Team" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
