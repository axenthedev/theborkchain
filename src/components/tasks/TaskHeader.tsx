
import React from 'react';
import BorkDog from '@/components/BorkDog';
import { Trophy } from 'lucide-react';

const TaskHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <div className="relative mr-4">
          <BorkDog size="small" className="w-16 h-16 animate-bounce-small" />
          <div className="absolute -bottom-2 -right-1 bg-black rounded-full p-0.5">
            <Trophy className="h-6 w-6 text-amber-400" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold">Task Dashboard</h1>
          <p className="text-gray-400">Complete tasks to earn $BORK rewards</p>
        </div>
      </div>
    </div>
  );
};

export default TaskHeader;
