
import React from 'react';
import { CheckCircle, Gift } from 'lucide-react';

interface EmptyStateProps {
  type: 'available' | 'completed';
}

const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  if (type === 'available') {
    return (
      <div className="text-center py-12">
        <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center">
          <Gift className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-xl font-medium text-gray-300 mb-2">All tasks completed!</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          You've completed all available tasks. Check back soon for new tasks to earn more $BORK!
        </p>
      </div>
    );
  }
  
  return (
    <div className="text-center py-12">
      <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-gray-500" />
      </div>
      <h3 className="text-xl font-medium text-gray-300 mb-2">No completed tasks yet</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        Start completing tasks to earn $BORK rewards and see your progress here!
      </p>
    </div>
  );
};

export default EmptyState;
