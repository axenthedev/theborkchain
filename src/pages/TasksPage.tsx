
import React, { useState, useEffect } from 'react';
import { useBork } from '@/context/BorkContext';
import BorkDog from '@/components/BorkDog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Define the Task interface for proper typing
interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  difficulty: string;
  type: string;
  destination_url?: string;
  completed?: boolean;
}

const TasksPage = () => {
  const { connected, connectWallet, completeTask, balance } = useBork();
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [loadingTaskIds, setLoadingTaskIds] = useState<Set<string>>(new Set());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Fetch tasks from Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      if (!connected) return;
      
      setIsLoading(true);
      try {
        // Fetch all tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (tasksError) throw tasksError;
        
        // Fetch user's completed tasks
        const { data: userTasksData, error: userTasksError } = await supabase
          .from('user_tasks')
          .select('task_id')
          .eq('user_address', connected);
        
        if (userTasksError) throw userTasksError;
        
        // Create a set of completed task IDs
        const completedIds = new Set(userTasksData.map(ut => ut.task_id));
        setCompletedTaskIds(completedIds);
        
        // Mark tasks as completed if in the completedIds set
        const enrichedTasks = tasksData.map(task => ({
          ...task,
          completed: completedIds.has(task.id)
        }));
        
        setTasks(enrichedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
  }, [connected]);
  
  // Redirect to home if not connected
  useEffect(() => {
    if (!connected) {
      toast.error('Please connect your wallet to access tasks');
      navigate('/');
    }
  }, [connected, navigate]);
  
  const handleCompleteTask = async (taskId: string) => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setLoadingTaskIds(prev => new Set([...prev, taskId]));
    
    try {
      const success = await completeTask(taskId);
      if (success) {
        // Update local state to mark task as completed
        setCompletedTaskIds(prev => new Set([...prev, taskId]));
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, completed: true } : task
          )
        );
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    } finally {
      setLoadingTaskIds(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };
  
  // Filter tasks based on user selection
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });
  
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
      case 'daily': return 'bg-white/20 text-white';
      case 'weekly': return 'bg-purple-500/20 text-white';
      case 'one-time': return 'bg-pink-500/20 text-white';
      default: return 'bg-gray-500/20 text-white';
    }
  };

  // If not connected, show connection prompt
  if (!connected) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="bork-card max-w-md mx-auto text-center px-8 py-12 border-bork-green/30 bg-black/70 backdrop-blur-md shadow-[0_0_15px_rgba(57,255,20,0.15)]">
          <div className="flex justify-center mb-6">
            <BorkDog size="medium" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-white">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">You need to connect your wallet to access tasks and start earning $BORK</p>
          <Button onClick={connectWallet} className="bork-button w-full">
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state while fetching tasks
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-bork-green border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-white">Loading tasks...</p>
        </div>
      </div>
    );
  }

  // Render task component function to avoid repetition
  const renderTaskList = (taskList: Task[]) => (
    <div className="mt-6 space-y-4">
      {taskList.length > 0 ? (
        taskList.map(task => (
          <Card 
            key={task.id} 
            className={`bork-card transition-all bg-black/70 backdrop-blur-lg border-bork-green/40 hover:border-bork-green/80 hover:shadow-[0_0_15px_rgba(57,255,20,0.3)] ${task.completed ? 'opacity-70' : 'hover:scale-[1.02]'}`}
          >
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge className={getDifficultyColor(task.difficulty)}>{task.difficulty}</Badge>
                  <Badge className={getTypeColor(task.type)}>{task.type}</Badge>
                </div>
                
                <h3 className="text-lg font-bold mb-1 text-white">{task.title}</h3>
                <p className="text-gray-400 mb-4">{task.description}</p>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <div className="bg-black/60 backdrop-blur-md rounded-lg border border-bork-green/40 px-4 py-2 mb-3 text-center">
                  <div className="text-sm text-gray-400">Reward</div>
                  <div className="text-xl font-bold text-bork-green neon-text">{task.reward} $BORK</div>
                </div>
                
                <Button 
                  className={`${task.completed ? 'bg-gray-600 cursor-not-allowed' : 'bork-button shadow-[0_0_10px_rgba(57,255,20,0.3)]'} w-full`}
                  onClick={() => handleCompleteTask(task.id)}
                  disabled={task.completed || loadingTaskIds.has(task.id)}
                >
                  {loadingTaskIds.has(task.id) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : task.completed ? (
                    'Completed ✓'
                  ) : (
                    'Complete Task'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">No tasks found matching your filter.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bork-card mb-6 sticky top-24 border-bork-green/30 bg-black/70 backdrop-blur-md shadow-[0_0_15px_rgba(57,255,20,0.15)]">
              <div className="flex justify-center mb-4">
                <BorkDog size="small" />
              </div>
              
              <h2 className="text-xl font-bold mb-2 text-center text-white">Your Stats</h2>
              
              <div className="flex flex-col space-y-4 mt-6">
                <div className="bg-black/50 backdrop-blur-md rounded-lg p-4 border border-bork-green/30 shadow-[0_0_10px_rgba(57,255,20,0.2)]">
                  <div className="text-sm text-gray-400">Balance</div>
                  <div className="text-2xl font-bold text-bork-green neon-text">{balance} $BORK</div>
                </div>
                
                <div className="bg-black/50 backdrop-blur-md rounded-lg p-4 border border-white/10">
                  <div className="text-sm text-gray-400">Completed Tasks</div>
                  <div className="text-2xl font-bold text-white">
                    {tasks.filter(t => t.completed).length} / {tasks.length}
                  </div>
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-bork-green h-2.5 rounded-full shadow-[0_0_5px_rgba(57,255,20,0.5)]" 
                      style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-white mb-2">Task Filters</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-1 rounded-full text-sm transition-all ${filter === 'all' ? 'bg-bork-green text-black font-bold shadow-[0_0_10px_rgba(57,255,20,0.5)]' : 'bg-black/50 text-white border border-white/10'}`}
                    onClick={() => setFilter('all')}
                  >
                    All Tasks
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-sm transition-all ${filter === 'pending' ? 'bg-bork-green text-black font-bold shadow-[0_0_10px_rgba(57,255,20,0.5)]' : 'bg-black/50 text-white border border-white/10'}`}
                    onClick={() => setFilter('pending')}
                  >
                    Pending
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-sm transition-all ${filter === 'completed' ? 'bg-bork-green text-black font-bold shadow-[0_0_10px_rgba(57,255,20,0.5)]' : 'bg-black/50 text-white border border-white/10'}`}
                    onClick={() => setFilter('completed')}
                  >
                    Completed
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-white">
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
            
            {tasks.length === 0 ? (
              <div className="text-center py-16 border border-white/10 rounded-lg bg-black/40">
                <h3 className="text-xl font-bold text-white mb-2">No Tasks Available</h3>
                <p className="text-gray-400">Tasks will appear here once they've been added by an admin.</p>
              </div>
            ) : (
              <Tabs defaultValue="all" className="animate-fade-in">
                <TabsList className="bg-black/50 border border-white/10 backdrop-blur-md">
                  <TabsTrigger value="all" className="data-[state=active]:bg-bork-green data-[state=active]:text-black data-[state=active]:shadow-[0_0_10px_rgba(57,255,20,0.5)] text-white">All Tasks</TabsTrigger>
                  <TabsTrigger value="daily" className="data-[state=active]:bg-bork-green data-[state=active]:text-black data-[state=active]:shadow-[0_0_10px_rgba(57,255,20,0.5)] text-white">Daily</TabsTrigger>
                  <TabsTrigger value="weekly" className="data-[state=active]:bg-bork-green data-[state=active]:text-black data-[state=active]:shadow-[0_0_10px_rgba(57,255,20,0.5)] text-white">Weekly</TabsTrigger>
                  <TabsTrigger value="one-time" className="data-[state=active]:bg-bork-green data-[state=active]:text-black data-[state=active]:shadow-[0_0_10px_rgba(57,255,20,0.5)] text-white">One-time</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  {renderTaskList(filteredTasks)}
                </TabsContent>
                
                <TabsContent value="daily">
                  {renderTaskList(filteredTasks.filter(task => task.type === 'daily'))}
                </TabsContent>
                
                <TabsContent value="weekly">
                  {renderTaskList(filteredTasks.filter(task => task.type === 'weekly'))}
                </TabsContent>
                
                <TabsContent value="one-time">
                  {renderTaskList(filteredTasks.filter(task => task.type === 'one-time'))}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
