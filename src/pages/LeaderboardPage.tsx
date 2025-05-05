
import React, { useState, useEffect } from 'react';
import { useBork } from '@/context/BorkContext';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import BorkDog from '@/components/BorkDog';
import { Award, List } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  address: string;
  balance: number;
  total_earned: number;
  rank: number;
}

const LeaderboardPage = () => {
  const { connected, connectWallet } = useBork();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('id, address, balance, total_earned')
          .order('total_earned', { ascending: false })
          .limit(100);

        if (error) {
          console.error('Error fetching leaderboard:', error);
          return;
        }

        // Add rank to each entry
        const rankedData = data.map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));

        setLeaderboard(rankedData);
      } catch (error) {
        console.error('Error in fetchLeaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    
    // Set up a refresh interval
    const intervalId = setInterval(fetchLeaderboard, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <BorkDog size="medium" />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-bork-green neon-text">$BORK</span> Leaderboard
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Top Bork holders and earners ranked by total $BORK earned through tasks and referrals.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bork-card overflow-hidden shadow-[0_0_25px_rgba(57,255,20,0.15)] bg-black/90 backdrop-blur-lg border-bork-green/40">
            {/* Leaderboard Header */}
            <div className="grid grid-cols-12 bg-black/70 p-4 font-bold text-white border-b border-bork-green/30">
              <div className="col-span-2 text-center">Rank</div>
              <div className="col-span-4">Address</div>
              <div className="col-span-3 text-right">Current Balance</div>
              <div className="col-span-3 text-right">Total Earned</div>
            </div>

            {/* Leaderboard Body */}
            <div className="max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-20 text-center">
                  <div className="animate-spin h-8 w-8 border-2 border-bork-green border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading leaderboard data...</p>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="p-20 text-center">
                  <List className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400">No leaderboard data available yet.</p>
                </div>
              ) : (
                leaderboard.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="grid grid-cols-12 p-4 border-b border-white/5 hover:bg-black/50 transition-colors animate-fade-in"
                  >
                    {/* Rank */}
                    <div className="col-span-2 text-center flex justify-center items-center">
                      {entry.rank <= 3 ? (
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full 
                          ${entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' : 
                            entry.rank === 2 ? 'bg-gray-400/20 text-gray-400' : 
                            'bg-amber-700/20 text-amber-700'}`}
                        >
                          <Award className="w-5 h-5" />
                        </div>
                      ) : (
                        <span className="text-gray-400">{entry.rank}</span>
                      )}
                    </div>
                    
                    {/* Address */}
                    <div className="col-span-4 flex items-center">
                      <span className="font-mono">{truncateAddress(entry.address)}</span>
                    </div>
                    
                    {/* Current Balance */}
                    <div className="col-span-3 text-right">
                      <span className="font-bold text-bork-green">{entry.balance}</span> $BORK
                    </div>
                    
                    {/* Total Earned */}
                    <div className="col-span-3 text-right">
                      <span className="font-bold text-white">{entry.total_earned}</span> $BORK
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
          
          {/* Bottom Card */}
          <div className="text-center mt-8">
            {!connected ? (
              <Card className="bork-card p-6 inline-block">
                <p className="text-gray-400 mb-4">Connect your wallet to see your rank on the leaderboard</p>
                <button 
                  onClick={connectWallet}
                  className="bork-button bg-bork-green text-black px-6 py-2 rounded font-bold hover:bg-bork-green/90 transition-colors"
                >
                  Connect Wallet
                </button>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
