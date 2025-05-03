
import React, { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useBork } from '@/context/BorkContext';
import { Task, User } from '@/context/BorkContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import BorkDog from '@/components/BorkDog';

const AdminPage = () => {
  const { connected, isAdmin, tasks, users } = useBork();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    reward: 50,
    difficulty: 'easy',
    type: 'one-time',
    destinationUrl: ''
  });
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Check admin session on page load
  useEffect(() => {
    const checkAdminSession = () => {
      const session = localStorage.getItem('admin_session');
      if (session) {
        const parsedSession = JSON.parse(session);
        const currentTime = new Date().getTime();
        const sessionTime = parsedSession.timestamp;
        
        // Admin session expires after 1 hour
        if (parsedSession.isLoggedIn && (currentTime - sessionTime < 3600000)) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('admin_session');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };
    
    checkAdminSession();
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    setIsAuthenticated(false);
    toast.info('Admin logged out');
    navigate('/admin/login');
  };
  
  // Guards - redirect if not admin
  if (!isAuthenticated && !isAdmin) {
    return <Navigate to="/admin/login" />;
  }
  
  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const storedTasks = localStorage.getItem('borkchain_tasks');
    let tasksArray = storedTasks ? JSON.parse(storedTasks) : [];
    
    // Create new task
    const newTaskObject: Task = {
      id: `${tasksArray.length + 1}`,
      title: newTask.title || '',
      description: newTask.description || '',
      reward: newTask.reward || 0,
      completed: false,
      difficulty: newTask.difficulty as 'easy' | 'medium' | 'hard',
      type: newTask.type as 'daily' | 'weekly' | 'one-time',
      destinationUrl: newTask.destinationUrl
    };
    
    tasksArray.push(newTaskObject);
    localStorage.setItem('borkchain_tasks', JSON.stringify(tasksArray));
    toast.success('Task created successfully!');
    
    // Reset form
    setNewTask({
      title: '',
      description: '',
      reward: 50,
      difficulty: 'easy',
      type: 'one-time',
      destinationUrl: ''
    });
    
    // Refresh page to get updated data
    window.location.reload();
  };
  
  const handleUpdateTask = () => {
    if (!editingTask) return;
    
    const storedTasks = localStorage.getItem('borkchain_tasks');
    let tasksArray = storedTasks ? JSON.parse(storedTasks) : [];
    
    // Update task
    tasksArray = tasksArray.map((t: Task) => t.id === editingTask.id ? editingTask : t);
    localStorage.setItem('borkchain_tasks', JSON.stringify(tasksArray));
    
    toast.success(`Task "${editingTask.title}" updated!`);
    setEditingTask(null);
    
    // Refresh page to get updated data
    window.location.reload();
  };
  
  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    const storedUsers = localStorage.getItem('borkchain_users');
    let usersArray = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Update user
    usersArray = usersArray.map((u: User) => u.id === editingUser.id ? editingUser : u);
    localStorage.setItem('borkchain_users', JSON.stringify(usersArray));
    
    toast.success(`User ${editingUser.address} updated!`);
    setEditingUser(null);
    
    // Refresh page to get updated data
    window.location.reload();
  };
  
  const handleDeleteTask = (taskId: string) => {
    const storedTasks = localStorage.getItem('borkchain_tasks');
    let tasksArray = storedTasks ? JSON.parse(storedTasks) : [];
    
    // Delete task
    tasksArray = tasksArray.filter((t: Task) => t.id !== taskId);
    localStorage.setItem('borkchain_tasks', JSON.stringify(tasksArray));
    
    toast.success('Task deleted successfully!');
    
    // Refresh page to get updated data
    window.location.reload();
  };
  
  const handleDeleteUser = (userId: string) => {
    const storedUsers = localStorage.getItem('borkchain_users');
    let usersArray = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Delete user
    usersArray = usersArray.filter((u: User) => u.id !== userId);
    localStorage.setItem('borkchain_users', JSON.stringify(usersArray));
    
    toast.success('User deleted successfully!');
    
    // Refresh page to get updated data
    window.location.reload();
  };
  
  // Calculate total stats
  const totalTasks = tasks.length;
  const totalUsers = users.length;
  const totalTasksCompleted = users.reduce((acc, user) => acc + user.tasksCompleted.length, 0);
  const totalBorkDistributed = users.reduce((acc, user) => acc + user.balance, 0);
  
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-bork-green neon-text">BorkChain</span> Admin
          </h1>
          <div className="flex items-center gap-4">
            <div className="bg-black/50 rounded-lg px-4 py-2 border border-bork-green/30">
              <span className="text-sm text-gray-400">Admin Mode</span>
            </div>
            <Button variant="outline" onClick={handleLogout} className="border-red-500/50 text-red-500">
              Logout
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="tasks">
          <TabsList className="bg-black/50 border border-white/10 mb-8">
            <TabsTrigger value="tasks" className="data-[state=active]:bg-bork-green data-[state=active]:text-black">Tasks</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-bork-green data-[state=active]:text-black">Users</TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-bork-green data-[state=active]:text-black">Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Task Creation Form */}
              <div className="lg:col-span-1">
                <Card className="bork-card sticky top-24 border-bork-green/30 bg-black/50 backdrop-blur-md shadow-[0_0_15px_rgba(57,255,20,0.15)]">
                  <h2 className="text-xl font-bold mb-6">Create New Task</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="text-sm text-gray-400 mb-1 block">Title</label>
                      <Input
                        id="title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                        className="bork-input"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="text-sm text-gray-400 mb-1 block">Description</label>
                      <Input
                        id="description"
                        value={newTask.description}
                        onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                        className="bork-input"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="reward" className="text-sm text-gray-400 mb-1 block">Reward ($BORK)</label>
                      <Input
                        id="reward"
                        type="number"
                        value={newTask.reward}
                        onChange={(e) => setNewTask({...newTask, reward: parseInt(e.target.value)})}
                        className="bork-input"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="destinationUrl" className="text-sm text-gray-400 mb-1 block">Destination URL (Optional)</label>
                      <Input
                        id="destinationUrl"
                        value={newTask.destinationUrl}
                        onChange={(e) => setNewTask({...newTask, destinationUrl: e.target.value})}
                        className="bork-input"
                        placeholder="https://"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="difficulty" className="text-sm text-gray-400 mb-1 block">Difficulty</label>
                      <Select 
                        value={newTask.difficulty as string} 
                        onValueChange={(value) => setNewTask({...newTask, difficulty: value as 'easy' | 'medium' | 'hard'})}
                      >
                        <SelectTrigger className="bork-input">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label htmlFor="type" className="text-sm text-gray-400 mb-1 block">Type</label>
                      <Select 
                        value={newTask.type as string} 
                        onValueChange={(value) => setNewTask({...newTask, type: value as 'daily' | 'weekly' | 'one-time'})}
                      >
                        <SelectTrigger className="bork-input">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one-time">One-time</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button onClick={handleCreateTask} className="bork-button w-full mt-4">
                      Create Task
                    </Button>
                  </div>
                </Card>
              </div>
              
              {/* Task List */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold mb-6">Manage Tasks</h2>
                
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <Card key={task.id} className="bork-card border-bork-green/30 bg-black/50 backdrop-blur-md shadow-[0_0_15px_rgba(57,255,20,0.15)]">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-bold">{task.title}</h3>
                          <p className="text-gray-400 text-sm">{task.description}</p>
                          <div className="flex gap-2 mt-2">
                            <div className="text-xs bg-black/50 rounded-full px-2 py-0.5 border border-white/10">
                              {task.difficulty}
                            </div>
                            <div className="text-xs bg-black/50 rounded-full px-2 py-0.5 border border-white/10">
                              {task.type}
                            </div>
                            <div className="text-xs bg-black/50 rounded-full px-2 py-0.5 border border-green-500/30 text-green-500">
                              {task.reward} $BORK
                            </div>
                          </div>
                          {task.destinationUrl && (
                            <div className="mt-2">
                              <a 
                                href={task.destinationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-bork-green hover:underline inline-flex items-center"
                              >
                                <Link2 size={12} className="mr-1" />
                                {task.destinationUrl}
                              </a>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="border-bork-green/50 text-bork-green"
                                onClick={() => setEditingTask(task)}
                              >
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bork-card">
                              <DialogHeader>
                                <DialogTitle>Edit Task</DialogTitle>
                              </DialogHeader>
                              {editingTask && (
                                <div className="space-y-4 py-4">
                                  <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Title</label>
                                    <Input
                                      value={editingTask.title}
                                      onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                                      className="bork-input"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Description</label>
                                    <Input
                                      value={editingTask.description}
                                      onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                                      className="bork-input"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Reward</label>
                                    <Input
                                      type="number"
                                      value={editingTask.reward}
                                      onChange={(e) => setEditingTask({...editingTask, reward: parseInt(e.target.value)})}
                                      className="bork-input"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Destination URL</label>
                                    <Input
                                      value={editingTask.destinationUrl || ''}
                                      onChange={(e) => setEditingTask({...editingTask, destinationUrl: e.target.value})}
                                      className="bork-input"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Difficulty</label>
                                    <Select 
                                      value={editingTask.difficulty} 
                                      onValueChange={(value) => setEditingTask({...editingTask, difficulty: value as 'easy' | 'medium' | 'hard'})}
                                    >
                                      <SelectTrigger className="bork-input">
                                        <SelectValue placeholder="Select difficulty" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="easy">Easy</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="hard">Hard</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Type</label>
                                    <Select 
                                      value={editingTask.type} 
                                      onValueChange={(value) => setEditingTask({...editingTask, type: value as 'daily' | 'weekly' | 'one-time'})}
                                    >
                                      <SelectTrigger className="bork-input">
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="one-time">One-time</SelectItem>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingTask(null)}>
                                  Cancel
                                </Button>
                                <Button className="bork-button" onClick={handleUpdateTask}>
                                  Save Changes
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-red-500/50 text-red-500"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {tasks.length === 0 && (
                    <Card className="bork-card border-white/10 bg-black/30 py-8 text-center">
                      <p className="text-gray-400">No tasks created yet. Create your first task.</p>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <h2 className="text-xl font-bold mb-6">Manage Users</h2>
            
            <div className="overflow-hidden rounded-lg border border-white/10">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-black/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Address</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Balance</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tasks</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Referrals</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-black/30 divide-y divide-white/10">
                  {users.map((user) => {
                    // Get referral count for this user
                    const referralCount = users.filter(u => u.referredBy === user.address).length;
                    
                    return (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{user.address}</div>
                          <div className="text-xs text-gray-400">Joined: {new Date(user.joinedAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-bork-green">{user.balance} $BORK</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{user.tasksCompleted.length}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{referralCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-bork-green/50 text-bork-green"
                                  onClick={() => setEditingUser(user)}
                                >
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bork-card">
                                <DialogHeader>
                                  <DialogTitle>Edit User</DialogTitle>
                                </DialogHeader>
                                {editingUser && (
                                  <div className="space-y-4 py-4">
                                    <div>
                                      <label className="text-sm text-gray-400 mb-1 block">Address</label>
                                      <Input
                                        value={editingUser.address}
                                        disabled
                                        className="bork-input opacity-70"
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="text-sm text-gray-400 mb-1 block">Balance</label>
                                      <Input
                                        type="number"
                                        value={editingUser.balance}
                                        onChange={(e) => setEditingUser({...editingUser, balance: parseInt(e.target.value)})}
                                        className="bork-input"
                                      />
                                    </div>
                                    
                                    <div className="flex items-center">
                                      <input
                                        type="checkbox"
                                        id="isAdmin"
                                        checked={editingUser.isAdmin}
                                        onChange={(e) => setEditingUser({...editingUser, isAdmin: e.target.checked})}
                                        className="mr-2"
                                      />
                                      <label htmlFor="isAdmin" className="text-sm text-gray-400">Admin Privileges</label>
                                    </div>
                                  </div>
                                )}
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setEditingUser(null)}>
                                    Cancel
                                  </Button>
                                  <Button className="bork-button" onClick={handleUpdateUser}>
                                    Save Changes
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-red-500/50 text-red-500"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="stats">
            <h2 className="text-xl font-bold mb-6">Platform Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <Card className="bork-card border-bork-green/30 bg-black/50 backdrop-blur-md shadow-[0_0_15px_rgba(57,255,20,0.15)]">
                <h3 className="text-lg font-semibold mb-2">Total Users</h3>
                <div className="text-3xl font-bold text-bork-green">{totalUsers}</div>
                <div className="text-xs text-gray-400 mt-2">Registered users</div>
              </Card>
              
              <Card className="bork-card border-bork-green/30 bg-black/50 backdrop-blur-md shadow-[0_0_15px_rgba(57,255,20,0.15)]">
                <h3 className="text-lg font-semibold mb-2">Total Tasks</h3>
                <div className="text-3xl font-bold text-bork-green">{totalTasks}</div>
                <div className="text-xs text-gray-400 mt-2">Available tasks</div>
              </Card>
              
              <Card className="bork-card border-bork-green/30 bg-black/50 backdrop-blur-md shadow-[0_0_15px_rgba(57,255,20,0.15)]">
                <h3 className="text-lg font-semibold mb-2">$BORK Distributed</h3>
                <div className="text-3xl font-bold text-bork-green">
                  {totalBorkDistributed}
                </div>
                <div className="text-xs text-gray-400 mt-2">Total rewards given</div>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bork-card border-bork-green/30 bg-black/50 backdrop-blur-md shadow-[0_0_15px_rgba(57,255,20,0.15)]">
                <h3 className="text-lg font-semibold mb-4">Task Completion Stats</h3>
                <div className="h-64 flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center">
                    <BorkDog size="small" className="mb-4" />
                    <div className="text-4xl font-bold text-bork-green">{totalTasksCompleted}</div>
                    <div className="text-sm text-gray-400 mt-2">Total completed tasks</div>
                  </div>
                </div>
              </Card>
              
              <Card className="bork-card border-bork-green/30 bg-black/50 backdrop-blur-md shadow-[0_0_15px_rgba(57,255,20,0.15)]">
                <h3 className="text-lg font-semibold mb-4">User Growth</h3>
                <div className="h-64 flex items-center justify-center">
                  <div className="w-full h-full flex items-end justify-center">
                    <div className="w-full h-full bg-bork-green/5 rounded-md border border-white/10 relative">
                      <div className="absolute inset-0 flex items-end">
                        <div
                          className="bg-gradient-to-t from-bork-green/60 to-bork-green/10 w-full rounded-b-md"
                          style={{ height: '70%' }}
                        >
                          <svg 
                            className="absolute bottom-0 left-0 w-full"
                            viewBox="0 0 400 150" 
                            preserveAspectRatio="none"
                          >
                            <path 
                              d="M0,150 C100,120 200,180 400,110 L400,150 L0,150 Z" 
                              fill="url(#gradient)" 
                              className="transition-all duration-1000 ease-in-out"
                            />
                            <defs>
                              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#39FF14" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#39FF14" stopOpacity="0.1" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
