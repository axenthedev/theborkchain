
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
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  completeTask: (taskId: string) => void;
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

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    try {
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*');

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

        setTasks(mappedTasks);
      }
    } catch (error) {
      console.error('Error in fetchTasks:', error);
    }
  };

  // Fetch user data from Supabase
  const fetchUserData = async (address: string) => {
    try {
      // Get user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('address', address)
        .single();

      if (userError) {
        if (userError.code === 'PGRST116') {
          // User not found, create new user
          return createNewUser(address);
        }
        console.error('Error fetching user data:', userError);
        return;
      }

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

  // Create new user in Supabase
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
      
      // If there's a referrer, create referral record
      if (referrerAddress) {
        await supabase.from('referrals').insert({
          referrer_address: referrerAddress,
          referred_address: address
        });
        
        // Update referrer's balance
        await supabase.rpc('add_referral_bonus', { 
          referrer_addr: referrerAddress,
          bonus_amount: 100
        });
        
        toast.success(`You've been referred by ${referrerAddress}`);
      }
      
      setReferralCode(newReferralCode);
      return newUserData;
    } catch (error) {
      console.error('Error in createNewUser:', error);
      return null;
    }
  };

  // Connect wallet and initialize user data
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not found. Please install MetaMask first.");
      return;
    }
    
    try {
      setConnecting(true);
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const address = accounts[0];
      setAccount(address);
      setConnected(true);
      
      // Fetch user data from Supabase or create new user
      const userData = await fetchUserData(address);
      
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
    setConnected(false);
    setAccount(null);
    setBalance(0);
    setReferralCode('');
    setReferrals([]);
    setIsAdmin(false);
    
    // Reset tasks completion status
    setTasks(prevTasks => prevTasks.map(task => ({ ...task, completed: false })));
    toast.info("Wallet disconnected");
  };

  const completeTask = async (taskId: string) => {
    if (!account) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.completed) return;
    
    try {
      // Insert record of task completion
      const { error: taskCompletionError } = await supabase
        .from('user_tasks')
        .insert({
          user_address: account,
          task_id: taskId
        });
        
      if (taskCompletionError) {
        if (taskCompletionError.code === '23505') {
          // Unique violation - task already completed
          toast.error("You have already completed this task!");
          return;
        }
        console.error("Error recording task completion:", taskCompletionError);
        toast.error("Failed to complete task. Please try again.");
        return;
      }
      
      // Update user balance
      const { error: balanceUpdateError } = await supabase
        .rpc('add_task_reward', {
          user_addr: account,
          task_id: taskId
        });
        
      if (balanceUpdateError) {
        console.error("Error updating balance:", balanceUpdateError);
        toast.error("Failed to update balance. Please try again.");
        return;
      }
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(t => t.id === taskId ? { ...t, completed: true } : t)
      );
      
      // Refresh user data to get updated balance
      const userData = await fetchUserData(account);
      if (userData) {
        toast.success(`Task completed! +${task.reward} $BORK`);
      }
      
      // If the task has a destination URL, open it
      if (task.destinationUrl) {
        window.open(task.destinationUrl, '_blank');
      }
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error("Failed to complete task. Please try again.");
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

  // Initial data fetch
  useEffect(() => {
    fetchTasks();
  }, []);
  
  // Fetch user data when account changes
  useEffect(() => {
    if (account) {
      fetchUserData(account);
      fetchTasks(); // Refetch tasks to get completion status
    }
  }, [account]);

  useEffect(() => {
    // Check if previously connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            connectWallet();
          }
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };
    
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          connectWallet();
        } else {
          disconnectWallet();
        }
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
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
