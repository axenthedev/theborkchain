
import React from 'react';
import { cn } from '@/lib/utils';

interface TaskTabsProps {
  activeTab: 'available' | 'completed';
  onTabChange: (tab: 'available' | 'completed') => void;
}

const TaskTabs: React.FC<TaskTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex space-x-1 p-1 bg-black/30 rounded-xl mb-6 max-w-md">
      <button 
        className={cn(
          "flex-1 py-2 px-4 rounded-lg transition-all text-sm font-medium",
          activeTab === 'available' 
            ? "bg-bork-green text-black" 
            : "bg-transparent text-gray-400 hover:text-white hover:bg-white/5"
        )}
        onClick={() => onTabChange('available')}
      >
        Available Tasks
      </button>
      <button 
        className={cn(
          "flex-1 py-2 px-4 rounded-lg transition-all text-sm font-medium",
          activeTab === 'completed' 
            ? "bg-bork-green text-black" 
            : "bg-transparent text-gray-400 hover:text-white hover:bg-white/5"
        )}
        onClick={() => onTabChange('completed')}
      >
        Completed Tasks
      </button>
    </div>
  );
};

export default TaskTabs;
