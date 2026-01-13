import React, { useState } from 'react';
import { useAppContext, Prediction } from '../../App';
import { Target, Lock, CheckCircle, XCircle } from 'lucide-react';

export function MatchPredictions() {
  const { user, matches, teams, predictions, setPredictions } = useAppContext();
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [predictedWinner, setPredictedWinner] = useState<string>('');
  const [predictedScores, setPredictedScores] = useState({ team1: 0, team2: 0 });

  const upcomingMatches = matches.filter(m => m.status === 'scheduled');
  const myPredictions = predictions.filter(p => p.userId === user?.id);

  const handleSubmitPrediction = () => {
    if (!selectedMatch || !predictedWinner || !user) {
      alert('Please select a winner!');
      return;
    }

    const existingPrediction = predictions.find(
      p => p.userId === user.id && p.matchId === selectedMatch
    );

    if (existingPrediction) {
      // Update existing prediction
      setPredictions(
        predictions.map(p =>
          p.id === existingPrediction.id
            ? {
                ...p,
                predictedWinnerId: predictedWinner,
                predictedScore: predictedScores,
              }
            : p
        )
      );
    } else {
      // Create new prediction
      const newPrediction: Prediction = {
        id: Date.now().toString(),
        userId: user.id,
        matchId: selectedMatch,
        predictedWinnerId: predictedWinner,
        predictedScore: predictedScores,
        points: 0,
        locked: false,
      };
      setPredictions([...predictions, newPrediction]);
    }

    alert('Prediction saved successfully!');
    setSelectedMatch(null);
    setPredictedWinner('');
    setPredictedScores({ team1: 0, team2: 0 });
  };

  const lockPrediction = (predictionId: string) => {
    setPredictions(
      predictions.map(p =>
        p.id === predictionId ? { ...p, locked: true } : p
      )
    );
    alert('Prediction locked! You can no longer change it.');
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Match Predictions</h2>
        <p className="text-gray-600">Predict match outcomes and earn points</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Matches */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Upcoming Matches
          </h3>

          <div className="space-y-4">
            {upcomingMatches.map((match) => {
              const team1 = teams.find(t => t.id === match.team1Id);
              const team2 = teams.find(t => t.id === match.team2Id);
              const myPrediction = myPredictions.find(p => p.matchId === match.id);

              return (
                <div
                  key={match.id}
                  className={`border rounded-lg p-4 ${
                    selectedMatch === match.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  } ${myPrediction?.locked ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-600">
                      {match.date} • {match.time}
                    </span>
                    {myPrediction?.locked && (
                      <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                    )}
                    {myPrediction && !myPrediction.locked && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        ✓ Predicted
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{team1?.logo}</span>
                      <span className="font-medium">{team1?.name}</span>
                    </div>
                    <span className="text-gray-400 font-medium">VS</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{team2?.name}</span>
                      <span className="text-2xl">{team2?.logo}</span>
                    </div>
                  </div>

                  {myPrediction && (
                    <div className="bg-white rounded-lg p-2 mb-3 text-sm">
                      <div className="text-gray-600">Your Prediction:</div>
                      <div className="font-medium">
                        Winner: {teams.find(t => t.id === myPrediction.predictedWinnerId)?.name}
                      </div>
                    </div>
                  )}

                  {!myPrediction?.locked && (
                    <button
                      onClick={() => {
                        setSelectedMatch(match.id);
                        if (myPrediction) {
                          setPredictedWinner(myPrediction.predictedWinnerId);
                          setPredictedScores(myPrediction.predictedScore || { team1: 0, team2: 0 });
                        }
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      {myPrediction ? 'Update Prediction' : 'Make Prediction'}
                    </button>
                  )}

                  {myPrediction && !myPrediction.locked && (
                    <button
                      onClick={() => lockPrediction(myPrediction.id)}
                      className="w-full mt-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
                    >
                      Lock Prediction
                    </button>
                  )}
                </div>
              );
            })}

            {upcomingMatches.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No upcoming matches to predict</p>
              </div>
            )}
          </div>
        </div>

        {/* Prediction Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {selectedMatch ? (
            <>
              <h3 className="font-bold text-lg mb-4">Make Your Prediction</h3>

              {(() => {
                const match = matches.find(m => m.id === selectedMatch);
                const team1 = teams.find(t => t.id === match?.team1Id);
                const team2 = teams.find(t => t.id === match?.team2Id);

                return (
                  <div>
                    <div className="bg-blue-50 rounded-lg p-6 mb-6">
                      <div className="grid grid-cols-3 gap-4 items-center text-center">
                        <div>
                          <div className="text-4xl mb-2">{team1?.logo}</div>
                          <div className="font-medium">{team1?.name}</div>
                        </div>
                        <div className="text-gray-400 font-medium">VS</div>
                        <div>
                          <div className="text-4xl mb-2">{team2?.logo}</div>
                          <div className="font-medium">{team2?.name}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Select Winner *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setPredictedWinner(team1?.id || '')}
                            className={`p-4 rounded-lg border-2 font-medium transition-colors ${
                              predictedWinner === team1?.id
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="text-3xl mb-1">{team1?.logo}</div>
                            <div>{team1?.name}</div>
                          </button>
                          <button
                            onClick={() => setPredictedWinner(team2?.id || '')}
                            className={`p-4 rounded-lg border-2 font-medium transition-colors ${
                              predictedWinner === team2?.id
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="text-3xl mb-1">{team2?.logo}</div>
                            <div>{team2?.name}</div>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Predict Score (Optional - Bonus Points)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              {team1?.name}
                            </label>
                            <input
                              type="number"
                              value={predictedScores.team1}
                              onChange={(e) =>
                                setPredictedScores({
                                  ...predictedScores,
                                  team1: Number(e.target.value),
                                })
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              {team2?.name}
                            </label>
                            <input
                              type="number"
                              value={predictedScores.team2}
                              onChange={(e) =>
                                setPredictedScores({
                                  ...predictedScores,
                                  team2: Number(e.target.value),
                                })
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="font-medium text-yellow-900 mb-1">Scoring Rules</div>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          <li>✓ Correct winner: 10 points</li>
                          <li>✓ Correct score: Additional 20 points</li>
                          <li>✓ Lock prediction before match starts</li>
                        </ul>
                      </div>

                      <button
                        onClick={handleSubmitPrediction}
                        disabled={!predictedWinner}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                      >
                        Submit Prediction
                      </button>
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Select a match to make your prediction</p>
            </div>
          )}
        </div>
      </div>

      {/* My Prediction History */}
      {myPredictions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mt-6">
          <h3 className="font-bold text-lg mb-4">My Prediction History</h3>
          <div className="space-y-3">
            {myPredictions.map((prediction) => {
              const match = matches.find(m => m.id === prediction.matchId);
              const team1 = teams.find(t => t.id === match?.team1Id);
              const team2 = teams.find(t => t.id === match?.team2Id);
              const predictedTeam = teams.find(t => t.id === prediction.predictedWinnerId);

              return (
                <div
                  key={prediction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium mb-1">
                      {team1?.name} vs {team2?.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      Predicted: {predictedTeam?.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {match?.status === 'completed' && (
                      <div className="text-center">
                        {match.winnerId === prediction.predictedWinnerId ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">+{prediction.points} pts</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-5 h-5" />
                            <span className="font-medium">0 pts</span>
                          </div>
                        )}
                      </div>
                    )}
                    {prediction.locked ? (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                        <Lock className="w-3 h-3 inline mr-1" />
                        Locked
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
