import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'daily' | 'weekly' | 'one-time';
  destinationUrl?: string;
}

export interface User {
  id: string;
  address: string;
  balance: number;
  isAdmin: boolean;
  referralCode: string;
  referredBy: string | null;
  referrals: string[];
  tasksCompleted: {
    taskId: string;
    completedAt: string;
  }[];
  joinedAt: string;
  streak?: number;
}

interface BorkContextType {
  connected: boolean;
  connecting: boolean;
  account: string | null;
  balance: number;
  tasks: Task[];
  referralCode: string;
  referrals: string[];
  isAdmin: boolean;
  users: User[];
  streak: number;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  completeTask: (taskId: string) => Promise<boolean>;
  copyReferralLink: () => void;
  getReferralLink: () => string;
}

const BorkContext = createContext<BorkContextType | undefined>(undefined);

const LOCAL_STORAGE_USERS_KEY = 'borkchain_users';
const LOCAL_STORAGE_TASKS_KEY = 'borkchain_tasks';

export const BorkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [streak, setStreak] = useState(0);

  const fetchTasks = async () => {
    try {
      console.log("Fetching tasks...");
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (taskError) {
        console.error('Error fetching tasks:', taskError);
        return;
      }

      if (account) {
        // Fetch completed tasks for current user
        const { data: userTasksData, error: userTasksError } = await supabase
          .from('user_tasks')
          .select('task_id, completed_at')
          .eq('user_address', account);

        if (userTasksError) {
          console.error('Error fetching user tasks:', userTasksError);
          return;
        }

        // Map completed status to tasks
        const completedTaskIds = new Set(userTasksData?.map(ut => ut.task_id) || []);
        
        const mappedTasks: Task[] = taskData?.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          reward: task.reward,
          completed: completedTaskIds.has(task.id),
          difficulty: task.difficulty as 'easy' | 'medium' | 'hard',
          type: task.type as 'daily' | 'weekly' | 'one-time',
          destinationUrl: task.destination_url || undefined
        })) || [];

        console.log("Tasks mapped with completion status:", mappedTasks);
        setTasks(mappedTasks);
      } else {
        // If no user connected, just set tasks without completion status
        const mappedTasks: Task[] = taskData?.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          reward: task.reward,
          completed: false,
          difficulty: task.difficulty as 'easy' | 'medium' | 'hard',
          type: task.type as 'daily' | 'weekly' | 'one-time',
          destinationUrl: task.destination_url || undefined
        })) || [];

        console.log("Tasks mapped without completion status:", mappedTasks);
        setTasks(mappedTasks);
      }
    } catch (error) {
      console.error('Error in fetchTasks:', error);
    }
  };

  const fetchUserData = async (address: string) => {
    try {
      console.log(`Fetching user data for ${address}...`);
      // Get user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('address', address)
        .single();

      if (userError) {
        if (userError.code === 'PGRST116') {
          // User not found, create new user
          console.log("User not found, creating new user...");
          return createNewUser(address);
        }
        console.error('Error fetching user data:', userError);
        return;
      }

      console.log("User data fetched:", userData);

      // Get user's completed tasks
      const { data: userTasksData, error: userTasksError } = await supabase
        .from('user_tasks')
        .select('task_id, completed_at')
        .eq('user_address', address);

      if (userTasksError) {
        console.error('Error fetching user tasks:', userTasksError);
      }

      // Get user's referrals
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('referred_address')
        .eq('referrer_address', address);

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
      }

      // Update state with fetched data
      setBalance(userData.balance);
      setReferralCode(userData.referral_code);
      setReferrals(referralsData?.map(r => r.referred_address) || []);
      setIsAdmin(userData.is_admin);
      setStreak(userData.streak_count || 0);
      
      // Mark tasks as completed
      const completedTaskIds = new Set(userTasksData?.map(ut => ut.task_id) || []);
      setTasks(prevTasks => prevTasks.map(task => ({
        ...task,
        completed: completedTaskIds.has(task.id)
      })));

      return userData;
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      return null;
    }
  };

  const createNewUser = async (address: string) => {
    try {
      const newReferralCode = `BORK${Math.floor(Math.random() * 10000)}`;
      
      // Check URL for referral
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      let referrerAddress: string | null = null;
      
      if (refCode) {
        // Check if referrer exists
        const { data: referrerData } = await supabase
          .from('users')
          .select('address')
          .or(`address.eq.${refCode},referral_code.eq.${refCode}`)
          .single();
          
        if (referrerData) {
          referrerAddress = referrerData.address;
        }
      }
      
      console.log("Creating new user with address:", address);
      
      // Insert new user
      const { data: newUserData, error: insertError } = await supabase
        .from('users')
        .insert({
          address: address,
          referral_code: newReferralCode,
          referred_by: referrerAddress
        })
        .select()
        .single();
        
      if (insertError) {
        console.error('Error creating user:', insertError);
        return null;
      }
      
      console.log("New user created:", newUserData);
      
      // If there's a referrer, create referral record
      if (referrerAddress) {
        await supabase.from('referrals').insert({
          referrer_address: referrerAddress,
          referred_address: address
        });
        
        // Update referrer's balance using the RPC function
        const { error } = await supabase.rpc(
          'add_referral_bonus', 
          { 
            referrer_addr: referrerAddress,
            bonus_amount: 100
          }
        );
        
        if (error) {
          console.error('Error adding referral bonus:', error);
        } else {
          toast.success(`You've been referred by ${referrerAddress}`);
        }
      }
      
      setReferralCode(newReferralCode);
      return newUserData;
    } catch (error) {
      console.error('Error in createNewUser:', error);
      return null;
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not found. Please install MetaMask first.");
      return;
    }
    
    try {
      setConnecting(true);
      console.log("Connecting wallet...");
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const address = accounts[0];
      console.log("Wallet connected:", address);
      setAccount(address);
      setConnected(true);
      
      // Store wallet address in localStorage to persist on page reload
      localStorage.setItem('borkchain_wallet', address);
      
      // Fetch user data from Supabase or create new user
      const userData = await fetchUserData(address);

      // Update user streak
      try {
        const { data: streakData, error: streakError } = await supabase.rpc(
          'update_user_streak', 
          { user_addr: address }
        );
        
        if (!streakError && streakData) {
          console.log('Updated streak:', streakData);
          setStreak(streakData);
          
          // Show streak notification if greater than 1
          if (streakData > 1) {
            toast.success(`🔥 ${streakData} day streak! +50 $BORK`, {
              description: 'Keep logging in daily to earn more!'
            });
          }
        }
      } catch (streakError) {
        console.error('Error updating streak:', streakError);
      }
      
      if (userData) {
        toast.success("Wallet connected successfully!");
      } else {
        toast.error("Failed to load user data. Please try again.");
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      toast.error("Failed to connect wallet. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    console.log("Disconnecting wallet");
    setConnected(false);
    setAccount(null);
    setBalance(0);
    setReferralCode('');
    setReferrals([]);
    setIsAdmin(false);
    setStreak(0);
    
    // Clear stored wallet from localStorage
    localStorage.removeItem('borkchain_wallet');
    
    // Reset tasks completion status
    setTasks(prevTasks => prevTasks.map(task => ({ ...task, completed: false })));
    toast.info("Wallet disconnected");
  };

  // Improved completeTask function with better error handling
  const completeTask = async (taskId: string): Promise<boolean> => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return false;
    }
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      console.error(`Task not found: ${taskId}`);
      toast.error("Task not found");
      return false;
    }
    
    if (task.completed) {
      console.log(`Task ${taskId} already completed`);
      toast.info("You have already completed this task!");
      return false;
    }
    
    try {
      console.log(`Attempting to complete task ${taskId} for user ${account}`);
      
      // Update local state first for faster UI feedback
      setTasks(prevTasks => 
        prevTasks.map(t => t.id === taskId ? { ...t, completed: true } : t)
      );
      
      // Insert record of task completion
      const { error: taskCompletionError } = await supabase
        .from('user_tasks')
        .insert({
          user_address: account,
          task_id: taskId
        });
        
      if (taskCompletionError) {
        console.error("Error recording task completion:", taskCompletionError);
        
        if (taskCompletionError.code === '23505') {
          // Unique violation - task already completed
          toast.info("You've already completed this task!");
          return true; // Return true since the task is already completed
        } else {
          // Revert local state change on error
          setTasks(prevTasks => 
            prevTasks.map(t => t.id === taskId ? { ...t, completed: false } : t)
          );
          toast.error(`Failed to complete task: ${taskCompletionError.message}`);
          return false;
        }
      }
      
      console.log(`Task completion record inserted successfully, updating balance...`);
      
      // Get the task reward
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('reward')
        .eq('id', taskId)
        .single();
        
      if (taskError) {
        console.error("Error getting task reward:", taskError);
        toast.error("Failed to complete task. Please try again.");
        // Revert local state change on error
        setTasks(prevTasks => 
          prevTasks.map(t => t.id === taskId ? { ...t, completed: false } : t)
        );
        return false;
      }
      
      const reward = taskData.reward;
      
      // Update user balance in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          balance: balance + reward,
          total_earned: balance + reward
        })
        .eq('address', account);
        
      if (updateError) {
        console.error("Error updating balance:", updateError);
        toast.error("Task completed but balance update failed. Please refresh.");
      } else {
        // Update local state with new balance
        setBalance(prevBalance => prevBalance + reward);
        console.log(`Balance updated to ${balance + reward}`);
      }
      
      // Attempt the RPC function as well (belt and suspenders approach)
      const { error: rpcError } = await supabase.rpc(
        'add_task_reward',
        {
          user_addr: account,
          task_id: taskId
        }
      );
      
      if (rpcError) {
        console.error("RPC Error:", rpcError);
        // We already updated the balance directly, so this is just a warning
        console.warn("RPC balance update failed, but direct update succeeded");
      }
      
      // Force a refetch of user data to ensure we have current balance
      await fetchUserData(account);
      
      toast.success(`Task completed! +${reward} $BORK`);
      
      return true;
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error("Failed to complete task. Please try again.");
      
      // Revert local state change on error
      setTasks(prevTasks => 
        prevTasks.map(t => t.id === taskId ? { ...t, completed: false } : t)
      );
      
      return false;
    }
  };

  const getReferralLink = () => {
    return `https://theborkchain.lovable.app/?ref=${account}`;
  };

  const copyReferralLink = () => {
    const referralLink = getReferralLink();
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };
  
  // Load wallet from localStorage on initial render
  useEffect(() => {
    const storedWallet = localStorage.getItem('borkchain_wallet');
    if (storedWallet) {
      console.log("Found stored wallet:", storedWallet);
      setAccount(storedWallet);
      setConnected(true);
      fetchUserData(storedWallet);
      fetchTasks();
    } else {
      // No stored wallet, fetch tasks anyway but without completion status
      fetchTasks();
    }
  }, []);
  
  useEffect(() => {
    if (account) {
      fetchUserData(account);
      fetchTasks(); // Refetch tasks to get completion status
    }
  }, [account]);

  useEffect(() => {
    // Listen for account changes in MetaMask
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        console.log("MetaMask accounts changed:", accounts);
        if (accounts.length > 0) {
          // Update to new account
          setAccount(accounts[0]);
          setConnected(true);
          localStorage.setItem('borkchain_wallet', accounts[0]);
          fetchUserData(accounts[0]);
        } else {
          // Disconnect if user disconnected in MetaMask
          disconnectWallet();
        }
      });
      
      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        console.log("Chain changed, reloading...");
        window.location.reload();
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  const contextValue: BorkContextType = {
    connected,
    connecting,
    account,
    balance,
    tasks,
    referralCode,
    referrals,
    isAdmin,
    users,
    streak,
    connectWallet,
    disconnectWallet,
    completeTask,
    copyReferralLink,
    getReferralLink
  };

  return (
    <BorkContext.Provider value={contextValue}>
      {children}
    </BorkContext.Provider>
  );
};

export const useBork = () => {
  const context = useContext(BorkContext);
  if (context === undefined) {
    throw new Error('useBork must be used within a BorkProvider');
  }
  return context;
};

declare global {
  interface Window {
    ethereum: any;
  }
}
