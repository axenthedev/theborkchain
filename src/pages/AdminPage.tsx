
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useBork } from '@/context/BorkContext';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, UserX, Pencil, Award, LinkIcon, ExternalLink, Download } from "lucide-react"

const AdminPage = () => {
  const { connected, isAdmin, users } = useBork();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [adminAccess, setAdminAccess] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [tasks, setTasks] = useState([]);
  const [airdropClaims, setAirdropClaims] = useState([]);
  const [fundraisers, setFundraisers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingBalance, setEditingBalance] = useState('');
  
  // New state for task management
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    reward: 50,
    difficulty: 'easy',
    type: 'daily',
    destination_url: ''
  });

  useEffect(() => {
    // Check for admin session in localStorage
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        if (session.isLoggedIn) {
          // Verify session hasn't expired (24 hours)
          const now = new Date().getTime();
          const sessionTime = session.timestamp;
          const sessionAgeHours = (now - sessionTime) / (1000 * 60 * 60);
          
          if (sessionAgeHours < 24) {
            setAdminAccess(true);
            fetchAllData();
          } else {
            // Session expired, remove it
            localStorage.removeItem('admin_session');
            toast.error('Admin session expired. Please login again.');
            window.location.href = '/admin-login';
          }
        }
      } catch (error) {
        console.error('Error parsing admin session:', error);
        window.location.href = '/admin-login';
      }
    } else {
      // No admin session found
      window.location.href = '/admin-login';
    }
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('joined_at', { ascending: false });
      
      if (usersError) throw usersError;
      setFilteredUsers(usersData || []);
      
      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (tasksError) throw tasksError;
      setTasks(tasksData || []);
      
      // Fetch airdrop claims
      const { data: airdropData, error: airdropError } = await supabase
        .from('airdrop_claims')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (airdropError) throw airdropError;
      setAirdropClaims(airdropData || []);
      
      // Fetch fundraisers/presale
      const { data: fundraisersData, error: fundraisersError } = await supabase
        .from('presale_contributions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fundraisersError) throw fundraisersError;
      setFundraisers(fundraisersData || []);
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter users based on search term
    if (activeTab === 'users' && filteredUsers.length > 0 && searchTerm) {
      const results = filteredUsers.filter(user =>
        user.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.referral_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(results);
    } else if (activeTab === 'users' && !searchTerm) {
      // If search is cleared, fetch all users again
      fetchAllData();
    }
  }, [searchTerm, activeTab]);

  // Admin logout function
  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    setAdminAccess(false);
    toast.success('Admin logged out successfully');
    window.location.href = '/admin-login'; // Ensure complete redirect to login page
  };

  const handleDeleteUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
        
      if (error) throw error;
      
      toast.success('User deleted successfully');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleSaveUserBalance = async () => {
    if (!editingUser || !editingBalance) return;
    
    try {
      const balance = parseInt(editingBalance);
      if (isNaN(balance)) {
        toast.error('Please enter a valid number');
        return;
      }
      
      const { error } = await supabase
        .from('users')
        .update({ 
          balance: balance,
          total_earned: balance // Also update total earned
        })
        .eq('id', editingUser.id);
        
      if (error) throw error;
      
      toast.success('User balance updated');
      setEditingUser(null);
      fetchAllData();
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Failed to update balance');
    }
  };

  const handleAddTask = async () => {
    try {
      // Validate task input
      if (!newTask.title || !newTask.description) {
        toast.error('Task title and description are required');
        return;
      }
      
      const { error } = await supabase
        .from('tasks')
        .insert([newTask]);
        
      if (error) throw error;
      
      toast.success('Task added successfully');
      setNewTask({
        title: '',
        description: '',
        reward: 50,
        difficulty: 'easy',
        type: 'daily',
        destination_url: ''
      });
      fetchAllData();
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      toast.success('Task deleted successfully');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    // Create CSV header row from object keys
    const headers = Object.keys(data[0]);
    
    // Convert data to CSV format
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(fieldName => 
          JSON.stringify(row[fieldName] || '')
        ).join(',')
      )
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!adminAccess) {
    return null; // Will be redirected to login in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-bork-green border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout} className="bg-red-900/30 hover:bg-red-900/60 text-white">
          Logout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4 bg-black/80 border border-bork-green/20">
          <TabsTrigger value="users" className="data-[state=active]:bg-bork-green data-[state=active]:text-black">
            User Management
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-bork-green data-[state=active]:text-black">
            Tasks Management
          </TabsTrigger>
          <TabsTrigger value="airdrop" className="data-[state=active]:bg-bork-green data-[state=active]:text-black">
            Airdrop Management
          </TabsTrigger>
          <TabsTrigger value="fundraisers" className="data-[state=active]:bg-bork-green data-[state=active]:text-black">
            Fundraisers Management
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="animate-fade-in">
          <div className="mb-5">
            <Input
              type="text"
              placeholder="Search users by address or referral code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <Table className="border border-white/10 rounded-lg overflow-hidden">
            <TableCaption>A list of all users.</TableCaption>
            <TableHeader>
              <TableRow className="bg-black/40 hover:bg-black/60">
                <TableHead className="w-[25%]">Address</TableHead>
                <TableHead className="w-[15%]">Referral Code</TableHead>
                <TableHead className="w-[15%]">Balance</TableHead>
                <TableHead className="w-[15%]">Total Earned</TableHead>
                <TableHead className="w-[15%]">Joined</TableHead>
                <TableHead className="w-[15%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-t border-white/5 hover:bg-black/40">
                  <TableCell className="font-medium">{user.address}</TableCell>
                  <TableCell>{user.referral_code}</TableCell>
                  <TableCell>
                    {editingUser?.id === user.id ? (
                      <div className="flex gap-2">
                        <Input 
                          value={editingBalance} 
                          onChange={(e) => setEditingBalance(e.target.value)}
                          className="w-20"
                        />
                        <Button size="sm" variant="outline" onClick={handleSaveUserBalance}>
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setEditingUser(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <span className="text-bork-green">{user.balance}</span>
                    )}
                  </TableCell>
                  <TableCell>{user.total_earned}</TableCell>
                  <TableCell>{new Date(user.joined_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                          setEditingUser(user);
                          setEditingBalance(user.balance.toString());
                        }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Balance
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <UserX className="h-4 w-4 mr-2 text-red-500" />
                              <span className="text-red-500">Delete User</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user from the database.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="animate-fade-in">
          <div className="mb-8 border border-white/10 p-6 rounded-lg bg-black/40">
            <h3 className="font-bold text-xl mb-4 text-white">Add New Task</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Enter task title"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="reward">Reward (BORK)</Label>
                <Input
                  id="reward"
                  type="number"
                  value={newTask.reward}
                  onChange={(e) => setNewTask({...newTask, reward: parseInt(e.target.value) || 0})}
                  placeholder="Enter reward amount"
                  className="mt-1"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Enter task description"
                  className="w-full p-2 bg-black/60 border border-white/20 rounded-md mt-1 min-h-[100px] text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  value={newTask.difficulty}
                  onChange={(e) => setNewTask({...newTask, difficulty: e.target.value})}
                  className="w-full p-2 bg-black/60 border border-white/20 rounded-md mt-1 text-white"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="type">Task Type</Label>
                <select
                  id="type"
                  value={newTask.type}
                  onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                  className="w-full p-2 bg-black/60 border border-white/20 rounded-md mt-1 text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="one-time">One-time</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="destination_url">Destination URL (Optional)</Label>
                <Input
                  id="destination_url"
                  value={newTask.destination_url}
                  onChange={(e) => setNewTask({...newTask, destination_url: e.target.value})}
                  placeholder="https://example.com"
                  className="mt-1"
                />
              </div>
              
              <div className="md:col-span-2 mt-2">
                <Button onClick={handleAddTask} className="w-full md:w-auto">
                  Add Task
                </Button>
              </div>
            </div>
          </div>

          <Table className="border border-white/10 rounded-lg overflow-hidden">
            <TableCaption>All tasks in the system.</TableCaption>
            <TableHeader>
              <TableRow className="bg-black/40 hover:bg-black/60">
                <TableHead className="w-[25%]">Title</TableHead>
                <TableHead className="w-[30%]">Description</TableHead>
                <TableHead className="w-[10%]">Reward</TableHead>
                <TableHead className="w-[10%]">Difficulty</TableHead>
                <TableHead className="w-[10%]">Type</TableHead>
                <TableHead className="w-[15%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    No tasks found. Create your first task above.
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.id} className="border-t border-white/5 hover:bg-black/40">
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.description.substring(0, 50)}...</TableCell>
                    <TableCell className="text-bork-green">{task.reward}</TableCell>
                    <TableCell>{task.difficulty}</TableCell>
                    <TableCell>{task.type}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          
                          {task.destination_url && (
                            <DropdownMenuItem onClick={() => window.open(task.destination_url, '_blank')}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open URL
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <span className="text-red-500">Delete Task</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove the task from the system. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Airdrop Tab */}
        <TabsContent value="airdrop" className="animate-fade-in">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="font-bold text-xl text-white">Airdrop Claims</h3>
            <Button variant="outline" onClick={() => exportToCSV(airdropClaims, 'airdrop-claims')}>
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </div>

          <Table className="border border-white/10 rounded-lg overflow-hidden">
            <TableCaption>Users who have claimed airdrop or registered for Premier Pass.</TableCaption>
            <TableHeader>
              <TableRow className="bg-black/40 hover:bg-black/60">
                <TableHead>Wallet Address</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Twitter Handle</TableHead>
                <TableHead>Telegram Handle</TableHead>
                <TableHead>Eligible</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {airdropClaims.map((claim) => (
                <TableRow key={claim.id} className="border-t border-white/5 hover:bg-black/40">
                  <TableCell className="font-medium">{claim.wallet_address}</TableCell>
                  <TableCell>{claim.email || 'N/A'}</TableCell>
                  <TableCell>{claim.twitter_handle || 'N/A'}</TableCell>
                  <TableCell>{claim.telegram_handle || 'N/A'}</TableCell>
                  <TableCell>{claim.eligible ? '✓' : '✗'}</TableCell>
                  <TableCell>{claim.paid ? '✓' : '✗'}</TableCell>
                  <TableCell>{new Date(claim.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {airdropClaims.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    No airdrop claims found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Fundraisers Tab */}
        <TabsContent value="fundraisers" className="animate-fade-in">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="font-bold text-xl text-white">Fundraiser Contributions</h3>
            <Button variant="outline" onClick={() => exportToCSV(fundraisers, 'fundraiser-contributions')}>
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </div>

          <div className="mb-8 p-6 border border-white/10 rounded-lg bg-black/40">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Total Raised</h4>
                <p className="text-3xl font-bold text-bork-green">
                  {fundraisers.reduce((total, item) => total + Number(item.amount), 0).toFixed(2)} USDT
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Contributors</h4>
                <p className="text-3xl font-bold text-bork-green">{fundraisers.length}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Average Contribution</h4>
                <p className="text-3xl font-bold text-bork-green">
                  {fundraisers.length > 0 
                    ? (fundraisers.reduce((total, item) => total + Number(item.amount), 0) / fundraisers.length).toFixed(2) 
                    : '0.00'} USDT
                </p>
              </div>
            </div>
          </div>

          <Table className="border border-white/10 rounded-lg overflow-hidden">
            <TableCaption>All fundraiser/presale contributions.</TableCaption>
            <TableHeader>
              <TableRow className="bg-black/40 hover:bg-black/60">
                <TableHead>Wallet Address</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Transaction Hash</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fundraisers.map((contribution) => (
                <TableRow key={contribution.id} className="border-t border-white/5 hover:bg-black/40">
                  <TableCell className="font-medium">{contribution.wallet_address}</TableCell>
                  <TableCell className="text-bork-green">{contribution.amount}</TableCell>
                  <TableCell>{contribution.currency}</TableCell>
                  <TableCell className="font-mono text-xs">
                    <a 
                      href={`https://etherscan.io/tx/${contribution.tx_hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-bork-green"
                    >
                      {`${contribution.tx_hash.substring(0, 8)}...${contribution.tx_hash.substring(contribution.tx_hash.length - 8)}`}
                      <LinkIcon className="h-3 w-3 ml-1" />
                    </a>
                  </TableCell>
                  <TableCell>{contribution.approved ? '✓' : '❌'}</TableCell>
                  <TableCell>{new Date(contribution.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {fundraisers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    No fundraiser contributions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
