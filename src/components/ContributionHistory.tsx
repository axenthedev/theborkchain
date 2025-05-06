
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { getBadgeTierByAmount, BadgeTier } from './FundraiserBadge';

export interface Contribution {
  id: string;
  wallet_address: string;
  amount: number;
  currency: string;
  created_at: string;
  badge_tier?: BadgeTier;
}

interface ContributionHistoryProps {
  contributions: Contribution[];
  userWallet?: string;
}

const ContributionHistory: React.FC<ContributionHistoryProps> = ({ 
  contributions,
  userWallet
}) => {
  // Filter by user wallet if provided
  const filteredContributions = userWallet 
    ? contributions.filter(c => c.wallet_address === userWallet)
    : contributions;
    
  if (filteredContributions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No contributions found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredContributions.map((contribution) => {
        const badgeTier = getBadgeTierByAmount(contribution.amount);
        const date = new Date(contribution.created_at);
        
        return (
          <div key={contribution.id} className="bg-black/30 border border-bork-green/20 rounded-lg p-4 flex flex-col sm:flex-row justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={badgeTier.badgeVariant}>{badgeTier.name}</Badge>
                <span className="text-sm text-gray-400">
                  {formatDistanceToNow(date, { addSuffix: true })}
                </span>
              </div>
              
              <p className="text-lg font-medium text-white">
                {contribution.amount.toLocaleString()} {contribution.currency}
              </p>
              
              <p className="text-sm text-gray-400 truncate">
                From: {contribution.wallet_address.slice(0, 6)}...{contribution.wallet_address.slice(-4)}
              </p>
            </div>
            
            <div className="mt-2 sm:mt-0 flex items-center">
              <span className="text-xs text-gray-500">
                {date.toLocaleDateString()} {date.toLocaleTimeString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContributionHistory;
