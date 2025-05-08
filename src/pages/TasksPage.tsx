
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBork } from '@/context/BorkContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import BorkDog from '@/components/BorkDog';
import { ArrowRight, Award, Calendar, CheckCircle, Clock, Flame, Gift, Sparkles, Star, Target, Trophy, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export type TaskFrequency = 'daily' | 'weekly' | 'one-time';

const TasksPage = () => {
  const { connected, connectWallet, tasks, completeTask, balance, account, streak } = useBork();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available');
  const [animateReward, setAnimateReward] = useState<{taskId: string, amount: number} | null>(null);
  
  // Filter tasks based on completion status
  const availableTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
  // Calculate completion percentage
  const completionPercentage = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;
  
  // Handle task completion with animation
  const handleCompleteTask = async (taskId: string) => {
    setIsLoading(true);
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
      setAnimateReward({taskId: task.id, amount: task.reward});
      
      const success = await completeTask(taskId);
      if (!success) {
        setAnimateReward(null);
      }
      
      setTimeout(() => {
        setAnimateReward(null);
      }, 2000);
    }
    
    setIsLoading(false);
  };
  
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

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {connected ? (
        <div className="space-y-8">
          {/* Stats Section */}
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
                      {completedTasks.length} <span className="text-sm text-gray-400 font-normal">/ {tasks.length}</span>
                    </h3>
                    <Progress 
                      value={completionPercentage} 
                      className="h-2 mt-1 bg-white/10" 
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
                      +5 $BORK daily
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Mascot and title */}
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
          
          {/* Task Tabs */}
          <div className="flex space-x-1 p-1 bg-black/30 rounded-xl mb-6 max-w-md">
            <button 
              className={cn(
                "flex-1 py-2 px-4 rounded-lg transition-all text-sm font-medium",
                activeTab === 'available' 
                  ? "bg-bork-green text-black" 
                  : "bg-transparent text-gray-400 hover:text-white hover:bg-white/5"
              )}
              onClick={() => setActiveTab('available')}
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
              onClick={() => setActiveTab('completed')}
            >
              Completed Tasks
            </button>
          </div>
          
          {/* Available Tasks */}
          {activeTab === 'available' && (
            <div className="space-y-6">
              {availableTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center">
                    <Gift className="h-8 w-8 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-300 mb-2">All tasks completed!</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    You've completed all available tasks. Check back soon for new tasks to earn more $BORK!
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {availableTasks.map((task) => {
                    const difficultyDetails = getDifficultyDetails(task.difficulty);
                    const frequencyDetails = getFrequencyDetails(task.type);
                    
                    return (
                      <Card 
                        key={task.id} 
                        className="glassmorphism group rounded-xl border-bork-green/30 hover:border-bork-green transition-all duration-300 overflow-hidden"
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
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyDetails.color}`}>
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
                              onClick={() => handleCompleteTask(task.id)}
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
                  })}
                </div>
              )}
            </div>
          )}
          
          {/* Completed Tasks */}
          {activeTab === 'completed' && (
            <div className="space-y-6">
              {completedTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-300 mb-2">No completed tasks yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Start completing tasks to earn $BORK rewards and see your progress here!
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {completedTasks.map((task) => {
                    const difficultyDetails = getDifficultyDetails(task.difficulty);
                    const frequencyDetails = getFrequencyDetails(task.type);
                    
                    return (
                      <Card 
                        key={task.id} 
                        className="glassmorphism rounded-xl border-gray-800 bg-black/40"
                      >
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
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-8 relative">
            <BorkDog size="large" className="w-40 h-40 animate-bounce-small" />
            <div className="absolute -bottom-4 -right-4 bg-black rounded-full p-1">
              <Wallet className="h-8 w-8 text-bork-green animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-8 text-center max-w-md">
            Connect your wallet to view available tasks and start earning $BORK rewards!
          </p>
          
          <Button 
            onClick={connectWallet}
            size="lg"
            className="px-8 py-6 h-auto text-lg font-bold"
          >
            <Wallet className="mr-2 h-5 w-5" />
            Connect Wallet
          </Button>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
