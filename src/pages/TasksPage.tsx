import React, { useState } from 'react';
import { useBork } from '@/context/BorkContext';
import StatsCard from '@/components/tasks/StatsCard';
import TaskCard from '@/components/tasks/TaskCard';
import CompletedTaskCard from '@/components/tasks/CompletedTaskCard';
import TaskHeader from '@/components/tasks/TaskHeader';
import TaskTabs from '@/components/tasks/TaskTabs';
import EmptyState from '@/components/tasks/EmptyState';
import WalletConnect from '@/components/tasks/WalletConnect';
import { Card } from '@/components/ui/card';

const TasksPage = () => {
  const { connected, connectWallet, tasks, completeTask, balance, streak } = useBork();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available');
  const [animateReward, setAnimateReward] = useState<{taskId: string, amount: number} | null>(null);
  
  // Filter tasks based on completion status
  const availableTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
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

  if (!connected) {
    return <WalletConnect onConnect={connectWallet} />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">
          <span className="text-bork-green neon-text">Tasks</span> & Rewards
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Stats */}
          <div className="lg:col-span-1">
            <Card className="bork-card border-bork-green/30 bg-black/50 backdrop-blur-md shadow-[0_0_15px_rgba(57,255,20,0.15)]">
              <h3 className="text-lg font-bold mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div className="bg-black/60 rounded-lg p-4 border border-bork-green/30">
                  <div className="text-sm text-gray-400">Current Balance</div>
                  <div className="text-2xl font-bold text-bork-green neon-text">{balance} $BORK</div>
                </div>
                
                <div className="bg-black/60 rounded-lg p-4 border border-bork-green/30">
                  <div className="text-sm text-gray-400">Current Streak</div>
                  <div className="text-2xl font-bold text-white">{streak} days</div>
                </div>

                <div className="bg-black/60 rounded-lg p-4 border border-bork-green/30">
                  <div className="text-sm text-gray-400">Tasks Completed</div>
                  <div className="text-2xl font-bold text-bork-green">{completedTasks.length}/{tasks.length}</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Side - Tasks */}
          <div className="lg:col-span-2">
            <Card className="bork-card mb-8 border-bork-green/30 bg-black/50 backdrop-blur-md shadow-[0_0_15px_rgba(57,255,20,0.15)]">
              <div className="p-6">
                <TaskTabs activeTab={activeTab} onTabChange={setActiveTab} />
                
                {/* Available Tasks */}
                {activeTab === 'available' && (
                  <div className="mt-6">
                    {availableTasks.length === 0 ? (
                      <EmptyState type="available" />
                    ) : (
                      <div className="grid gap-4">
                        {availableTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onComplete={handleCompleteTask}
                            isLoading={isLoading}
                            animateReward={animateReward}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Completed Tasks */}
                {activeTab === 'completed' && (
                  <div className="mt-6">
                    {completedTasks.length === 0 ? (
                      <EmptyState type="completed" />
                    ) : (
                      <div className="grid gap-4">
                        {completedTasks.map((task) => (
                          <CompletedTaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
