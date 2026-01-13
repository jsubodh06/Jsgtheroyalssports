import React, { useState } from 'react';
import { useAppContext, Match } from '../../App';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';

export function FixtureManagement() {
  const { matches, setMatches, teams, games } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [formData, setFormData] = useState<Partial<Match>>({
    gameId: '',
    team1Id: '',
    team2Id: '',
    date: '',
    time: '',
    venue: '',
    status: 'scheduled',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingMatch) {
      setMatches(matches.map(m => m.id === editingMatch.id ? { ...editingMatch, ...formData } : m));
      setEditingMatch(null);
    } else {
      const newMatch: Match = {
        id: Date.now().toString(),
        gameId: formData.gameId!,
        team1Id: formData.team1Id!,
        team2Id: formData.team2Id!,
        date: formData.date!,
        time: formData.time!,
        venue: formData.venue!,
        status: 'scheduled',
      };
      setMatches([...matches, newMatch]);
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
  };

  const handleEdit = (match: Match) => {
    setEditingMatch(match);
    setFormData(match);
    setShowAddForm(true);
  };

  const handleDelete = (matchId: string) => {
    if (confirm('Are you sure you want to delete this fixture?')) {
      setMatches(matches.filter(m => m.id !== matchId));
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

  const autoGenerateFixtures = () => {
    if (games.length === 0 || teams.filter(t => t.active).length < 2) {
      alert('Need at least 2 active teams and 1 game to generate fixtures!');
      return;
    }

    const activeTeams = teams.filter(t => t.active);
    const newMatches: Match[] = [];
    let matchCounter = matches.length;

    games.forEach((game) => {
      // Generate round-robin for each game
      for (let i = 0; i < activeTeams.length; i++) {
        for (let j = i + 1; j < activeTeams.length; j++) {
          matchCounter++;
          newMatches.push({
            id: `auto-${matchCounter}`,
            gameId: game.id,
            team1Id: activeTeams[i].id,
            team2Id: activeTeams[j].id,
            date: '2026-01-20',
            time: '10:00 AM',
            venue: 'Main Arena',
            status: 'scheduled',
          });
        }
      }
    });

    setMatches([...matches, ...newMatches]);
    alert(`Generated ${newMatches.length} fixtures!`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fixture Management</h2>
          <p className="text-gray-600">Create and manage tournament fixtures</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={autoGenerateFixtures}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Shuffle className="w-5 h-5" />
            Auto Generate
          </button>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Add Fixture
            </button>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">{editingMatch ? 'Edit Fixture' : 'Add New Fixture'}</h3>
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
                  {games.map((game) => (
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
                  {teams.filter(t => t.active && t.id !== formData.team2Id).map((team) => (
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
                  {teams.filter(t => t.active && t.id !== formData.team1Id).map((team) => (
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
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {editingMatch ? 'Update Fixture' : 'Add Fixture'}
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

      {/* Fixtures List */}
      <div className="space-y-4">
        {matches.map((match) => {
          const game = games.find(g => g.id === match.gameId);
          const team1 = teams.find(t => t.id === match.team1Id);
          const team2 = teams.find(t => t.id === match.team2Id);

          return (
            <div key={match.id} className="border border-gray-200 rounded-lg p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
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
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(match)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(match.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-3xl">{team1?.logo}</span>
                  <div>
                    <div className="font-medium">{team1?.name}</div>
                    {match.team1Score !== undefined && (
                      <div className="text-sm text-gray-600">Score: {match.team1Score}</div>
                    )}
                  </div>
                </div>

                <div className="px-6 text-gray-400 font-medium">VS</div>

                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="text-right">
                    <div className="font-medium">{team2?.name}</div>
                    {match.team2Score !== undefined && (
                      <div className="text-sm text-gray-600">Score: {match.team2Score}</div>
                    )}
                  </div>
                  <span className="text-3xl">{team2?.logo}</span>
                </div>
              </div>

              <div className="flex gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {match.date}
                </div>
                <div>🕐 {match.time}</div>
                <div>📍 {match.venue}</div>
              </div>
            </div>
          );
        })}

        {matches.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No fixtures created yet. Click "Add Fixture" or "Auto Generate" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
