import React, { useState } from 'react';
import { TeamManagement } from './admin/TeamManagement';
import { GameManagement } from './admin/GameManagement';
import { PlayerManagement } from './admin/PlayerManagement';
import { AuctionControl } from './admin/AuctionControl';
import { FixtureManagement } from './admin/FixtureManagement';
import { MatchScoring } from './admin/MatchScoring';
import { AdminLeaderboard } from './admin/AdminLeaderboard';
import { Users, Trophy, UserPlus, Gavel, Calendar, BarChart3, Award } from 'lucide-react';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'teams' | 'games' | 'players' | 'auction' | 'fixtures' | 'scoring' | 'leaderboard'>('teams');

  const tabs = [
    { id: 'teams' as const, label: 'Teams', icon: Users },
    { id: 'games' as const, label: 'Games & Sports', icon: Trophy },
    { id: 'players' as const, label: 'Players', icon: UserPlus },
    { id: 'auction' as const, label: 'Auction Control', icon: Gavel },
    { id: 'fixtures' as const, label: 'Fixtures', icon: Calendar },
    { id: 'scoring' as const, label: 'Match Scoring', icon: Award },
    { id: 'leaderboard' as const, label: 'Leaderboards', icon: BarChart3 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage teams, players, auctions, and tournaments</p>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {activeTab === 'teams' && <TeamManagement />}
        {activeTab === 'games' && <GameManagement />}
        {activeTab === 'players' && <PlayerManagement />}
        {activeTab === 'auction' && <AuctionControl />}
        {activeTab === 'fixtures' && <FixtureManagement />}
        {activeTab === 'scoring' && <MatchScoring />}
        {activeTab === 'leaderboard' && <AdminLeaderboard />}
      </div>
    </div>
  );
}
