
import React, { useState } from 'react';
import { useBork } from '@/context/BorkContext';
import BorkDog from '@/components/BorkDog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const TasksPage = () => {
  const { connected, connectWallet, tasks, completeTask, balance } = useBork();
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });
  
  const handleCompleteTask = (taskId: string) => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    completeTask(taskId);
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-500';
      case 'medium': return 'bg-yellow-500/20 text-yellow-500';
      case 'hard': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-500/20 text-blue-500';
      case 'weekly': return 'bg-purple-500/20 text-purple-500';
      case 'one-time': return 'bg-pink-500/20 text-pink-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bork-card mb-6 sticky top-24">
              <div className="flex justify-center mb-4">
                <BorkDog size="small" />
              </div>
              
              <h2 className="text-xl font-bold mb-2 text-center">Your Stats</h2>
              
              {connected ? (
                <>
                  <div className="flex flex-col space-y-4 mt-6">
                    <div className="bg-black/50 rounded-lg p-4 border border-bork-green/30">
                      <div className="text-sm text-gray-400">Balance</div>
                      <div className="text-2xl font-bold text-bork-green">{balance} $BORK</div>
                    </div>
                    
                    <div className="bg-black/50 rounded-lg p-4 border border-white/10">
                      <div className="text-sm text-gray-400">Completed Tasks</div>
                      <div className="text-2xl font-bold text-white">
                        {tasks.filter(t => t.completed).length} / {tasks.length}
                      </div>
                      <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-bork-green h-2.5 rounded-full" 
                          style={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium text-gray-300 mb-2">Task Filters</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${filter === 'all' ? 'bg-bork-green text-black' : 'bg-black/50 text-gray-300'}`}
                        onClick={() => setFilter('all')}
                      >
                        All Tasks
                      </button>
                      <button
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${filter === 'pending' ? 'bg-bork-green text-black' : 'bg-black/50 text-gray-300'}`}
                        onClick={() => setFilter('pending')}
                      >
                        Pending
                      </button>
                      <button
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${filter === 'completed' ? 'bg-bork-green text-black' : 'bg-black/50 text-gray-300'}`}
                        onClick={() => setFilter('completed')}
                      >
                        Completed
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-gray-400 mb-4">Connect your wallet to view your stats and complete tasks.</p>
                  <Button onClick={connectWallet} className="bork-button">
                    Connect Wallet
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">
                <span className="text-bork-green neon-text">$BORK</span> Tasks
              </h1>
              
              <div className="flex gap-2">
                <Badge variant="outline" className="border-bork-green text-bork-green px-3 py-1">
                  Daily Tasks: {tasks.filter(t => t.type === 'daily').length}
                </Badge>
                <Badge variant="outline" className="border-bork-green text-bork-green px-3 py-1">
                  Weekly Tasks: {tasks.filter(t => t.type === 'weekly').length}
                </Badge>
              </div>
            </div>
            
            <Tabs defaultValue="all">
              <TabsList className="bg-black/50 border border-white/10">
                <TabsTrigger value="all" className="data-[state=active]:bg-bork-green data-[state=active]:text-black">All Tasks</TabsTrigger>
                <TabsTrigger value="daily" className="data-[state=active]:bg-bork-green data-[state=active]:text-black">Daily</TabsTrigger>
                <TabsTrigger value="weekly" className="data-[state=active]:bg-bork-green data-[state=active]:text-black">Weekly</TabsTrigger>
                <TabsTrigger value="one-time" className="data-[state=active]:bg-bork-green data-[state=active]:text-black">One-time</TabsTrigger>
              </TabsList>
              
              <div className="mt-6 space-y-4">
                {filteredTasks.map(task => (
                  <Card 
                    key={task.id} 
                    className={`bork-card transition-all ${task.completed ? 'opacity-70' : 'hover:scale-[1.02]'}`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge className={getDifficultyColor(task.difficulty)}>{task.difficulty}</Badge>
                          <Badge className={getTypeColor(task.type)}>{task.type}</Badge>
                        </div>
                        
                        <h3 className="text-lg font-bold mb-1">{task.title}</h3>
                        <p className="text-gray-400 mb-4">{task.description}</p>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-black/50 rounded-lg border border-bork-green/30 px-4 py-2 mb-3 text-center">
                          <div className="text-sm text-gray-400">Reward</div>
                          <div className="text-xl font-bold text-bork-green">{task.reward} $BORK</div>
                        </div>
                        
                        <Button 
                          className={`${task.completed ? 'bg-gray-600 cursor-not-allowed' : 'bork-button'} w-full`}
                          onClick={() => handleCompleteTask(task.id)}
                          disabled={task.completed || !connected}
                        >
                          {task.completed ? 'Completed ✓' : 'Complete Task'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {filteredTasks.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No tasks found matching your filter.</p>
                  </div>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
