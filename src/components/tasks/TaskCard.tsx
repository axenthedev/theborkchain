
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowRight, Award, Calendar, CheckCircle, 
  Clock, Sparkles, Star, Target 
} from 'lucide-react';
import { Task } from '@/context/BorkContext';

export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export type TaskFrequency = 'daily' | 'weekly' | 'one-time';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => Promise<void>;
  isLoading: boolean;
  animateReward: {taskId: string, amount: number} | null;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onComplete, 
  isLoading, 
  animateReward 
}) => {
  // Get difficulty icon and color
  const getDifficultyDetails = (difficulty: TaskDifficulty) => {
    switch(difficulty) {
      case 'easy':
        return { 
          icon: <Star className="h-5 w-5 text-green-400" />, 
          label: 'Easy',
          color: 'bg-green-400/20 text-green-400'
        };
      case 'medium':
        return { 
          icon: <Star className="h-5 w-5 text-yellow-400" />, 
          label: 'Medium',
          color: 'bg-yellow-400/20 text-yellow-400'
        };
      case 'hard':
        return { 
          icon: <Star className="h-5 w-5 text-red-400" />, 
          label: 'Hard',
          color: 'bg-red-400/20 text-red-400'
        };
      default:
        return { 
          icon: <Star className="h-5 w-5 text-green-400" />, 
          label: 'Easy',
          color: 'bg-green-400/20 text-green-400'
        };
    }
  };
  
  // Get frequency icon and label
  const getFrequencyDetails = (frequency: TaskFrequency) => {
    switch(frequency) {
      case 'daily':
        return { 
          icon: <Calendar className="h-5 w-5 text-bork-green" />, 
          label: 'Daily'
        };
      case 'weekly':
        return { 
          icon: <Clock className="h-5 w-5 text-bork-green" />, 
          label: 'Weekly'
        };
      case 'one-time':
        return { 
          icon: <Target className="h-5 w-5 text-bork-green" />, 
          label: 'One-time'
        };
      default:
        return { 
          icon: <Target className="h-5 w-5 text-bork-green" />, 
          label: 'One-time'
        };
    }
  };
  
  const difficultyDetails = getDifficultyDetails(task.difficulty as TaskDifficulty);
  const frequencyDetails = getFrequencyDetails(task.type as TaskFrequency);
  
  return (
    <Card 
      className="glassmorphism group rounded-xl border-bork-green/30 hover:border-bork-green transition-all duration-300 overflow-hidden bg-black/50"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-bork-green via-bork-green/80 to-transparent" />
      
      <CardContent className="p-6 relative">
        {/* Animated particles */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <Sparkles className="h-5 w-5 text-bork-green/60 animate-pulse" />
        </div>
        
        {/* Task content */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold group-hover:text-bork-green transition-colors duration-300">
              {task.title}
            </h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${difficultyDetails.color}`}>
              {difficultyDetails.icon}
              <span className="ml-1">{difficultyDetails.label}</span>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm mb-4">
            {task.description}
          </p>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-xs text-gray-400">
              {frequencyDetails.icon}
              <span className="ml-1">{frequencyDetails.label}</span>
            </div>
            
            <div className="flex items-center text-xs">
              <Award className="h-4 w-4 text-bork-green mr-1" />
              <span className="font-bold text-bork-green">{task.reward}</span>
              <span className="ml-1 text-gray-400">$BORK</span>
            </div>
          </div>
        </div>
        
        {/* Task actions */}
        <div className="flex justify-between items-center">
          {task.destinationUrl && (
            <a 
              href={task.destinationUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-bork-green text-sm font-medium hover:underline flex items-center"
            >
              View Details
              <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          )}
          
          <Button 
            onClick={() => onComplete(task.id)}
            disabled={isLoading}
            className="ml-auto relative overflow-hidden group"
          >
            {animateReward && animateReward.taskId === task.id && (
              <span 
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-bork-green font-bold animate-float"
              >
                +{animateReward.amount}
              </span>
            )}
            <CheckCircle className="mr-2" />
            Complete Task
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
