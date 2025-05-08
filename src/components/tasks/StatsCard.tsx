
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Flame, Gift, Wallet } from 'lucide-react';

interface StatsCardProps {
  balance: number;
  completedTasksCount: number;
  totalTasksCount: number;
  streak: number;
  streakBonus?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  balance, 
  completedTasksCount, 
  totalTasksCount, 
  streak,
  streakBonus = 50 
}) => {
  // Calculate completion percentage
  const completionPercentage = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100)
    : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="glassmorphism border-bork-green/30 hover:border-bork-green/60 transition-all duration-300">
        <CardContent className="p-6 flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-bork-green/20 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-bork-green" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Balance</p>
            <h3 className="text-2xl font-bold text-white flex items-center">
              <span className="text-bork-green">{balance}</span>
              <span className="ml-2">$BORK</span>
            </h3>
          </div>
        </CardContent>
      </Card>
      
      <Card className="glassmorphism border-bork-green/30 hover:border-bork-green/60 transition-all duration-300">
        <CardContent className="p-6 flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-bork-green/20 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-bork-green" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Tasks Completed</p>
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold text-white">
                {completedTasksCount} <span className="text-sm text-gray-400 font-normal">/ {totalTasksCount}</span>
              </h3>
              <Progress 
                value={completionPercentage} 
                className="h-2 mt-1 bg-black/40" 
                indicatorClassName="bg-bork-green" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="glassmorphism border-bork-green/30 hover:border-bork-green/60 transition-all duration-300">
        <CardContent className="p-6 flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-bork-green/20 flex items-center justify-center">
            <Flame className="h-6 w-6 text-bork-green animate-pulse" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Daily Streak</p>
            <div className="flex items-center">
              <h3 className="text-2xl font-bold text-white">{streak || 0}</h3>
              <div className="ml-3 bg-bork-green/20 text-bork-green text-xs px-2 py-1 rounded-full flex items-center">
                <Gift className="h-3 w-3 mr-1" />
                +{streakBonus} $BORK daily
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCard;
