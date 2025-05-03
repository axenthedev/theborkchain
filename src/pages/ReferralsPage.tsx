
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useBork } from '@/context/BorkContext';
import BorkDog from '@/components/BorkDog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Link2 } from 'lucide-react';

const ReferralsPage = () => {
  const { connected, connectWallet, referralCode, copyReferralLink, referrals, users, account, getReferralLink } = useBork();
  const [copied, setCopied] = useState(false);
  
  // If not connected, redirect to home
  if (!connected) {
    return <Navigate to="/" replace />;
  }
  
  const referralLink = getReferralLink();
  
  const handleCopyLink = () => {
    copyReferralLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Find all users referred by the current user
  const referredUsers = users.filter(user => 
    user.referredBy === account
  );
  
  // Calculate total referral earnings (100 BORK per referral)
  const totalReferralEarnings = referredUsers.length * 100;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">
          <span className="text-bork-green neon-text">Referrals</span> & Rewards
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side */}
          <div className="lg:col-span-1">
            <Card className="bork-card mb-6 border-bork-green/30 bg-black/50 backdrop-blur-md shadow-[0_0_15px_rgba(57,255,20,0.15)]">
              <div className="flex justify-center mb-4">
                <BorkDog size="small" />
              </div>
              
              <h2 className="text-xl font-bold mb-6 text-center">Your Referral Link</h2>
              
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-2">Share this link with friends:</div>
                <div className="flex gap-2">
                  <Input 
                    value={referralLink}
                    readOnly
                    className="bork-input bg-black/70 border-bork-green/30"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={handleCopyLink} 
                          className={`bork-button whitespace-nowrap ${copied ? 'bg-green-600' : ''}`}
                        >
                          {copied ? (
                            'Copied!'
                          ) : (
                            <>
                              <Copy size={16} className="mr-2" />
                              Copy
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copied ? 'Copied to clipboard!' : 'Copy referral link'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              <div className="border-t border-white/10 pt-4 mt-4">
                <div className="text-sm text-gray-400 mb-2">Or share your wallet address:</div>
                <div className="bg-black/80 border border-bork-green/30 rounded-md px-4 py-3 text-center">
                  <span className="text-md font-bold text-bork-green break-all">{account}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="text-sm text-gray-400 mb-1">How it works:</div>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex gap-2">
                    <span className="text-bork-green">1.</span>
                    <span>Share your referral link with friends</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-bork-green">2.</span>
                    <span>When they join BorkChain, they'll be linked to you</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-bork-green">3.</span>
                    <span>You'll earn 100 $BORK for each verified referral</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-bork-green">4.</span>
                    <span>Your friends also get a 50 $BORK welcome bonus!</span>
                  </li>
                </ul>
              </div>
            </Card>
            
            <Card className="bork-card border-bork-green/30 bg-black/50 backdrop-blur-md shadow-[0_0_15px_rgba(57,255,20,0.15)]">
              <h3 className="text-lg font-bold mb-4">Referral Stats</h3>
              
              <div className="space-y-4">
                <div className="bg-black/60 rounded-lg p-4 border border-bork-green/30">
                  <div className="text-sm text-gray-400">Total Referrals</div>
                  <div className="text-2xl font-bold text-bork-green neon-text">{referredUsers.length}</div>
                </div>
                
                <div className="bg-black/60 rounded-lg p-4 border border-bork-green/30">
                  <div className="text-sm text-gray-400">Total Earnings</div>
                  <div className="text-2xl font-bold text-white">{totalReferralEarnings} $BORK</div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Right Side */}
          <div className="lg:col-span-2">
            <Card className="bork-card mb-8 border-bork-green/30 bg-black/50 backdrop-blur-md shadow-[0_0_15px_rgba(57,255,20,0.15)]">
              <h2 className="text-xl font-bold mb-6">Referral Leaderboard</h2>
              
              <div className="overflow-hidden rounded-lg border border-white/10">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-black/60">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rank</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Referrals</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="bg-black/40 divide-y divide-white/10">
                    {users
                      .map(user => ({
                        ...user,
                        referralCount: users.filter(u => u.referredBy === user.address).length
                      }))
                      .filter(user => user.referralCount > 0)
                      .sort((a, b) => b.referralCount - a.referralCount)
                      .slice(0, 10)
                      .map((user, index) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-lg font-bold ${index < 3 ? 'text-bork-green' : 'text-white'}`}>
                              #{index + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {user.address === account ? `${user.address} (You)` : user.address}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{user.referralCount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-bork-green">{user.referralCount * 100} $BORK</div>
                          </td>
                        </tr>
                      ))}
                    
                    {users.filter(user => users.some(u => u.referredBy === user.address)).length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                          No referrals yet. Be the first on the leaderboard!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
            
            <Card className="bork-card border-bork-green/30 bg-black/50 backdrop-blur-md shadow-[0_0_15px_rgba(57,255,20,0.15)]">
              <h2 className="text-xl font-bold mb-6">Your Referrals</h2>
              
              {referredUsers.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-white/10">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-black/60">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Joined</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tasks</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Reward</th>
                      </tr>
                    </thead>
                    <tbody className="bg-black/40 divide-y divide-white/10">
                      {referredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{user.address}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{new Date(user.joinedAt).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">{user.tasksCompleted.length}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-bork-green">100 $BORK</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 border border-white/10 rounded-lg bg-black/30">
                  <BorkDog size="small" className="mx-auto mb-4" />
                  <p className="text-gray-400">You don't have any referrals yet.</p>
                  <p className="text-gray-400 mt-2">Share your referral link to start earning!</p>
                  
                  <div className="flex justify-center mt-6">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={handleCopyLink} 
                            className="bork-button"
                          >
                            <Link2 size={16} className="mr-2" />
                            Copy Referral Link
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{copied ? 'Copied to clipboard!' : 'Copy referral link'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralsPage;
