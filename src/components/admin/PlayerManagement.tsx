import React, { useState } from 'react';
import { useAppContext, Player } from '../../App';
import { Plus, Edit2, Trash2, UserPlus, Upload, FileText } from 'lucide-react';
import { playersApi } from '../../utils/api';
import { toast } from 'sonner';

export function PlayerManagement() {
  const { players, setPlayers, games } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [csvContent, setCSVContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<Player>>({
    husbandName: '',
    wifeName: '',
    age: 25,
    games: [],
    skillRating: 5,
    basePrice: 1000,
    playingPreference: 'both',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPlayer) {
        const { player } = await playersApi.update(editingPlayer.id, formData);
        setPlayers(players.map(p => p.id === editingPlayer.id ? player : p));
        toast.success('Player updated successfully');
        setEditingPlayer(null);
      } else {
        const { player } = await playersApi.create(formData);
        setPlayers([...players, player]);
        toast.success('Player added successfully');
        setShowAddForm(false);
      }

      setFormData({
        husbandName: '',
        wifeName: '',
        age: 25,
        games: [],
        skillRating: 5,
        basePrice: 1000,
        playingPreference: 'both',
      });
    } catch (error: any) {
      console.error('Error saving player:', error);
      toast.error(error.message || 'Failed to save player');
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData(player);
    setShowAddForm(true);
  };

  const handleDelete = async (playerId: string) => {
    if (!confirm('Are you sure you want to delete this player?')) return;

    try {
      await playersApi.delete(playerId);
      setPlayers(players.filter(p => p.id !== playerId));
      toast.success('Player deleted successfully');
    } catch (error: any) {
      console.error('Error deleting player:', error);
      toast.error(error.message || 'Failed to delete player');
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingPlayer(null);
    setFormData({
      husbandName: '',
      wifeName: '',
      age: 25,
      games: [],
      skillRating: 5,
      basePrice: 1000,
      playingPreference: 'both',
    });
  };

  const handleGameToggle = (gameId: string) => {
    const currentGames = formData.games || [];
    if (currentGames.includes(gameId)) {
      setFormData({ ...formData, games: currentGames.filter(id => id !== gameId) });
    } else {
      setFormData({ ...formData, games: [...currentGames, gameId] });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCSVContent(content);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csv: string) => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const players = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length === 0 || values[0] === '') continue;

      const player: any = {};
      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        switch (header.toLowerCase()) {
          case 'husbandname':
          case 'husband_name':
          case 'husband name':
            player.husbandName = value;
            break;
          case 'wifename':
          case 'wife_name':
          case 'wife name':
            player.wifeName = value;
            break;
          case 'age':
            player.age = parseInt(value) || 25;
            break;
          case 'games':
          case 'eligible_games':
            // Games can be comma-separated IDs or names
            player.games = value.split(';').map((g: string) => {
              const trimmed = g.trim();
              // Try to find game by name
              const game = games.find(gm => gm.name.toLowerCase() === trimmed.toLowerCase());
              return game ? game.id : trimmed;
            }).filter(Boolean);
            break;
          case 'skillrating':
          case 'skill_rating':
          case 'skill rating':
            player.skillRating = parseInt(value) || 5;
            break;
          case 'baseprice':
          case 'base_price':
          case 'base price':
            player.basePrice = parseInt(value) || 500;
            break;
          case 'playingpreference':
          case 'playing_preference':
          case 'playing preference':
          case 'preference':
            player.playingPreference = ['both', 'husband', 'wife'].includes(value.toLowerCase()) 
              ? value.toLowerCase() 
              : 'both';
            break;
        }
      });

      if (player.husbandName || player.wifeName) {
        players.push(player);
      }
    }

    return players;
  };

  const handleCSVUpload = async () => {
    if (!csvContent) {
      toast.error('Please select a CSV file');
      return;
    }

    setUploading(true);
    try {
      const parsedPlayers = parseCSV(csvContent);
      
      if (parsedPlayers.length === 0) {
        toast.error('No valid players found in CSV');
        return;
      }

      const { players: createdPlayers, count } = await playersApi.bulkImport(parsedPlayers);
      setPlayers([...players, ...createdPlayers]);
      
      toast.success(`Successfully imported ${count} players`);
      setShowCSVUpload(false);
      setCSVContent('');
    } catch (error: any) {
      console.error('Error uploading CSV:', error);
      toast.error(error.message || 'Failed to upload CSV');
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleCSV = `husbandName,wifeName,age,games,skillRating,basePrice,playingPreference
John Doe,Jane Doe,28,Badminton;Pickleball,8,1200,both
Mike Smith,Sarah Smith,32,Cricket,9,1500,both
Tom Wilson,Emma Wilson,25,Bowling;Arcade Games,7,800,husband`;

    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'player_import_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Player / Couple Management</h2>
          <p className="text-gray-600">Manage auction participants and their game eligibility</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCSVUpload(!showCSVUpload)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Upload className="w-5 h-5" />
            Bulk Upload (CSV)
          </button>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Add Player
            </button>
          )}
        </div>
      </div>

      {/* CSV Upload Form */}
      {showCSVUpload && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Bulk Upload Players from CSV</h3>
          
          <div className="mb-4">
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <h4 className="font-medium mb-2">CSV Format Instructions:</h4>
              <ul className="text-sm text-gray-600 space-y-1 mb-3">
                <li>• First row must contain headers</li>
                <li>• Required columns: husbandName, wifeName, age, games, skillRating, basePrice, playingPreference</li>
                <li>• Games should be separated by semicolons (e.g., "Badminton;Cricket")</li>
                <li>• playingPreference: both, husband, or wife</li>
              </ul>
              <button
                onClick={downloadSampleCSV}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <FileText className="w-4 h-4" />
                Download Sample CSV
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {csvContent && (
            <div className="mb-4">
              <div className="bg-gray-100 rounded p-3 max-h-40 overflow-auto">
                <pre className="text-xs">{csvContent.slice(0, 500)}{csvContent.length > 500 ? '...' : ''}</pre>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCSVUpload}
              disabled={!csvContent || uploading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Players'}
            </button>
            <button
              onClick={() => {
                setShowCSVUpload(false);
                setCSVContent('');
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">{editingPlayer ? 'Edit Player' : 'Add New Player/Couple'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Husband Name *</label>
                <input
                  type="text"
                  value={formData.husbandName}
                  onChange={(e) => setFormData({ ...formData, husbandName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wife Name *</label>
                <input
                  type="text"
                  value={formData.wifeName}
                  onChange={(e) => setFormData({ ...formData, wifeName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="18"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Playing Preference *</label>
                <select
                  value={formData.playingPreference}
                  onChange={(e) => setFormData({ ...formData, playingPreference: e.target.value as 'both' | 'husband' | 'wife' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="both">Both Playing</option>
                  <option value="husband">Only Husband</option>
                  <option value="wife">Only Wife</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Rating (1-10) *</label>
                <input
                  type="number"
                  value={formData.skillRating}
                  onChange={(e) => setFormData({ ...formData, skillRating: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="10"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($) *</label>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="100"
                  step="100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Games Eligible For *</label>
              <div className="flex flex-wrap gap-2">
                {games.map((game) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => handleGameToggle(game.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      formData.games?.includes(game.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {game.name}
                  </button>
                ))}
              </div>
              {formData.games?.length === 0 && (
                <p className="text-sm text-red-600 mt-1">Please select at least one game</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                disabled={!formData.games || formData.games.length === 0}
              >
                {editingPlayer ? 'Update Player' : 'Add Player'}
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

      {/* Players List */}
      <div className="space-y-4">
        {players.map((player) => (
          <div key={player.id} className="border border-gray-200 rounded-lg p-6 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {player.husbandName} & {player.wifeName}
                    </h3>
                    <div className="flex gap-3 text-sm text-gray-600">
                      <span>Age: {player.age}</span>
                      <span>•</span>
                      <span className="capitalize">Playing: {player.playingPreference.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-gray-600">Skill Rating</div>
                    <div className="flex items-center gap-1">
                      <div className="font-medium text-lg">{player.skillRating}/10</div>
                      <div className="flex gap-0.5">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < player.skillRating ? 'bg-yellow-400' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Base Price</div>
                    <div className="font-medium text-lg">${player.basePrice.toLocaleString()}</div>
                  </div>

                  {player.soldPrice && (
                    <div>
                      <div className="text-sm text-gray-600">Sold Price</div>
                      <div className="font-medium text-lg text-green-600">${player.soldPrice.toLocaleString()}</div>
                    </div>
                  )}

                  {player.teamId && (
                    <div>
                      <div className="text-sm text-gray-600">Status</div>
                      <div className="font-medium text-green-600">✓ Sold</div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-2">Eligible for:</div>
                  <div className="flex flex-wrap gap-2">
                    {player.games.map((gameId) => {
                      const game = games.find(g => g.id === gameId);
                      return game ? (
                        <span
                          key={gameId}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {game.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(player)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Edit"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(player.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete"
                  disabled={!!player.teamId}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {players.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <UserPlus className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No players added yet. Click "Add Player" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}