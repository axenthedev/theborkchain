
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'daily' | 'weekly' | 'one-time';
}

export interface User {
  id: string;
  address: string;
  balance: number;
  isAdmin: boolean;
  referralCode: string;
  referredBy: string | null;
  referrals: string[];
  tasksCompleted: string[];
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
}

const BorkContext = createContext<BorkContextType | undefined>(undefined);

// Mock tasks data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Follow BorkChain on Twitter',
    description: 'Follow our official Twitter account to stay updated',
    reward: 50,
    completed: false,
    difficulty: 'easy',
    type: 'one-time'
  },
  {
    id: '2',
    title: 'Join Discord Community',
    description: 'Join our vibrant Discord community and say hello',
    reward: 75,
    completed: false,
    difficulty: 'easy',
    type: 'one-time'
  },
  {
    id: '3',
    title: 'Refer a Friend',
    description: 'Invite a friend to join BorkChain with your referral link',
    reward: 150,
    completed: false,
    difficulty: 'medium',
    type: 'one-time'
  },
  {
    id: '4',
    title: 'Participate in AMA',
    description: 'Join our weekly AMA session with the team',
    reward: 100,
    completed: false,
    difficulty: 'medium',
    type: 'weekly'
  },
  {
    id: '5',
    title: 'Create Meme Content',
    description: 'Create and share a BORK-themed meme on social media',
    reward: 200,
    completed: false,
    difficulty: 'hard',
    type: 'daily'
  },
];

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    address: '0x123...456',
    balance: 500,
    isAdmin: true,
    referralCode: 'BORK123',
    referredBy: null,
    referrals: [],
    tasksCompleted: [],
    joinedAt: '2023-05-01'
  },
  {
    id: '2',
    address: '0x789...012',
    balance: 250,
    isAdmin: false,
    referralCode: 'BORK456',
    referredBy: 'BORK123',
    referrals: [],
    tasksCompleted: ['1', '2'],
    joinedAt: '2023-05-15'
  }
];

export const BorkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

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
      
      // Find if user exists
      const foundUser = users.find(user => user.address.toLowerCase() === address.toLowerCase());
      
      if (foundUser) {
        setBalance(foundUser.balance);
        setReferralCode(foundUser.referralCode);
        setReferrals(foundUser.referrals);
        setIsAdmin(foundUser.isAdmin);
        
        // Mark completed tasks
        setTasks(tasks.map(task => ({
          ...task,
          completed: foundUser.tasksCompleted.includes(task.id)
        })));
      } else {
        // Create new user if not found
        const newReferralCode = `BORK${Math.floor(Math.random() * 10000)}`;
        const newUser: User = {
          id: `${users.length + 1}`,
          address,
          balance: 0,
          isAdmin: false,
          referralCode: newReferralCode,
          referredBy: null,
          referrals: [],
          tasksCompleted: [],
          joinedAt: new Date().toISOString()
        };
        
        setUsers([...users, newUser]);
        setReferralCode(newReferralCode);
      }
      
      toast.success("Wallet connected successfully!");
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
    setTasks(tasks.map(task => ({ ...task, completed: false })));
    toast.info("Wallet disconnected");
  };

  const completeTask = (taskId: string) => {
    if (!account) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.completed) return;
    
    // Update tasks
    setTasks(tasks.map(t => (
      t.id === taskId ? { ...t, completed: true } : t
    )));
    
    // Update user balance
    setBalance(prevBalance => prevBalance + task.reward);
    
    // Update users array
    setUsers(users.map(user => {
      if (user.address.toLowerCase() === account.toLowerCase()) {
        return {
          ...user,
          balance: user.balance + task.reward,
          tasksCompleted: [...user.tasksCompleted, taskId]
        };
      }
      return user;
    }));
    
    toast.success(`Task completed! +${task.reward} $BORK`);
  };

  const copyReferralLink = () => {
    const referralLink = `https://borkchain.io/ref/${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

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
    copyReferralLink
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
