import React, { useState, useEffect } from 'react';
import { useAppContext, Prediction } from '../../App';
import { Target, Lock, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { predictionsApi } from '../../utils/api';
import { toast } from 'sonner';

export function MatchPredictions() {
  const { user, matches, teams, predictions, setPredictions, games } = useAppContext();
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [predictedWinner, setPredictedWinner] = useState<string>('');
  const [predictedScores, setPredictedScores] = useState({ team1: 0, team2: 0 });
  const [loading, setLoading] = useState(false);

  const upcomingMatches = matches.filter(m => m.status === 'scheduled' || m.status === 'live');
  const completedMatches = matches.filter(m => m.status === 'completed');
  const myPredictions = predictions.filter(p => p.userId === user?.id);

  // Load user predictions on mount
  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      const { predictions: userPredictions } = await predictionsApi.getAll();
      setPredictions(userPredictions);
    } catch (error) {
      console.error('Failed to load predictions:', error);
    }
  };

  const handleSubmitPrediction = async () => {
    if (!selectedMatch || !predictedWinner || !user) {
      toast.error('Please select a match and winner!');
      return;
    }

    const existingPrediction = predictions.find(
      p => p.userId === user.id && p.matchId === selectedMatch
    );

    if (existingPrediction && existingPrediction.locked) {
      toast.error('This prediction is already locked!');
      return;
    }

    setLoading(true);
    try {
      const predictionData = {
        matchId: selectedMatch,
        predictedWinnerId: predictedWinner,
        predictedScore: predictedScores,
      };

      const { prediction } = await predictionsApi.create(predictionData);
      
      if (existingPrediction) {
        setPredictions(predictions.map(p => p.id === existingPrediction.id ? prediction : p));
        toast.success('Prediction updated successfully!');
      } else {
        setPredictions([...predictions, prediction]);
        toast.success('Prediction saved successfully!');
      }

      setSelectedMatch(null);
      setPredictedWinner('');
      setPredictedScores({ team1: 0, team2: 0 });
    } catch (error: any) {
      console.error('Failed to save prediction:', error);
      toast.error(error.message || 'Failed to save prediction');
    } finally {
      setLoading(false);
    }
  };

  const calculatePoints = (prediction: Prediction, match: any) => {
    if (match.status !== 'completed') return 0;
    
    let points = 0;
    
    // Correct winner: 10 points
    if (prediction.predictedWinnerId === match.winnerId) {
      points += 10;
    }
    
    // Exact score prediction: 20 bonus points
    if (prediction.predictedScore && 
        prediction.predictedScore.team1 === match.team1Score &&
        prediction.predictedScore.team2 === match.team2Score) {
      points += 20;
    }
    
    return points;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Match Predictions</h2>
        <p className="text-gray-600">Predict match outcomes and earn points</p>
      </div>

      {/* Points Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="text-sm opacity-90 mb-1">Total Predictions</div>
          <div className="text-4xl font-bold">{myPredictions.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="text-sm opacity-90 mb-1">Points Earned</div>
          <div className="text-4xl font-bold">
            {myPredictions.reduce((total, pred) => {
              const match = matches.find(m => m.id === pred.matchId);
              return total + (match ? calculatePoints(pred, match) : 0);
            }, 0)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-sm opacity-90 mb-1">Correct Predictions</div>
          <div className="text-4xl font-bold">
            {myPredictions.filter(pred => {
              const match = matches.find(m => m.id === pred.matchId);
              return match?.winnerId === pred.predictedWinnerId;
            }).length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Matches */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Upcoming Matches
          </h3>

          {upcomingMatches.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming matches to predict</p>
          ) : (
            <div className="space-y-4">
              {upcomingMatches.map((match) => {
                const team1 = teams.find(t => t.id === match.team1Id);
                const team2 = teams.find(t => t.id === match.team2Id);
                const game = games.find(g => g.id === match.gameId);
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
                      <div>
                        <span className="text-xs text-gray-600">{game?.name}</span>
                        <div className="text-xs text-gray-600">
                          {match.date} • {match.time}
                        </div>
                      </div>
                      {myPrediction?.locked && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                          <Lock className="w-3 h-3" />
                          Locked
                        </span>
                      )}
                      {match.status === 'live' && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          🔴 LIVE
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{team1?.logo}</span>
                        <span className="font-medium">{team1?.name}</span>
                      </div>
                      <span className="text-gray-400">vs</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{team2?.logo}</span>
                        <span className="font-medium">{team2?.name}</span>
                      </div>
                    </div>

                    {myPrediction ? (
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <div className="text-xs text-green-700 mb-1">Your Prediction:</div>
                        <div className="font-medium text-green-900">
                          Winner: {teams.find(t => t.id === myPrediction.predictedWinnerId)?.name}
                        </div>
                        {myPrediction.predictedScore && (
                          <div className="text-sm text-green-700">
                            Score: {myPrediction.predictedScore.team1} - {myPrediction.predictedScore.team2}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedMatch(match.id);
                          setPredictedWinner('');
                          setPredictedScores({ team1: 0, team2: 0 });
                        }}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        Make Prediction
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Prediction Form or Results */}
        <div>
          {selectedMatch ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">Make Your Prediction</h3>

              {(() => {
                const match = matches.find(m => m.id === selectedMatch);
                const team1 = teams.find(t => t.id === match?.team1Id);
                const team2 = teams.find(t => t.id === match?.team2Id);
                const game = games.find(g => g.id === match?.gameId);

                return (
                  <>
                    <div className="mb-6">
                      <div className="text-sm text-gray-600 mb-2">{game?.name}</div>
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="text-center">
                          <div className="text-3xl mb-1">{team1?.logo}</div>
                          <div className="font-medium">{team1?.name}</div>
                        </div>
                        <span className="text-2xl text-gray-400">vs</span>
                        <div className="text-center">
                          <div className="text-3xl mb-1">{team2?.logo}</div>
                          <div className="font-medium">{team2?.name}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 text-center">
                        {match?.date} • {match?.time} • {match?.venue}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Predicted Winner *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setPredictedWinner(team1?.id || '')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              predictedWinner === team1?.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="text-3xl mb-1">{team1?.logo}</div>
                            <div className="font-medium text-sm">{team1?.name}</div>
                          </button>
                          <button
                            onClick={() => setPredictedWinner(team2?.id || '')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              predictedWinner === team2?.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="text-3xl mb-1">{team2?.logo}</div>
                            <div className="font-medium text-sm">{team2?.name}</div>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Predicted Score (Optional - for bonus points)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-600">{team1?.name}</label>
                            <input
                              type="number"
                              value={predictedScores.team1}
                              onChange={(e) => setPredictedScores({ ...predictedScores, team1: Number(e.target.value) })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">{team2?.name}</label>
                            <input
                              type="number"
                              value={predictedScores.team2}
                              onChange={(e) => setPredictedScores({ ...predictedScores, team2: Number(e.target.value) })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-xs font-medium text-blue-900 mb-2">Scoring System:</div>
                        <ul className="text-xs text-blue-800 space-y-1">
                          <li>• Correct winner: <strong>10 points</strong></li>
                          <li>• Exact score: <strong>20 bonus points</strong></li>
                        </ul>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleSubmitPrediction}
                          disabled={!predictedWinner || loading}
                          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-green-400 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Saving...' : 'Submit Prediction'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMatch(null);
                            setPredictedWinner('');
                            setPredictedScores({ team1: 0, team2: 0 });
                          }}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Past Predictions
              </h3>

              {completedMatches.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No completed matches yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {completedMatches.map((match) => {
                    const team1 = teams.find(t => t.id === match.team1Id);
                    const team2 = teams.find(t => t.id === match.team2Id);
                    const game = games.find(g => g.id === match.gameId);
                    const myPrediction = myPredictions.find(p => p.matchId === match.id);
                    const points = myPrediction ? calculatePoints(myPrediction, match) : 0;
                    const isCorrect = myPrediction?.predictedWinnerId === match.winnerId;

                    return (
                      <div
                        key={match.id}
                        className={`border rounded-lg p-4 ${
                          isCorrect ? 'border-green-300 bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-600">{game?.name}</span>
                          {myPrediction ? (
                            <div className="flex items-center gap-2">
                              {isCorrect ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span className={`text-sm font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                +{points} pts
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">No prediction</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{team1?.logo} {team1?.name}</span>
                          <span className="font-bold">{match.team1Score}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>{team2?.logo} {team2?.name}</span>
                          <span className="font-bold">{match.team2Score}</span>
                        </div>

                        {myPrediction && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="text-xs text-gray-600">
                              Your prediction: {teams.find(t => t.id === myPrediction.predictedWinnerId)?.name}
                              {myPrediction.predictedScore && (
                                <> ({myPrediction.predictedScore.team1} - {myPrediction.predictedScore.team2})</>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
