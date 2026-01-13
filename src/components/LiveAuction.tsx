import React, { useState, useEffect } from 'react';
import { useAppContext } from '../App';
import { Gavel, DollarSign, Clock, Users } from 'lucide-react';
import { auctionApi, subscribeToAuction } from '../utils/api';
import { toast } from 'sonner';

export function LiveAuction() {
  const { 
    user, 
    teams, 
    players, 
    setPlayers,
    setTeams 
  } = useAppContext();

  const [auctionStatus, setAuctionStatus] = useState<any>(null);
  const [myBid, setMyBid] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const myTeam = user?.role === 'team_owner' ? teams.find(t => t.id === user.teamId) : null;
  const currentAuctionPlayer = auctionStatus?.currentPlayer;
  const currentBids = auctionStatus?.currentBids || [];
  const auctionActive = auctionStatus?.active || false;
  const canBid = myTeam && currentAuctionPlayer && auctionActive;
  const remainingBudget = myTeam ? myTeam.budget - myTeam.spent : 0;

  const highestBid = currentBids.length > 0 
    ? currentBids.reduce((max: any, bid: any) => bid.amount > max.amount ? bid : max, currentBids[0])
    : null;

  const currentHighestAmount = highestBid?.amount || currentAuctionPlayer?.basePrice || 0;

  // Subscribe to auction updates
  useEffect(() => {
    const loadAuctionStatus = async () => {
      try {
        const status = await auctionApi.getStatus();
        setAuctionStatus(status);
      } catch (error) {
        console.error('Failed to load auction status:', error);
      }
    };

    loadAuctionStatus();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToAuction((status) => {
      setAuctionStatus(status);
      
      // Reset timer when a new bid is placed
      if (status.currentBids?.length > currentBids.length) {
        setTimeLeft(30);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (auctionActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [auctionActive, timeLeft]);

  const handlePlaceBid = async () => {
    if (!canBid || !myTeam || !currentAuctionPlayer) return;

    const minBid = currentHighestAmount + 100;

    if (myBid < minBid) {
      toast.error(`Minimum bid is $${minBid.toLocaleString()}`);
      return;
    }

    if (myBid > remainingBudget) {
      toast.error('Insufficient budget!');
      return;
    }

    setLoading(true);
    try {
      await auctionApi.placeBid(myTeam.id, myBid);
      toast.success(`Bid placed: $${myBid.toLocaleString()}`);
      setMyBid(0);
      setTimeLeft(30); // Reset timer
    } catch (error: any) {
      console.error('Failed to place bid:', error);
      toast.error(error.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  const quickBid = (increment: number) => {
    const newBid = currentHighestAmount + increment;
    if (newBid <= remainingBudget) {
      setMyBid(newBid);
    } else {
      toast.error('Insufficient budget!');
    }
  };

  if (!auctionActive) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <Gavel className="w-24 h-24 mx-auto mb-6 text-gray-400" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Auction Not Active</h2>
          <p className="text-gray-600 mb-6">
            The auction hasn't started yet. Come back when the admin starts the live auction.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="font-bold mb-2">What is the Auction?</h3>
            <p className="text-sm text-gray-700">
              Team owners compete to acquire player couples by placing bids. The highest bidder wins
              the player for their team within their budget constraints.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentAuctionPlayer) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <Clock className="w-24 h-24 mx-auto mb-6 text-gray-400" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Waiting for Next Player</h2>
          <p className="text-gray-600">The admin is preparing the next player for auction...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl p-8 text-white mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Gavel className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">🔴 Live Auction</h1>
              <p className="text-red-100">Real-time player bidding in progress</p>
            </div>
          </div>
          <div className="text-center">
            <div className={`text-6xl font-bold ${timeLeft <= 10 ? 'animate-pulse' : ''}`}>
              {timeLeft}
            </div>
            <div className="text-sm text-red-100">seconds left</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Player */}
        <div className="lg:col-span-2">
          <div className="bg-white border-4 border-yellow-400 rounded-2xl p-8 mb-6">
            <div className="text-center mb-6">
              <span className="inline-block px-4 py-2 bg-yellow-400 text-yellow-900 rounded-full font-bold mb-4">
                NOW ON AUCTION
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                {currentAuctionPlayer.husbandName} & {currentAuctionPlayer.wifeName}
              </h2>
              <div className="flex items-center justify-center gap-6 text-gray-600">
                <span>Age: {currentAuctionPlayer.age}</span>
                <span>•</span>
                <span className="capitalize">Playing: {currentAuctionPlayer.playingPreference}</span>
                <span>•</span>
                <span>Skill: {currentAuctionPlayer.skillRating}/10</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <div className="text-sm text-blue-600 mb-1">Base Price</div>
                <div className="text-3xl font-bold text-blue-900">
                  ${currentAuctionPlayer.basePrice.toLocaleString()}
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-6 text-center">
                <div className="text-sm text-green-600 mb-1">Current Highest Bid</div>
                <div className="text-3xl font-bold text-green-900">
                  ${currentHighestAmount.toLocaleString()}
                </div>
                {highestBid && (
                  <div className="text-sm text-gray-600 mt-1">
                    by {teams.find(t => t.id === highestBid.teamId)?.name || 'Unknown Team'}
                  </div>
                )}
              </div>
            </div>

            {/* Bidding Section - Only for Team Owners */}
            {user?.role === 'team_owner' && myTeam && (
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">Your Budget Remaining:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${remainingBudget.toLocaleString()}
                    </span>
                  </div>
                  {highestBid?.teamId === myTeam.id && (
                    <div className="bg-green-100 border border-green-200 rounded-lg p-3 text-center">
                      <span className="text-green-700 font-bold">🎉 You have the highest bid!</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Your Bid (Min: ${(currentHighestAmount + 100).toLocaleString()})
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={myBid || ''}
                      onChange={(e) => setMyBid(Number(e.target.value))}
                      placeholder={`${currentHighestAmount + 100}`}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg font-medium"
                      min={currentHighestAmount + 100}
                      step={100}
                    />
                    <button
                      onClick={handlePlaceBid}
                      disabled={!myBid || myBid <= currentHighestAmount || loading}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Placing...' : 'Place Bid'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => quickBid(100)}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium"
                  >
                    +$100
                  </button>
                  <button
                    onClick={() => quickBid(500)}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium"
                  >
                    +$500
                  </button>
                  <button
                    onClick={() => quickBid(1000)}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium"
                  >
                    +$1,000
                  </button>
                  <button
                    onClick={() => quickBid(2000)}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium"
                  >
                    +$2,000
                  </button>
                </div>
              </div>
            )}

            {/* Viewer Mode */}
            {user?.role === 'user' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-blue-700">
                  You are watching the auction as a viewer. Only team owners can place bids.
                </p>
              </div>
            )}

            {/* Not Logged In */}
            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-700">
                  Please log in to participate in the auction.
                </p>
              </div>
            )}
          </div>

          {/* Bid History */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Bid History
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {currentBids.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No bids placed yet</p>
              ) : (
                [...currentBids].reverse().map((bid: any, index: number) => {
                  const team = teams.find(t => t.id === bid.teamId);
                  return (
                    <div
                      key={bid.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{team?.logo || '🏆'}</div>
                        <div>
                          <div className="font-medium">{team?.name || 'Unknown Team'}</div>
                          <div className="text-xs text-gray-600">
                            {new Date(bid.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-green-600">
                        ${bid.amount.toLocaleString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Teams Panel */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Participating Teams
            </h3>
            <div className="space-y-3">
              {teams.filter(t => t.active).map((team) => (
                <div
                  key={team.id}
                  className={`border rounded-lg p-4 ${
                    team.id === myTeam?.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">{team.logo}</div>
                    <div className="flex-1">
                      <div className="font-bold">{team.name}</div>
                      <div className="text-xs text-gray-600">{team.ownerName}</div>
                    </div>
                    {team.id === myTeam?.id && (
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-medium">${team.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Spent:</span>
                      <span className="font-medium text-red-600">${team.spent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-medium text-green-600">
                        ${(team.budget - team.spent).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Players:</span>
                      <span className="font-medium">{team.players.length}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Player Stats */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-bold text-xl mb-4">Player Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Eligible Games:</span>
                <span className="font-medium">{currentAuctionPlayer.games.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Skill Rating:</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{currentAuctionPlayer.skillRating}/10</span>
                  <div className="flex gap-0.5">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < currentAuctionPlayer.skillRating ? 'bg-yellow-400' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Playing Preference:</span>
                <span className="font-medium capitalize">{currentAuctionPlayer.playingPreference}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
