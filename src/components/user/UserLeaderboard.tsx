import React, { useState } from 'react';
import { useAppContext } from '../../App';
import { Trophy, Target, Users } from 'lucide-react';

export function UserLeaderboard() {
  const { games, predictions, fantasyTeams, user } = useAppContext();
  const [view, setView] = useState<'prediction' | 'fantasy' | 'overall'>('overall');

  // Mock leaderboard data
  const predictionLeaderboard = [
    { rank: 1, name: 'John Doe', points: 450, accuracy: 75 },
    { rank: 2, name: 'Sarah Smith', points: 420, accuracy: 72 },
    { rank: 3, name: user?.name || 'You', points: 380, accuracy: 67 },
    { rank: 4, name: 'Mike Wilson', points: 350, accuracy: 65 },
    { rank: 5, name: 'Emma Brown', points: 320, accuracy: 62 },
  ];

  const fantasyLeaderboard = [
    { rank: 1, name: 'Mike Wilson', teamName: 'Warriors United', points: 1850 },
    { rank: 2, name: 'Sarah Smith', teamName: 'Dream Strikers', points: 1720 },
    { rank: 3, name: 'John Doe', teamName: 'Champions XI', points: 1680 },
    { rank: 4, name: user?.name || 'You', teamName: 'My Dream Team', points: 1245 },
    { rank: 5, name: 'Emma Brown', teamName: 'Phoenix Squad', points: 1190 },
  ];

  const overallLeaderboard = [
    { rank: 1, name: 'Sarah Smith', predictionPts: 420, fantasyPts: 1720, totalPts: 2140 },
    { rank: 2, name: 'John Doe', predictionPts: 450, fantasyPts: 1680, totalPts: 2130 },
    { rank: 3, name: 'Mike Wilson', predictionPts: 350, fantasyPts: 1850, totalPts: 2200 },
    { rank: 4, name: user?.name || 'You', predictionPts: 380, fantasyPts: 1245, totalPts: 1625 },
    { rank: 5, name: 'Emma Brown', predictionPts: 320, fantasyPts: 1190, totalPts: 1510 },
  ].sort((a, b) => b.totalPts - a.totalPts);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Leaderboards</h2>
        <p className="text-gray-600">Compare your performance with other participants</p>
      </div>

      {/* View Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setView('overall')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            view === 'overall' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Trophy className="w-5 h-5" />
          Overall
        </button>
        <button
          onClick={() => setView('prediction')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            view === 'prediction' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Target className="w-5 h-5" />
          Predictions
        </button>
        <button
          onClick={() => setView('fantasy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            view === 'fantasy' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Users className="w-5 h-5" />
          Fantasy
        </button>
      </div>

      {/* Overall Leaderboard */}
      {view === 'overall' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Overall Leaderboard
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {overallLeaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`p-6 flex items-center justify-between ${
                  entry.name === user?.name ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      entry.rank === 1
                        ? 'bg-yellow-400 text-white'
                        : entry.rank === 2
                        ? 'bg-gray-300 text-white'
                        : entry.rank === 3
                        ? 'bg-orange-400 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {entry.rank}
                  </div>
                  <div>
                    <div className="font-medium text-lg">{entry.name}</div>
                    <div className="text-sm text-gray-600">
                      Prediction: {entry.predictionPts} • Fantasy: {entry.fantasyPts}
                    </div>
                  </div>
                  {entry.name === user?.name && (
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">You</span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{entry.totalPts}</div>
                  <div className="text-xs text-gray-600">Total Points</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prediction Leaderboard */}
      {view === 'prediction' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6" />
              Prediction Leaderboard
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {predictionLeaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`p-6 flex items-center justify-between ${
                  entry.name === user?.name ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      entry.rank === 1
                        ? 'bg-yellow-400 text-white'
                        : entry.rank === 2
                        ? 'bg-gray-300 text-white'
                        : entry.rank === 3
                        ? 'bg-orange-400 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {entry.rank}
                  </div>
                  <div>
                    <div className="font-medium text-lg">{entry.name}</div>
                    <div className="text-sm text-gray-600">Accuracy: {entry.accuracy}%</div>
                  </div>
                  {entry.name === user?.name && (
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">You</span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{entry.points}</div>
                  <div className="text-xs text-gray-600">Points</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fantasy Leaderboard */}
      {view === 'fantasy' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              Fantasy Leaderboard
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {fantasyLeaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`p-6 flex items-center justify-between ${
                  entry.name === user?.name ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      entry.rank === 1
                        ? 'bg-yellow-400 text-white'
                        : entry.rank === 2
                        ? 'bg-gray-300 text-white'
                        : entry.rank === 3
                        ? 'bg-orange-400 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {entry.rank}
                  </div>
                  <div>
                    <div className="font-medium text-lg">{entry.name}</div>
                    <div className="text-sm text-gray-600">{entry.teamName}</div>
                  </div>
                  {entry.name === user?.name && (
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">You</span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600">{entry.points}</div>
                  <div className="text-xs text-gray-600">Points</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
