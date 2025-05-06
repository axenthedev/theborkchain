
import React from 'react';
import { Award, Star, Gem, CircleDollarSign, Trophy, BadgeDollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

export type BadgeTier = 
  | 'pup_supporter' 
  | 'pack_leader' 
  | 'alpha_bork' 
  | 'bork_og' 
  | 'mega_bork' 
  | 'borkchain_team';

export interface BadgeInfo {
  id: BadgeTier;
  name: string;
  icon: React.ReactNode;
  minAmount: number;
  maxAmount: number | null;
  benefits: string[];
  badgeVariant: 
    | 'supporter'
    | 'leader'
    | 'alpha'
    | 'og'
    | 'mega'
    | 'team';
}

export const BADGE_TIERS: BadgeInfo[] = [
  {
    id: 'pup_supporter',
    name: 'Pup Supporter',
    icon: <BadgeDollarSign className="h-6 w-6 text-emerald-400" />,
    minAmount: 5,
    maxAmount: 19,
    benefits: [
      'Access to BorkChain community channels',
      'Early updates on project development',
      'Pup Supporter badge on profile',
    ],
    badgeVariant: 'supporter',
  },
  {
    id: 'pack_leader',
    name: 'Pack Leader',
    icon: <Star className="h-6 w-6 text-blue-400" />,
    minAmount: 20,
    maxAmount: 99,
    benefits: [
      'All Pup Supporter benefits',
      'Exclusive Pack Leader community access',
      'Priority access to future airdrops',
      'Participation in community polls',
    ],
    badgeVariant: 'leader',
  },
  {
    id: 'alpha_bork',
    name: 'Alpha Bork',
    icon: <Award className="h-6 w-6 text-yellow-400" />,
    minAmount: 100,
    maxAmount: 499,
    benefits: [
      'All Pack Leader benefits',
      'Enhanced airdrop allocation',
      'Exclusive BorkChain Alpha events',
      'Early access to new features',
    ],
    badgeVariant: 'alpha',
  },
  {
    id: 'bork_og',
    name: 'Bork OG',
    icon: <Gem className="h-6 w-6 text-purple-400" />,
    minAmount: 500,
    maxAmount: 999,
    benefits: [
      'All Alpha Bork benefits',
      'Special OG community recognition',
      'Guaranteed token allocation in future events',
      'Monthly AMAs with BorkChain team',
      'Priority technical support',
    ],
    badgeVariant: 'og',
  },
  {
    id: 'mega_bork',
    name: 'Mega Bork',
    icon: <Trophy className="h-6 w-6 text-red-400" />,
    minAmount: 1000,
    maxAmount: 4999,
    benefits: [
      'All Bork OG benefits',
      'VIP access to all BorkChain events',
      'Monthly strategy sessions with team',
      'Custom profile features',
      'Priority feature requests',
    ],
    badgeVariant: 'mega',
  },
  {
    id: 'borkchain_team',
    name: 'BorkChain Team',
    icon: <CircleDollarSign className="h-6 w-6 text-white" />,
    minAmount: 5000,
    maxAmount: null,
    benefits: [
      'All Mega Bork benefits',
      'Direct access to BorkChain founders',
      'Recognized partner on BorkChain website',
      'Special mentions in project announcements',
      'Early access to all product updates',
      'Exclusive strategic partnership opportunities',
    ],
    badgeVariant: 'team',
  },
];

export const getBadgeTierByAmount = (amount: number): BadgeInfo => {
  return BADGE_TIERS.find(
    tier => amount >= tier.minAmount && (tier.maxAmount === null || amount <= tier.maxAmount)
  ) || BADGE_TIERS[0];
};

interface FundraiserBadgeProps {
  tier: BadgeInfo;
  className?: string;
  showBenefits?: boolean;
  animated?: boolean;
}

const FundraiserBadge: React.FC<FundraiserBadgeProps> = ({ 
  tier, 
  className, 
  showBenefits = false,
  animated = true
}) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div 
          className={cn(
            "flex flex-col items-center p-4 rounded-xl border transition-all duration-300",
            animated && "hover:scale-105 hover:shadow-[0_0_15px_rgba(57,255,20,0.3)]",
            className
          )}
        >
          <div className="p-3 rounded-full bg-black/30 border border-bork-green/30 mb-3">
            {tier.icon}
          </div>
          
          <h3 className="font-bold text-white text-lg mb-1">{tier.name}</h3>
          
          <Badge variant={tier.badgeVariant} className="mb-2">
            {tier.maxAmount 
              ? `$${tier.minAmount} - $${tier.maxAmount}` 
              : `$${tier.minAmount}+`}
          </Badge>
          
          {showBenefits && (
            <ul className="text-sm text-gray-300 mt-3 list-disc list-inside space-y-1">
              {tier.benefits.slice(0, 3).map((benefit, idx) => (
                <li key={idx} className="text-left">{benefit}</li>
              ))}
              {tier.benefits.length > 3 && (
                <li className="text-left text-bork-green">+ {tier.benefits.length - 3} more benefits</li>
              )}
            </ul>
          )}
        </div>
      </HoverCardTrigger>
      
      <HoverCardContent className="w-80 bg-black/80 border border-bork-green/30 text-white backdrop-blur">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {tier.icon}
            <h4 className="font-bold">{tier.name}</h4>
          </div>
          <Badge variant={tier.badgeVariant}>
            {tier.maxAmount 
              ? `$${tier.minAmount} - $${tier.maxAmount}` 
              : `$${tier.minAmount}+`}
          </Badge>
        </div>
        
        <div className="mt-3">
          <h5 className="text-sm font-medium mb-2 text-bork-green">Benefits:</h5>
          <ul className="text-xs space-y-1">
            {tier.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="text-bork-green">•</span> 
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default FundraiserBadge;
