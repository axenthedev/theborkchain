
import React, { useState } from 'react';
import { useBork } from '@/context/BorkContext';
import BorkDog from '@/components/BorkDog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ReferralsPage = () => {
  const { connected, connectWallet, referralCode, copyReferralLink, referrals, users } = useBork();
  const [copied, setCopied] = useState(false);
  
  const referralLink = `https://borkchain.io/ref/${referralCode}`;
  
  const handleCopyLink = () => {
    copyReferralLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const referralUsers = users.filter(user => 
    referrals.includes(user.address) || user.referredBy === referralCode
  );
  
  const totalReferralEarnings = referralUsers.length * 100; // Placeholder 100 BORK per referral

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">
          <span className="text-bork-green neon-text">Referrals</span> & Rewards
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side */}
          <div className="lg:col-span-1">
            <Card className="bork-card mb-6">
              <div className="flex justify-center mb-4">
                <BorkDog size="small" />
              </div>
              
              <h2 className="text-xl font-bold mb-6 text-center">Your Referral Link</h2>
              
              {connected ? (
                <>
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-2">Share this link with friends:</div>
                    <div className="flex gap-2">
                      <Input 
                        value={referralLink}
                        readOnly
                        className="bork-input"
                      />
                      <Button 
                        onClick={handleCopyLink} 
                        className={`bork-button whitespace-nowrap ${copied ? 'bg-green-600' : ''}`}
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <div className="text-sm text-gray-400 mb-2">Or share your code:</div>
                    <div className="bg-black/50 border border-bork-green/30 rounded-md px-4 py-3 text-center">
                      <span className="text-xl font-bold text-bork-green">{referralCode}</span>
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
                </>
              ) : (
                <div className="text-center">
                  <p className="text-gray-400 mb-4">Connect your wallet to get your referral link and start earning rewards.</p>
                  <Button onClick={connectWallet} className="bork-button">
                    Connect Wallet
                  </Button>
                </div>
              )}
            </Card>
            
            <Card className="bork-card">
              <h3 className="text-lg font-bold mb-4">Referral Stats</h3>
              
              {connected ? (
                <div className="space-y-4">
                  <div className="bg-black/50 rounded-lg p-4 border border-bork-green/30">
                    <div className="text-sm text-gray-400">Total Referrals</div>
                    <div className="text-2xl font-bold text-bork-green">{referralUsers.length}</div>
                  </div>
                  
                  <div className="bg-black/50 rounded-lg p-4 border border-white/10">
                    <div className="text-sm text-gray-400">Total Earnings</div>
                    <div className="text-2xl font-bold text-white">{totalReferralEarnings} $BORK</div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">Connect your wallet to view your referral stats.</p>
              )}
            </Card>
          </div>
          
          {/* Right Side */}
          <div className="lg:col-span-2">
            <Card className="bork-card mb-8">
              <h2 className="text-xl font-bold mb-6">Referral Leaderboard</h2>
              
              {connected ? (
                <div className="overflow-hidden rounded-lg border border-white/10">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-black/50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rank</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Referrals</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="bg-black/30 divide-y divide-white/10">
                      {[
                        { rank: 1, address: '0x3a1...2e8f', referrals: 28, earnings: 2800 },
                        { rank: 2, address: '0x45b...a731', referrals: 21, earnings: 2100 },
                        { rank: 3, address: '0x78c...de22', referrals: 17, earnings: 1700 },
                        { rank: 4, address: '0x92f...1cbd', referrals: 14, earnings: 1400 },
                        { rank: 5, address: '0x6dea...48b2', referrals: 12, earnings: 1200 },
                      ].map((entry) => (
                        <tr key={entry.rank}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-lg font-bold ${entry.rank <= 3 ? 'text-bork-green' : 'text-white'}`}>
                              #{entry.rank}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{entry.address}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{entry.referrals}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-bork-green">{entry.earnings} $BORK</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">Connect your wallet to view the referral leaderboard.</p>
                  <Button onClick={connectWallet} className="bork-button">
                    Connect Wallet
                  </Button>
                </div>
              )}
            </Card>
            
            {connected && (
              <Card className="bork-card">
                <h2 className="text-xl font-bold mb-6">Your Referrals</h2>
                
                {referralUsers.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-white/10">
                    <table className="min-w-full divide-y divide-white/10">
                      <thead className="bg-black/50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Joined</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tasks</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Reward</th>
                        </tr>
                      </thead>
                      <tbody className="bg-black/30 divide-y divide-white/10">
                        {referralUsers.map((user) => (
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
                  <div className="text-center py-8 border border-white/10 rounded-lg">
                    <BorkDog size="small" className="mx-auto mb-4" />
                    <p className="text-gray-400">You don't have any referrals yet.</p>
                    <p className="text-gray-400 mt-2">Share your referral link to start earning!</p>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralsPage;
