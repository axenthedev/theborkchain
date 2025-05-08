
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBork } from '@/context/BorkContext';
import { toast } from 'sonner';
import { Check, X, ExternalLink, Calendar, Star, Award, Zap, SquareCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatLargeNumber } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const TasksPage = () => {
  const { connected, connectWallet, balance, tasks, completeTask } = useBork();
  const [supabaseTasks, setSupabaseTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userTasks, setUserTasks] = useState([]);
  const [processingTaskId, setProcessingTaskId] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    streakCount: 0,
    streakBonus: 5
  });
  const isMobile = useIsMobile();

  // Fetch all tasks
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
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

  // Fetch user stats and completed tasks if wallet is connected
  useEffect(() => {
    const fetchUserData = async () => {
      if (!connected) {
        setStatsLoading(false);
        return;
      }
      
      setStatsLoading(true);
      try {
        const walletAddress = localStorage.getItem('wallet_address') || localStorage.getItem('borkchain_wallet');
        if (!walletAddress) {
          setStatsLoading(false);
          return;
        }
        
        // Fetch user data with streak info
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('streak_count')
          .eq('address', walletAddress)
          .maybeSingle();
          
        if (userError) throw userError;
        
        // Update streak if user is returning
        if (userData) {
          const { data: streakData, error: streakError } = await supabase.rpc(
            'update_user_streak',
            { user_addr: walletAddress }
          );

          if (streakError) console.error('Error updating streak:', streakError);
          
          if (streakData && streakData !== userData.streak_count) {
            // User's streak increased
            toast.success(`🔥 Day ${streakData} streak! +${stats.streakBonus} $BORK`, {
              duration: 5000,
              position: 'top-center',
            });
          }
        }
        
        // Fetch completed tasks
        const { data: userTasksData, error: tasksError } = await supabase
          .from('user_tasks')
          .select('*')
          .eq('user_address', walletAddress);
          
        if (tasksError) throw tasksError;
        
        setUserTasks(userTasksData || []);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalCompleted: userTasksData?.length || 0,
          streakCount: userData?.streak_count || 0
        }));
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchUserData();
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
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalCompleted: prev.totalCompleted + 1
        }));
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

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return <Zap className="w-4 h-4" />;
      case 'medium': return <Star className="w-4 h-4" />;
      case 'hard': return <Award className="w-4 h-4" />;
      default: return null;
    }
  };

  const getTaskTypeIcon = (type) => {
    switch (type) {
      case 'daily': return <Calendar className="w-4 h-4" />;
      case 'weekly': return <Calendar className="w-4 h-4" />;
      case 'one-time': return <SquareCheck className="w-4 h-4" />;
      default: return null;
    }
  };
  
  const filterTasks = (tasks) => {
    const completed = tasks.filter(task => isTaskCompleted(task.id));
    const incomplete = tasks.filter(task => !isTaskCompleted(task.id));
    return { completed, incomplete };
  };

  const { completed: completedTasks, incomplete: incompleteTasks } = filterTasks(supabaseTasks);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6 text-center neon-text">$BORK Tasks</h1>
        <div className="max-w-md mx-auto">
          <Card className="p-6 mb-8 bork-card">
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-12 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-16 w-1/3" />
                <Skeleton className="h-16 w-1/3" />
                <Skeleton className="h-16 w-1/3" />
              </div>
            </div>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="bork-card overflow-hidden">
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex justify-between mb-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 animate-fade-in">
      <h1 className="text-4xl font-bold mb-2 text-center neon-text">$BORK Tasks</h1>
      <p className="text-gray-400 text-center mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>Complete tasks to earn $BORK rewards</p>
      
      {!connected ? (
        <div className="max-w-md mx-auto text-center mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Card className="p-8 bork-card">
            <div className="flex flex-col items-center">
              <div className="mb-6">
                <img 
                  src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHU5NTJkNnl3OXMydWk4OGE0bWwya3pzcWdldzh6a3Q4YnVyZjluaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/xT0xeE5KmUgBDRj6Lu/giphy.gif" 
                  alt="Doge" 
                  className="w-24 h-24 object-cover rounded-full border-2 border-bork-green shadow-[0_0_15px_rgba(57,255,20,0.5)]"
                />
              </div>
              <h2 className="text-xl font-semibold mb-4">Connect your wallet to start earning $BORK</h2>
              <Button 
                onClick={connectWallet} 
                className="bork-button text-lg px-8 py-6 animate-pulse-green"
              >
                Connect Wallet
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Card className="p-6 bork-card">
            <div className={`${isMobile ? 'flex flex-col' : 'grid grid-cols-4'} gap-6`}>
              {/* Balance */}
              <div className="col-span-1 flex flex-col items-center justify-center p-4 border border-bork-green/30 rounded-xl hover:border-bork-green/60 transition-all">
                <h3 className="text-sm font-medium text-gray-400 mb-1">Your Balance</h3>
                <p className="text-3xl font-bold text-bork-green">{formatLargeNumber(balance)}</p>
                <p className="text-xs text-gray-500">$BORK</p>
              </div>
              
              {/* Tasks Completed */}
              <div className="col-span-1 flex flex-col items-center justify-center p-4 border border-bork-green/30 rounded-xl hover:border-bork-green/60 transition-all">
                <h3 className="text-sm font-medium text-gray-400 mb-1">Tasks Completed</h3>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-3xl font-bold text-white">{stats.totalCompleted}</p>
                )}
                <p className="text-xs text-gray-500">total</p>
              </div>
              
              {/* Streak */}
              <div className="col-span-2 flex flex-col justify-center p-4 border border-bork-green/30 rounded-xl hover:border-bork-green/60 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Daily Streak</h3>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-20 mt-1" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-white">{stats.streakCount}</span>
                        <span className="text-sm text-gray-400">days</span>
                        {stats.streakCount > 0 && (
                          <span className="animate-bounce-small">🔥</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400">Daily Bonus</span>
                    <p className="text-lg font-bold text-bork-green">+{stats.streakBonus} $BORK</p>
                  </div>
                </div>
                <Progress 
                  value={stats.streakCount % 7 * (100/7)} 
                  className="h-2 bg-gray-800" 
                />
                <p className="text-xs text-gray-500 mt-1">Login daily to increase your streak and earn bonuses!</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Available Tasks Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Available Tasks</h2>
          <Badge variant="outline" className="bg-bork-green/10 text-bork-green border-bork-green/30">
            {incompleteTasks.length} Tasks
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {incompleteTasks.length > 0 ? incompleteTasks.map((task, index) => (
            <Card 
              key={task.id} 
              className="overflow-hidden transition-all duration-300 hover:scale-[1.02] bork-card animate-fade-in"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{task.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={getDifficultyColor(task.difficulty)}>
                        {getDifficultyIcon(task.difficulty)}
                        {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                        {getTaskTypeIcon(task.type)}
                        {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
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
                  disabled={processingTaskId === task.id || !connected}
                  className="w-full bork-button"
                >
                  {processingTaskId === task.id ? (
                    <span className="animate-spin mr-2">⏳</span>
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
      
      {/* Completed Tasks Section */}
      {connected && completedTasks.length > 0 && (
        <div>
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold text-white mr-auto">Completed Tasks</h2>
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
              {completedTasks.length} Completed
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedTasks.map((task, index) => (
              <Card 
                key={task.id} 
                className="overflow-hidden transition-all duration-300 bork-card border-bork-green animate-fade-in opacity-80 hover:opacity-100"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1 flex items-center">
                        <Check className="w-5 h-5 mr-2 text-bork-green" />
                        {task.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={getDifficultyColor(task.difficulty)}>
                          {getDifficultyIcon(task.difficulty)}
                          {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                          {getTaskTypeIcon(task.type)}
                          {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-bork-green/10 text-bork-green px-3 py-1 rounded-full text-sm font-medium">
                      {task.reward} $BORK
                    </div>
                  </div>
                  
                  <p className="text-gray-400 mb-4 text-sm">{task.description}</p>
                  
                  <Button
                    onClick={() => task.destination_url && window.open(task.destination_url, '_blank')}
                    className="w-full bg-black border border-bork-green text-bork-green hover:bg-bork-green/10"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {task.destination_url ? 'Visit Again' : 'Completed'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
