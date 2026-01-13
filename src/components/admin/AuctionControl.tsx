import React, { useState, useEffect } from 'react';
import { useAppContext, Player } from '../../App';
import { Play, Pause, Square, Shuffle, CheckCircle, XCircle } from 'lucide-react';
import { auctionApi, playersApi, teamsApi } from '../../utils/api';
import { toast } from 'sonner';

export function AuctionControl() {
  const { 
    players, 
    setPlayers, 
    teams, 
    setTeams
  } = useAppContext();

  const [auctionStatus, setAuctionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  const availablePlayers = players.filter(p => !p.teamId);
  const currentPlayer = auctionStatus?.currentPlayer;
  const currentBids = auctionStatus?.currentBids || [];
  const isActive = auctionStatus?.active || false;

  const highestBid = currentBids.length > 0 
    ? currentBids.reduce((max: any, bid: any) => bid.amount > max.amount ? bid : max, currentBids[0])
    : null;

  // Load auction status
  useEffect(() => {
    loadAuctionStatus();
    const interval = setInterval(loadAuctionStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadAuctionStatus = async () => {
    try {
      const status = await auctionApi.getStatus();
      setAuctionStatus(status);
    } catch (error) {
      console.error('Failed to load auction status:', error);
    }
  };

  const handleStartAuction = async () => {
    if (!selectedPlayerId) {
      toast.error('Please select a player to auction');
      return;
    }

    setLoading(true);
    try {
      await auctionApi.start(selectedPlayerId);
      await loadAuctionStatus();
      toast.success('Auction started!');
    } catch (error: any) {
      console.error('Failed to start auction:', error);
      toast.error(error.message || 'Failed to start auction');
    } finally {
      setLoading(false);
    }
  };

  const handleSellPlayer = async () => {
    if (!currentPlayer) {
      toast.error('No player in auction');
      return;
    }

    if (currentBids.length === 0) {
      if (!confirm('No bids received. Mark player as unsold?')) return;
    }

    setLoading(true);
    try {
      const result = await auctionApi.finalize();
      
      // Refresh data
      const [playersRes, teamsRes] = await Promise.all([
        playersApi.getAll(),
        teamsApi.getAll()
      ]);
      
      setPlayers(playersRes.players);
      setTeams(teamsRes.teams);
      
      await loadAuctionStatus();
      
      if (result.winningBid) {
        toast.success(`Player sold to ${result.winningBid.teamName} for $${result.winningBid.amount.toLocaleString()}!`);
      } else {
        toast.info('Player unsold');
      }
      
      setSelectedPlayerId('');
    } catch (error: any) {
      console.error('Failed to finalize auction:', error);
      toast.error(error.message || 'Failed to finalize auction');
    } finally {
      setLoading(false);
    }
  };

  const handleStopAuction = async () => {
    if (!confirm('Are you sure you want to stop the auction without selling?')) return;

    setLoading(true);
    try {
      await auctionApi.stop();
      await loadAuctionStatus();
      toast.success('Auction stopped');
      setSelectedPlayerId('');
    } catch (error: any) {
      console.error('Failed to stop auction:', error);
      toast.error(error.message || 'Failed to stop auction');
    } finally {
      setLoading(false);
    }
  };

  const selectRandomPlayer = () => {
    if (availablePlayers.length === 0) {
      toast.error('No more players available for auction!');
      return;
    }
    const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
    setSelectedPlayerId(randomPlayer.id);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Auction Control Panel</h2>
        <p className="text-gray-600">Manage live auction sessions and player sales</p>
      </div>

      {/* Auction Status */}
      <div className={`rounded-lg p-6 mb-6 ${
        isActive ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <div>
              <div className="font-bold text-lg">
                {isActive ? '🔴 Auction LIVE' : 'Auction Inactive'}
              </div>
              <div className="text-sm text-gray-600">
                {isActive ? 'Bidding in progress' : 'No active auction session'}
              </div>
            </div>
          </div>
          {isActive && currentPlayer && (
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {currentBids.length} {currentBids.length === 1 ? 'Bid' : 'Bids'}
              </div>
              <div className="text-sm text-gray-600">
                Highest: ${highestBid?.amount.toLocaleString() || currentPlayer.basePrice.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {currentPlayer && (
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600 mb-1">Current Player on Auction:</div>
            <div className="font-bold text-xl">
              {currentPlayer.husbandName} & {currentPlayer.wifeName}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Base Price: ${currentPlayer.basePrice.toLocaleString()} • Skill: {currentPlayer.skillRating}/10
            </div>
          </div>
        )}

        {/* Control Buttons */}
        {!isActive ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Player for Auction
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedPlayerId}
                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">-- Select a player --</option>
                  {availablePlayers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.husbandName} & {player.wifeName} - ${player.basePrice.toLocaleString()} (Skill: {player.skillRating}/10)
                    </option>
                  ))}
                </select>
                <button
                  onClick={selectRandomPlayer}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  disabled={loading || availablePlayers.length === 0}
                >
                  <Shuffle className="w-5 h-5" />
                  Random
                </button>
              </div>
            </div>
            <button
              onClick={handleStartAuction}
              disabled={!selectedPlayerId || loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5" />
              {loading ? 'Starting...' : 'Start Auction'}
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleSellPlayer}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400"
            >
              <CheckCircle className="w-5 h-5" />
              {loading ? 'Processing...' : 'Sell to Highest Bidder'}
            </button>
            <button
              onClick={handleStopAuction}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:bg-gray-400"
            >
              <Square className="w-5 h-5" />
              {loading ? 'Stopping...' : 'Stop Auction'}
            </button>
          </div>
        )}
      </div>

      {/* Current Bids */}
      {isActive && currentPlayer && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">Live Bid Activity</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {currentBids.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No bids placed yet. Waiting for teams to bid...</p>
              </div>
            ) : (
              [...currentBids].reverse().map((bid: any, index: number) => {
                const team = teams.find(t => t.id === bid.teamId);
                return (
                  <div
                    key={bid.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === 0 ? 'bg-green-100 border-2 border-green-300' : 'bg-gray-50'
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
                      {index === 0 && (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full font-bold">
                          HIGHEST
                        </span>
                      )}
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
      )}

      {/* Available Players Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4">Auction Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 mb-1">Total Players</div>
            <div className="text-3xl font-bold text-blue-900">{players.length}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600 mb-1">Available</div>
            <div className="text-3xl font-bold text-green-900">{availablePlayers.length}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600 mb-1">Sold</div>
            <div className="text-3xl font-bold text-purple-900">{players.filter(p => p.teamId).length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
