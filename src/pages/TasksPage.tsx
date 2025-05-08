
import React, { useState } from 'react';
import { useBork } from '@/context/BorkContext';
import StatsCard from '@/components/tasks/StatsCard';
import TaskCard from '@/components/tasks/TaskCard';
import CompletedTaskCard from '@/components/tasks/CompletedTaskCard';
import TaskHeader from '@/components/tasks/TaskHeader';
import TaskTabs from '@/components/tasks/TaskTabs';
import EmptyState from '@/components/tasks/EmptyState';
import WalletConnect from '@/components/tasks/WalletConnect';

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
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="space-y-8">
        {/* Stats Section */}
        <StatsCard 
          balance={balance}
          completedTasksCount={completedTasks.length}
          totalTasksCount={tasks.length}
          streak={streak}
          streakBonus={50}
        />
        
        {/* Task Header */}
        <TaskHeader />
        
        {/* Task Tabs */}
        <TaskTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Available Tasks */}
        {activeTab === 'available' && (
          <div className="space-y-6">
            {availableTasks.length === 0 ? (
              <EmptyState type="available" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
          <div className="space-y-6">
            {completedTasks.length === 0 ? (
              <EmptyState type="completed" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {completedTasks.map((task) => (
                  <CompletedTaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
