import React, { useState } from 'react';
import { useAppContext, Match } from '../../App';
import { Plus, Edit2, Trash2, Calendar, Zap } from 'lucide-react';
import { matchesApi } from '../../utils/api';
import { toast } from 'sonner';

export function FixtureManagement() {
  const { matches, setMatches, teams, games } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Match>>({
    gameId: '',
    team1Id: '',
    team2Id: '',
    date: '',
    time: '',
    venue: '',
    status: 'scheduled',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.team1Id === formData.team2Id) {
      toast.error('Team 1 and Team 2 must be different!');
      return;
    }

    setLoading(true);
    try {
      if (editingMatch) {
        const { match } = await matchesApi.update(editingMatch.id, formData);
        setMatches(matches.map(m => m.id === editingMatch.id ? match : m));
        toast.success('Match updated successfully');
        setEditingMatch(null);
      } else {
        const { match } = await matchesApi.create(formData);
        setMatches([...matches, match]);
        toast.success('Match created successfully');
        setShowAddForm(false);
      }

      setFormData({
        gameId: '',
        team1Id: '',
        team2Id: '',
        date: '',
        time: '',
        venue: '',
        status: 'scheduled',
      });
    } catch (error: any) {
      console.error('Error saving match:', error);
      toast.error(error.message || 'Failed to save match');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (match: Match) => {
    setEditingMatch(match);
    setFormData(match);
    setShowAddForm(true);
  };

  const handleDelete = async (matchId: string) => {
    if (!confirm('Are you sure you want to delete this fixture?')) return;

    try {
      await matchesApi.delete(matchId);
      setMatches(matches.filter(m => m.id !== matchId));
      toast.success('Match deleted successfully');
    } catch (error: any) {
      console.error('Error deleting match:', error);
      toast.error(error.message || 'Failed to delete match');
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingMatch(null);
    setFormData({
      gameId: '',
      team1Id: '',
      team2Id: '',
      date: '',
      time: '',
      venue: '',
      status: 'scheduled',
    });
  };

  const autoGenerateFixtures = async () => {
    if (games.length === 0 || teams.filter(t => t.active).length < 2) {
      toast.error('Need at least 2 active teams and 1 game to generate fixtures!');
      return;
    }

    if (!confirm('This will create round-robin fixtures for all games. Continue?')) return;

    const activeTeams = teams.filter(t => t.active);
    const newMatches: any[] = [];

    games.forEach((game, gameIndex) => {
      // Generate round-robin for each game
      for (let i = 0; i < activeTeams.length; i++) {
        for (let j = i + 1; j < activeTeams.length; j++) {
          const dayOffset = Math.floor(newMatches.length / 4); // 4 matches per day
          const matchDate = new Date('2026-01-20');
          matchDate.setDate(matchDate.getDate() + dayOffset);

          const timeSlots = ['10:00 AM', '2:00 PM', '6:00 PM', '8:00 PM'];
          const timeIndex = newMatches.length % 4;

          newMatches.push({
            gameId: game.id,
            team1Id: activeTeams[i].id,
            team2Id: activeTeams[j].id,
            date: matchDate.toISOString().split('T')[0],
            time: timeSlots[timeIndex],
            venue: `Court ${String.fromCharCode(65 + (newMatches.length % 3))}`, // A, B, C rotation
            status: 'scheduled',
          });
        }
      }
    });

    setLoading(true);
    try {
      const createdMatches = [];
      for (const matchData of newMatches) {
        const { match } = await matchesApi.create(matchData);
        createdMatches.push(match);
      }
      setMatches([...matches, ...createdMatches]);
      toast.success(`Generated ${createdMatches.length} fixtures successfully!`);
    } catch (error: any) {
      console.error('Error generating fixtures:', error);
      toast.error(error.message || 'Failed to generate fixtures');
    } finally {
      setLoading(false);
    }
  };

  const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name || 'Unknown';
  const getGameName = (gameId: string) => games.find(g => g.id === gameId)?.name || 'Unknown';

  const groupedMatches = games.map(game => ({
    game,
    matches: matches.filter(m => m.gameId === game.id)
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fixture Management</h2>
          <p className="text-gray-600">Schedule and manage tournament matches</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={autoGenerateFixtures}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400"
          >
            <Zap className="w-5 h-5" />
            Auto-Generate Fixtures
          </button>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Add Match
            </button>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">{editingMatch ? 'Edit Match' : 'Add New Match'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Game/Sport *</label>
                <select
                  value={formData.gameId}
                  onChange={(e) => setFormData({ ...formData, gameId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Game</option>
                  {games.map(game => (
                    <option key={game.id} value={game.id}>{game.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Court A, Main Arena"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team 1 *</label>
                <select
                  value={formData.team1Id}
                  onChange={(e) => setFormData({ ...formData, team1Id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Team</option>
                  {teams.filter(t => t.active).map(team => (
                    <option key={team.id} value={team.id}>{team.logo} {team.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team 2 *</label>
                <select
                  value={formData.team2Id}
                  onChange={(e) => setFormData({ ...formData, team2Id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Team</option>
                  {teams.filter(t => t.active).map(team => (
                    <option key={team.id} value={team.id}>{team.logo} {team.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-blue-400"
              >
                {loading ? 'Saving...' : editingMatch ? 'Update Match' : 'Add Match'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Matches List - Grouped by Game */}
      <div className="space-y-6">
        {groupedMatches.map(({ game, matches: gameMatches }) => (
          <div key={game.id}>
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <span className="text-2xl">🏅</span>
              {game.name} Fixtures
              <span className="text-sm font-normal text-gray-600">({gameMatches.length} matches)</span>
            </h3>
            
            {gameMatches.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                No fixtures scheduled for {game.name} yet
              </div>
            ) : (
              <div className="space-y-3">
                {gameMatches.map(match => (
                  <div key={match.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{match.date}</span>
                          <span>•</span>
                          <span>{match.time}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{teams.find(t => t.id === match.team1Id)?.logo}</span>
                            <span className="font-medium">{getTeamName(match.team1Id)}</span>
                          </div>
                          <span className="text-gray-400">vs</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{teams.find(t => t.id === match.team2Id)?.logo}</span>
                            <span className="font-medium">{getTeamName(match.team2Id)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">{match.venue}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            match.status === 'completed' ? 'bg-green-100 text-green-700' :
                            match.status === 'live' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {match.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(match)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit Match"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(match.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Match"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {matches.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No fixtures scheduled yet. Click "Add Match" or "Auto-Generate Fixtures" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
