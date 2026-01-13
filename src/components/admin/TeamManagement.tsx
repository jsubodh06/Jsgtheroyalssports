import React, { useState } from 'react';
import { useAppContext, Team } from '../../App';
import { Plus, Edit2, Archive, DollarSign, Users } from 'lucide-react';
import { teamsApi } from '../../utils/api';
import { toast } from 'sonner';

export function TeamManagement() {
  const { teams, setTeams } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Team>>({
    name: '',
    logo: '🏆',
    ownerName: '',
    contact: '',
    budget: 10000,
    spent: 0,
    players: [],
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTeam) {
        const { team } = await teamsApi.update(editingTeam.id, formData);
        setTeams(teams.map(t => t.id === editingTeam.id ? team : t));
        toast.success('Team updated successfully');
        setEditingTeam(null);
      } else {
        const { team } = await teamsApi.create(formData);
        setTeams([...teams, team]);
        toast.success('Team created successfully');
        setShowAddForm(false);
      }

      // Reset form
      setFormData({
        name: '',
        logo: '🏆',
        ownerName: '',
        contact: '',
        budget: 10000,
        spent: 0,
        players: [],
        active: true,
      });
    } catch (error: any) {
      console.error('Error saving team:', error);
      toast.error(error.message || 'Failed to save team');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData(team);
    setShowAddForm(true);
  };

  const handleToggleActive = async (team: Team) => {
    try {
      const { team: updatedTeam } = await teamsApi.update(team.id, { ...team, active: !team.active });
      setTeams(teams.map(t => t.id === team.id ? updatedTeam : t));
      toast.success(`Team ${updatedTeam.active ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      console.error('Error toggling team status:', error);
      toast.error(error.message || 'Failed to update team');
    }
  };

  const handleDelete = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;

    try {
      await teamsApi.delete(teamId);
      setTeams(teams.filter(t => t.id !== teamId));
      toast.success('Team deleted successfully');
    } catch (error: any) {
      console.error('Error deleting team:', error);
      toast.error(error.message || 'Failed to delete team');
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingTeam(null);
    setFormData({
      name: '',
      logo: '🏆',
      ownerName: '',
      contact: '',
      budget: 10000,
      spent: 0,
      players: [],
      active: true,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
          <p className="text-gray-600">Manage all teams participating in the league</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add Team
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">{editingTeam ? 'Edit Team' : 'Add New Team'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Logo (Emoji)</label>
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="🏆"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact (Email/Phone) *</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($) *</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
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
                {editingTeam ? 'Update Team' : 'Add Team'}
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

      {/* Teams List */}
      <div className="space-y-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className={`border rounded-lg p-6 ${
              team.active ? 'border-gray-200 bg-white' : 'border-gray-300 bg-gray-50 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="text-5xl">{team.logo}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{team.name}</h3>
                    {!team.active && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                        Archived
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">
                    <span className="font-medium">Owner:</span> {team.ownerName} • {team.contact}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="text-sm text-gray-600">Budget</div>
                        <div className="font-medium">${team.budget.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-red-600" />
                      <div>
                        <div className="text-sm text-gray-600">Spent</div>
                        <div className="font-medium text-red-600">${team.spent.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-gray-600">Remaining</div>
                        <div className="font-medium text-blue-600">${(team.budget - team.spent).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="text-sm text-gray-600">Players</div>
                        <div className="font-medium">{team.players.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(team)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Edit Team"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleToggleActive(team)}
                  className={`p-2 rounded-lg ${
                    team.active
                      ? 'text-orange-600 hover:bg-orange-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                  title={team.active ? 'Archive Team' : 'Activate Team'}
                >
                  <Archive className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(team.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete Team"
                >
                  <Archive className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {teams.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No teams added yet. Click "Add Team" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}