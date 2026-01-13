import React from 'react';
import { useAppContext } from '../../App';
import { DollarSign, Users, Trophy } from 'lucide-react';

export function MyTeam() {
  const { user, teams, players } = useAppContext();

  const myTeam = teams.find(t => t.id === user?.teamId);
  const myPlayers = players.filter(p => myTeam?.players.includes(p.id || ''));

  if (!myTeam) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">You don't own a team</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Team</h2>
        <p className="text-gray-600">Manage your team and view player roster</p>
      </div>

      {/* Team Overview */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{myTeam.logo}</div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{myTeam.name}</h1>
              <p className="text-blue-100">{myTeam.ownerName}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <div className="text-sm text-blue-100">Total Budget</div>
            </div>
            <div className="text-2xl font-bold">${myTeam.budget.toLocaleString()}</div>
          </div>

          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <div className="text-sm text-blue-100">Spent</div>
            </div>
            <div className="text-2xl font-bold">${myTeam.spent.toLocaleString()}</div>
          </div>

          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <div className="text-sm text-blue-100">Remaining</div>
            </div>
            <div className="text-2xl font-bold">${(myTeam.budget - myTeam.spent).toLocaleString()}</div>
          </div>

          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5" />
              <div className="text-sm text-blue-100">Players</div>
            </div>
            <div className="text-2xl font-bold">{myPlayers.length}</div>
          </div>
        </div>
      </div>

      {/* Player Roster */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-blue-600" />
          Player Roster
        </h3>

        {myPlayers.length > 0 ? (
          <div className="space-y-4">
            {myPlayers.map((player) => (
              <div
                key={player.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-2">
                      {player.husbandName} & {player.wifeName}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Age</div>
                        <div className="font-medium">{player.age}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Skill Rating</div>
                        <div className="font-medium">{player.skillRating}/10</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Playing</div>
                        <div className="font-medium capitalize">{player.playingPreference}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Purchase Price</div>
                        <div className="font-medium text-green-600">
                          ${player.soldPrice?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No players in your roster yet</p>
            <p className="text-sm">Participate in the auction to acquire players</p>
          </div>
        )}
      </div>
    </div>
  );
}
