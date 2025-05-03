
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import BorkDog from '@/components/BorkDog';
import { useBork } from '@/context/BorkContext';

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const { connected, isAdmin } = useBork();
  
  // If already authenticated as admin, redirect to admin dashboard
  useEffect(() => {
    if (connected && isAdmin) {
      navigate('/admin');
    }
  }, [connected, isAdmin, navigate]);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoggingIn(true);
    
    // Simple admin authentication
    if (username === 'admin' && password === 'admin123') {
      setIsLoggingIn(false);
      
      // Set admin session in localStorage
      localStorage.setItem('admin_session', JSON.stringify({
        isLoggedIn: true,
        timestamp: new Date().getTime()
      }));
      
      toast.success('Admin login successful');
      navigate('/admin');
    } else {
      setIsLoggingIn(false);
      toast.error('Invalid username or password');
    }
  };
  
  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <Card className="bork-card max-w-md w-full p-8">
        <div className="flex flex-col items-center mb-6">
          <BorkDog size="medium" />
          <h2 className="text-3xl font-bold mt-4">Admin Login</h2>
          <p className="text-gray-400 mt-2">Enter your credentials to access the admin dashboard</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="text-sm text-gray-400 mb-1 block">Username</label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bork-input"
              placeholder="admin"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="text-sm text-gray-400 mb-1 block">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bork-input"
              placeholder="••••••••"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="bork-button w-full"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
