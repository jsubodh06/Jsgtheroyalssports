import React, { useState } from 'react';
import { MatchPredictions } from './user/MatchPredictions';
import { FantasyTeams } from './user/FantasyTeams';
import { UserLeaderboard } from './user/UserLeaderboard';
import { MyTeam } from './user/MyTeam';
import { useAppContext } from '../App';
import { Trophy, Target, Users, BarChart3, Bell } from 'lucide-react';

export function UserDashboard() {
  const { user, matches, predictions } = useAppContext();
  const [activeTab, setActiveTab] = useState<'predictions' | 'fantasy' | 'leaderboard' | 'myteam'>('predictions');

  const upcomingMatches = matches.filter(m => m.status === 'scheduled').length;
  const myPredictions = predictions.filter(p => p.userId === user?.id).length;

  const tabs = [
    { id: 'predictions' as const, label: 'Match Predictions', icon: Target },
    { id: 'fantasy' as const, label: 'Fantasy Teams', icon: Users },
    { id: 'leaderboard' as const, label: 'Leaderboards', icon: BarChart3 },
    ...(user?.role === 'team_owner' ? [{ id: 'myteam' as const, label: 'My Team', icon: Trophy }] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
            <p className="text-blue-100 mb-4">
              {user?.role === 'team_owner' ? 'Team Owner Dashboard' : 'Participate in predictions and fantasy leagues'}
            </p>
            <div className="flex gap-6">
              <div>
                <div className="text-2xl font-bold">{upcomingMatches}</div>
                <div className="text-sm text-blue-100">Upcoming Matches</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{myPredictions}</div>
                <div className="text-sm text-blue-100">My Predictions</div>
              </div>
            </div>
          </div>
          <button className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
            <Bell className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Prediction Accuracy</div>
              <div className="text-2xl font-bold text-gray-900">67%</div>
            </div>
          </div>
          <div className="text-sm text-green-600">↑ 12% from last week</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Fantasy Points</div>
              <div className="text-2xl font-bold text-gray-900">1,245</div>
            </div>
          </div>
          <div className="text-sm text-blue-600">Rank #8 overall</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Points</div>
              <div className="text-2xl font-bold text-gray-900">892</div>
            </div>
          </div>
          <div className="text-sm text-gray-600">From all competitions</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex gap-2 p-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'predictions' && <MatchPredictions />}
        {activeTab === 'fantasy' && <FantasyTeams />}
        {activeTab === 'leaderboard' && <UserLeaderboard />}
        {activeTab === 'myteam' && user?.role === 'team_owner' && <MyTeam />}
      </div>
    </div>
  );
}
