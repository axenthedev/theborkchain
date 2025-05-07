
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBork } from '@/context/BorkContext';
import { toast } from 'sonner';
import { Check, X, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatLargeNumber } from '@/lib/utils';

const TasksPage = () => {
  const { connected, connectWallet, balance, tasks, completeTask } = useBork();
  const [supabaseTasks, setSupabaseTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userTasks, setUserTasks] = useState([]);
  const [processingTaskId, setProcessingTaskId] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        console.log('Fetched tasks:', tasks);
        setSupabaseTasks(tasks || []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Fetch user-specific task completion status if wallet is connected
  useEffect(() => {
    const fetchUserTasks = async () => {
      if (!connected) return;
      
      try {
        const walletAddress = localStorage.getItem('wallet_address') || localStorage.getItem('borkchain_wallet');
        if (!walletAddress) return;
        
        console.log('Fetching tasks for wallet:', walletAddress);
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('address')
          .eq('address', walletAddress)
          .maybeSingle();
          
        if (userError) throw userError;
        if (!userData) {
          console.log('User not found in database');
          return;
        }
        
        const { data: userTasksData, error: tasksError } = await supabase
          .from('user_tasks')
          .select('*')
          .eq('user_address', userData.address);
          
        if (tasksError) throw tasksError;
        
        console.log('User completed tasks:', userTasksData);
        setUserTasks(userTasksData || []);
      } catch (error) {
        console.error('Error fetching user tasks:', error);
      }
    };
    
    fetchUserTasks();
  }, [connected]);

  const isTaskCompleted = (taskId) => {
    return userTasks.some(ut => ut.task_id === taskId);
  };

  const handleTaskClick = async (taskId, taskUrl) => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    // If task is already completed, just open URL
    if (isTaskCompleted(taskId)) {
      if (taskUrl) window.open(taskUrl, '_blank');
      return;
    }
    
    setProcessingTaskId(taskId);
    
    try {
      // If it's a URL task, open the URL
      if (taskUrl) {
        window.open(taskUrl, '_blank');
      }
      
      console.log('Completing task:', taskId);
      const success = await completeTask(taskId);
      
      if (success) {
        const task = supabaseTasks.find(t => t.id === taskId);
        const reward = task ? task.reward : 0;
        
        toast.success(`Task completed! +${reward} $BORK added to your balance`);
        
        // Add to completed tasks locally
        setUserTasks(prev => [...prev, { 
          task_id: taskId, 
          user_address: localStorage.getItem('borkchain_wallet'),
          completed_at: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    } finally {
      setProcessingTaskId(null);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'hard': return 'bg-red-500/20 text-red-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  const getTaskTypeIcon = (type) => {
    switch (type) {
      case 'daily': return '🔄';
      case 'weekly': return '📅';
      case 'one-time': return '✨';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Tasks</h1>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin w-12 h-12 border-4 border-bork-green border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2 text-center">$BORK Tasks</h1>
      <p className="text-gray-400 text-center mb-8">Complete tasks to earn $BORK rewards</p>
      
      {!connected ? (
        <div className="max-w-md mx-auto text-center mb-10">
          <Card className="p-6 bork-card">
            <h2 className="text-lg font-semibold mb-4">Connect your wallet to start earning $BORK</h2>
            <Button onClick={connectWallet} className="bork-button">
              Connect Wallet
            </Button>
          </Card>
        </div>
      ) : (
        <div className="max-w-md mx-auto text-center mb-10">
          <Card className="p-6 bork-card">
            <h2 className="text-lg font-semibold mb-2">Your $BORK Balance</h2>
            <p className="text-3xl font-bold text-bork-green">{formatLargeNumber(balance)}</p>
          </Card>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {supabaseTasks.length > 0 ? supabaseTasks.map((task) => (
          <Card 
            key={task.id} 
            className={`overflow-hidden transition-all duration-300 hover:border-bork-green bork-card ${isTaskCompleted(task.id) ? 'border-bork-green' : ''}`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{task.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={getDifficultyColor(task.difficulty)}>
                      {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                      {getTaskTypeIcon(task.type)} {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="bg-bork-green/10 text-bork-green px-3 py-1 rounded-full text-sm font-medium">
                  {task.reward} $BORK
                </div>
              </div>
              
              <p className="text-gray-400 mb-4 text-sm">{task.description}</p>
              
              <Button
                onClick={() => handleTaskClick(task.id, task.destination_url)}
                disabled={processingTaskId === task.id}
                className={`w-full ${isTaskCompleted(task.id) 
                  ? 'bg-black border border-bork-green text-bork-green hover:bg-bork-green/10' 
                  : 'bork-button'}`}
              >
                {processingTaskId === task.id ? (
                  <span className="animate-spin mr-2">⏳ Processing...</span>
                ) : isTaskCompleted(task.id) ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {task.destination_url ? 'Visit Again' : 'Completed'}
                  </>
                ) : (
                  <>
                    {task.destination_url ? (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Start Task
                      </>
                    ) : (
                      'Complete Task'
                    )}
                  </>
                )}
              </Button>
            </div>
          </Card>
        )) : (
          <div className="col-span-3 text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No Tasks Available</h3>
            <p className="text-gray-400">Check back soon for new tasks to earn $BORK!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
