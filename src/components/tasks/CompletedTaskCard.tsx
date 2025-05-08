
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Calendar, CheckCircle, Clock, Target } from 'lucide-react';
import { Task } from '@/context/BorkContext';

export type TaskFrequency = 'daily' | 'weekly' | 'one-time';

interface CompletedTaskCardProps {
  task: Task;
}

const CompletedTaskCard: React.FC<CompletedTaskCardProps> = ({ task }) => {
  // Get frequency icon and label
  const getFrequencyDetails = (frequency: TaskFrequency) => {
    switch(frequency) {
      case 'daily':
        return { 
          icon: <Calendar className="h-5 w-5 text-gray-500" />, 
          label: 'Daily'
        };
      case 'weekly':
        return { 
          icon: <Clock className="h-5 w-5 text-gray-500" />, 
          label: 'Weekly'
        };
      case 'one-time':
        return { 
          icon: <Target className="h-5 w-5 text-gray-500" />, 
          label: 'One-time'
        };
      default:
        return { 
          icon: <Target className="h-5 w-5 text-gray-500" />, 
          label: 'One-time'
        };
    }
  };
  
  const frequencyDetails = getFrequencyDetails(task.type as TaskFrequency);
  
  return (
    <Card className="glassmorphism rounded-xl border-gray-800 bg-black/50">
      <CardContent className="p-6 relative">
        <div className="absolute top-4 right-4">
          <div className="h-8 w-8 rounded-full bg-bork-green/20 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-bork-green" />
          </div>
        </div>
        
        <div className="mb-6 pr-8">
          <h3 className="text-lg font-bold text-gray-400 line-through decoration-2 mb-2">
            {task.title}
          </h3>
          
          <p className="text-gray-500 text-sm mb-4 line-through decoration-1">
            {task.description}
          </p>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-xs text-gray-600">
              {frequencyDetails.icon}
              <span className="ml-1">{frequencyDetails.label}</span>
            </div>
            
            <div className="flex items-center text-xs">
              <Award className="h-4 w-4 text-gray-500 mr-1" />
              <span className="font-bold text-gray-500">{task.reward}</span>
              <span className="ml-1 text-gray-600">$BORK</span>
            </div>
          </div>
        </div>
        
        <div className="text-gray-500 text-sm italic">
          Completed
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletedTaskCard;
