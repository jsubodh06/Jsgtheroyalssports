import React, { useState } from 'react';
import { useAppContext, Game } from '../../App';
import { Plus, Edit2, Trash2, Trophy } from 'lucide-react';

export function GameManagement() {
  const { games, setGames } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState<Partial<Game>>({
    name: '',
    type: 'team',
    gender: 'mixed',
    maxPlayers: 4,
    scoringMethod: 'points',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingGame) {
      setGames(games.map(g => g.id === editingGame.id ? { ...editingGame, ...formData } : g));
      setEditingGame(null);
    } else {
      const newGame: Game = {
        id: Date.now().toString(),
        name: formData.name!,
        type: formData.type!,
        gender: formData.gender!,
        maxPlayers: formData.maxPlayers!,
        scoringMethod: formData.scoringMethod!,
      };
      setGames([...games, newGame]);
      setShowAddForm(false);
    }

    setFormData({
      name: '',
      type: 'team',
      gender: 'mixed',
      maxPlayers: 4,
      scoringMethod: 'points',
    });
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setFormData(game);
    setShowAddForm(true);
  };

  const handleDelete = (gameId: string) => {
    if (confirm('Are you sure you want to delete this game?')) {
      setGames(games.filter(g => g.id !== gameId));
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingGame(null);
    setFormData({
      name: '',
      type: 'team',
      gender: 'mixed',
      maxPlayers: 4,
      scoringMethod: 'points',
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Game & Sport Management</h2>
          <p className="text-gray-600">Configure sports and game types for the league</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add Game
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">{editingGame ? 'Edit Game' : 'Add New Game'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Game Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Badminton, Cricket"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Game Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'individual' | 'team' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="team">Team Sport</option>
                  <option value="individual">Individual Sport</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender Category *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'men' | 'women' | 'mixed' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="mixed">Mixed</option>
                  <option value="men">Men Only</option>
                  <option value="women">Women Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Players per Team *</label>
                <input
                  type="number"
                  value={formData.maxPlayers}
                  onChange={(e) => setFormData({ ...formData, maxPlayers: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scoring Method *</label>
                <select
                  value={formData.scoringMethod}
                  onChange={(e) => setFormData({ ...formData, scoringMethod: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="points">Points</option>
                  <option value="runs">Runs</option>
                  <option value="wins">Wins</option>
                  <option value="scores">Scores</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {editingGame ? 'Update Game' : 'Add Game'}
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

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <div key={game.id} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{game.name}</h3>
                  <span className="text-sm text-gray-600 capitalize">{game.type}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(game)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(game.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Gender:</span>
                <span className="font-medium capitalize">{game.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Players:</span>
                <span className="font-medium">{game.maxPlayers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Scoring:</span>
                <span className="font-medium capitalize">{game.scoringMethod}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {games.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No games configured yet. Click "Add Game" to get started.</p>
        </div>
      )}
    </div>
  );
}
