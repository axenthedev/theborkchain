import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useBork } from '@/context/BorkContext';
import BorkDog from '@/components/BorkDog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const HomePage = () => {
  const { connected, connectWallet, balance, tasks } = useBork();
  const completedTasksCount = tasks.filter(task => task.completed).length;
  
  // Ref for the hero section to apply parallax effect
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrollY = window.scrollY;
      heroRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-black">
        <div 
          ref={heroRef}
          className="absolute inset-0 w-full h-full bg-[radial-gradient(circle,rgba(57,255,20,0.15)_0%,rgba(0,0,0,0)_70%)]"
        ></div>
        
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#39FF1410_1px,transparent_1px),linear-gradient(to_bottom,#39FF1410_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                The <span className="text-bork-green neon-text animate-pulse-green">$BORK</span> revolution starts on Layer 2
              </h1>
              
              <p className="text-gray-300 text-lg mb-8">
                Join the pack and earn $BORK by completing missions and referring friends. The first memecoin that rewards your participation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={connectWallet} 
                  className="bork-button text-lg px-8 py-3"
                  disabled={connected}
                >
                  {connected ? 'Wallet Connected' : 'Connect Wallet'}
                </Button>
                
                <Link to="/tasks">
                  <Button 
                    variant="outline" 
                    className="border-2 border-bork-green text-bork-green hover:bg-bork-green hover:text-black transition-all duration-300 text-lg px-8 py-3"
                  >
                    View Tasks
                  </Button>
                </Link>
              </div>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="bg-black/50 rounded-lg border border-white/10 px-4 py-2 flex items-center">
                  <div className="w-3 h-3 bg-bork-green rounded-full mr-2 animate-pulse"></div>
                  <span>Users: 7,821</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <BorkDog size="large" className="filter drop-shadow-[0_0_20px_rgba(57,255,20,0.3)]" />
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <div className="animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            <span className="text-bork-green neon-text">How</span> It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bork-card">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-bork-green/20 flex items-center justify-center">
                  <span className="text-bork-green text-2xl font-bold">1</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Connect Your Wallet</h3>
              <p className="text-gray-400 text-center">
                Connect your MetaMask wallet to join the BorkChain community and start earning $BORK tokens.
              </p>
            </div>
            
            <div className="bork-card">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-bork-green/20 flex items-center justify-center">
                  <span className="text-bork-green text-2xl font-bold">2</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Complete Tasks</h3>
              <p className="text-gray-400 text-center">
                Browse available tasks, from social media follows to community contributions, and complete them to earn rewards.
              </p>
            </div>
            
            <div className="bork-card">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-bork-green/20 flex items-center justify-center">
                  <span className="text-bork-green text-2xl font-bold">3</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Refer & Earn More</h3>
              <p className="text-gray-400 text-center">
                Share your unique referral link with friends. When they join, both of you earn additional $BORK rewards.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Tokenomics Preview */}
      <section className="py-20 bg-[#040404]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            <span className="text-bork-green neon-text">$BORK</span> Tokenomics
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bork-card">
                  <h3 className="text-xl font-bold mb-2">Total Supply</h3>
                  <p className="text-bork-green text-2xl font-bold">1,000,000,000</p>
                </div>
                
                <div className="bork-card">
                  <h3 className="text-xl font-bold mb-2">Task Rewards</h3>
                  <p className="text-bork-green text-2xl font-bold">40%</p>
                </div>
                
                <div className="bork-card">
                  <h3 className="text-xl font-bold mb-2">Community</h3>
                  <p className="text-bork-green text-2xl font-bold">30%</p>
                </div>
                
                <div className="bork-card">
                  <h3 className="text-xl font-bold mb-2">Dev & Marketing</h3>
                  <p className="text-bork-green text-2xl font-bold">30%</p>
                </div>
              </div>
              
              <div className="mt-8">
                <Link to="/tokenomics">
                  <Button variant="outline" className="border border-bork-green text-bork-green hover:bg-bork-green hover:text-black">
                    View Full Tokenomics
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 rounded-full border-8 border-bork-green/30 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border-4 border-bork-green/60 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-bork-green/20 flex items-center justify-center">
                      <span className="text-bork-green text-4xl font-bold">$BORK</span>
                    </div>
                  </div>
                </div>
                
                {/* Animated particles around token */}
                <div className="absolute top-0 left-0 w-full h-full">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i}
                      className="absolute w-3 h-3 rounded-full bg-bork-green animate-float"
                      style={{ 
                        top: `${Math.random() * 100}%`, 
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${2 + Math.random() * 3}s`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-bork-green/5"></div>
        
        {/* Green animated light source */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-bork-green/20 blur-3xl animate-pulse"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="bork-card max-w-3xl mx-auto text-center">
            <BorkDog size="small" className="mx-auto mb-6" />
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to earn <span className="text-bork-green neon-text">$BORK</span>?
            </h2>
            
            <p className="text-gray-300 text-lg mb-8">
              Connect your wallet and start completing tasks to earn rewards. Join the BorkChain community today!
            </p>
            
            {connected ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                <Card className="bg-black/50 border-bork-green/30 p-4">
                  <div className="text-gray-400">Your Balance</div>
                  <div className="text-2xl font-bold text-bork-green">{balance} $BORK</div>
                </Card>
                
                <Card className="bg-black/50 border-bork-green/30 p-4">
                  <div className="text-gray-400">Completed Tasks</div>
                  <div className="text-2xl font-bold text-bork-green">{completedTasksCount}/{tasks.length}</div>
                </Card>
                
                <div className="sm:col-span-2 mt-4">
                  <Link to="/tasks" className="w-full">
                    <Button className="bork-button w-full text-lg">View Tasks Dashboard</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Button 
                onClick={connectWallet} 
                className="bork-button text-lg px-8 py-3"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
