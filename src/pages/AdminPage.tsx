
import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useBork } from '@/context/BorkContext';
import { Task, User } from '@/context/BorkContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const AdminPage = () => {
  const { connected, isAdmin, tasks, users } = useBork();
  
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    reward: 50,
    difficulty: 'easy',
    type: 'one-time',
  });
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Guards - redirect if not admin
  if (!connected) {
    return <Navigate to="/" />;
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-8">You don't have admin privileges to view this page.</p>
          <Link to="/">
            <Button className="bork-button">Return to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // In a real app, this would call an API endpoint
    toast.success('Task created successfully!');
    
    // Reset form
    setNewTask({
      title: '',
      description: '',
      reward: 50,
      difficulty: 'easy',
      type: 'one-time',
    });
  };
  
  const handleUpdateTask = () => {
    if (!editingTask) return;
    
    // In a real app, this would call an API endpoint
    toast.success(`Task "${editingTask.title}" updated!`);
    setEditingTask(null);
  };
  
  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    // In a real app, this would call an API endpoint
    toast.success(`User ${editingUser.address} updated!`);
    setEditingUser(null);
  };
  
  const handleDeleteTask = (taskId: string) => {
    // In a real app, this would call an API endpoint
    toast.success('Task deleted successfully!');
  };
  
  const handleDeleteUser = (userId: string) => {
    // In a real app, this would call an API endpoint
    toast.success('User deleted successfully!');
  };
  
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-bork-green neon-text">BorkChain</span> Admin
          </h1>
          <div className="bg-black/50 rounded-lg px-4 py-2 border border-bork-green/30">
            <span className="text-sm text-gray-400">Admin Mode</span>
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
                <Card className="bork-card sticky top-24">
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
                    <Card key={task.id} className="bork-card">
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
                  {users.map((user) => (
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
                        <div className="text-sm text-white">{user.referrals.length}</div>
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
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="stats">
            <h2 className="text-xl font-bold mb-6">Platform Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <Card className="bork-card">
                <h3 className="text-lg font-semibold mb-2">Total Users</h3>
                <div className="text-3xl font-bold text-bork-green">{users.length}</div>
                <div className="text-xs text-gray-400 mt-2">+12% from last week</div>
              </Card>
              
              <Card className="bork-card">
                <h3 className="text-lg font-semibold mb-2">Total Tasks</h3>
                <div className="text-3xl font-bold text-bork-green">{tasks.length}</div>
                <div className="text-xs text-gray-400 mt-2">5 added this week</div>
              </Card>
              
              <Card className="bork-card">
                <h3 className="text-lg font-semibold mb-2">$BORK Distributed</h3>
                <div className="text-3xl font-bold text-bork-green">
                  {users.reduce((total, user) => total + user.balance, 0)}
                </div>
                <div className="text-xs text-gray-400 mt-2">Updated in real-time</div>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bork-card">
                <h3 className="text-lg font-semibold mb-4">Task Completion Rate</h3>
                <div className="h-64 flex items-center justify-center">
                  <div className="w-full h-full flex items-end justify-around">
                    {tasks.map((task) => {
                      const completionRate = Math.floor(Math.random() * 80) + 20; // Mock data
                      return (
                        <div key={task.id} className="flex flex-col items-center">
                          <div 
                            className="w-8 bg-bork-green/70 rounded-t-md transition-all duration-1000 ease-in-out"
                            style={{ height: `${completionRate}%` }}
                          ></div>
                          <div className="mt-2 text-xs text-gray-400">{task.id}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
              
              <Card className="bork-card">
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
