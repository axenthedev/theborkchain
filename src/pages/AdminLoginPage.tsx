
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import BorkDog from '@/components/BorkDog';
import { useBork } from '@/context/BorkContext';
import { Lock, User } from 'lucide-react';

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const { connected, isAdmin } = useBork();
  
  // Check for existing admin session
  useEffect(() => {
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        if (session.isLoggedIn && session.timestamp) {
          // Check if session is still valid (24 hours expiration)
          const now = new Date().getTime();
          const sessionTime = session.timestamp;
          const sessionAgeHours = (now - sessionTime) / (1000 * 60 * 60);
          
          if (sessionAgeHours < 24) {
            // Session is still valid, redirect to admin dashboard
            navigate('/admin');
          } else {
            // Session expired, remove it from localStorage
            localStorage.removeItem('admin_session');
          }
        }
      } catch (error) {
        console.error('Error parsing admin session:', error);
        localStorage.removeItem('admin_session');
      }
    }
  }, [navigate]);
  
  // If already authenticated as admin, redirect to admin dashboard
  useEffect(() => {
    if (connected && isAdmin) {
      navigate('/admin');
    }
  }, [connected, isAdmin, navigate]);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoggingIn(true);
    
    // Check admin credentials
    if (username === 'admin' && password === 'admin123') {
      // Set admin session in localStorage with timestamp
      localStorage.setItem('admin_session', JSON.stringify({
        isLoggedIn: true,
        timestamp: new Date().getTime()
      }));
      
      toast.success('Admin login successful');
      setIsLoggingIn(false);
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
          <div className="relative">
            <label htmlFor="username" className="text-sm text-gray-400 mb-1 block">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bork-input pl-10"
                placeholder="admin"
                required
              />
            </div>
          </div>
          
          <div className="relative">
            <label htmlFor="password" className="text-sm text-gray-400 mb-1 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bork-input pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="bork-button w-full py-6 h-auto"
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
