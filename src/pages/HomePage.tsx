import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useBork } from '@/context/BorkContext';
import BorkDog from '@/components/BorkDog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Calendar, Flag, Rocket, Star, Wallet } from 'lucide-react';

const HomePage = () => {
  const { connected, connectWallet, balance, tasks } = useBork();
  const completedTasksCount = tasks.filter(task => task.completed).length;
  
  // Refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const roadmapRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  
  // Parallax effect for hero section
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrollY = window.scrollY;
      heroRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Animation for sections when they come into view
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    if (roadmapRef.current) observer.observe(roadmapRef.current);
    if (howItWorksRef.current) observer.observe(howItWorksRef.current);
    
    return () => {
      if (roadmapRef.current) observer.unobserve(roadmapRef.current);
      if (howItWorksRef.current) observer.unobserve(howItWorksRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Updated to match the image design */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-black">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#39FF1410_1px,transparent_1px),linear-gradient(to_bottom,#39FF1410_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        <div className="container mx-auto px-6 relative z-10 pt-16 md:pt-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16">
            {/* Left side content - Text and CTA */}
            <div className="w-full md:w-1/2 text-left">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
                Earn <span className="text-bork-green neon-text">$BORK</span>
                <br />
                by Completing
                <br />
                Tasks!
              </h1>
              
              <p className="text-gray-300 text-lg sm:text-xl mb-10 leading-relaxed max-w-xl">
                Join the pack on BorkChain, the memecoin-powered task platform where completing missions earns you $BORK tokens.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={connectWallet} 
                  className="bg-bork-green hover:bg-bork-green/90 text-black font-bold px-6 py-6 h-auto rounded-xl text-lg flex items-center gap-2"
                  disabled={connected}
                >
                  <Wallet className="w-5 h-5" />
                  {connected ? 'Wallet Connected' : 'Connect Wallet'}
                </Button>
                
                <Link to="/tasks">
                  <Button 
                    variant="outline" 
                    className="border-2 border-bork-green text-bork-green hover:bg-bork-green/10 px-6 py-6 h-auto rounded-xl text-lg"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right side content - Dog mascot with neon effect */}
            <div className="w-full md:w-1/2 flex justify-center md:justify-end">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-bork-green/20 blur-3xl animate-pulse"></div>
                <BorkDog 
                  size="large" 
                  className="w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 filter drop-shadow-[0_0_30px_rgba(57,255,20,0.7)] animate-float" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Roadmap Section */}
      <section id="roadmap" ref={roadmapRef} className="py-20 bg-black opacity-0 transition-all duration-700 ease-out">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            <span className="text-bork-green neon-text">Roadmap</span>
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">Our journey to take over the memecoin universe, one $BORK at a time</p>
          
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-bork-green/80 via-bork-green to-bork-green/20 transform -translate-x-1/2"></div>
            
            <div className="space-y-24 relative">
              {/* Phase 1 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right order-2 md:order-1">
                  <div className="bork-card transform transition-all hover:scale-105 hover:-rotate-1">
                    <h3 className="text-2xl font-bold mb-2">Phase 1: Launch</h3>
                    <p className="text-gray-400">Website launch, community building, and initial task rewards distribution. The beginning of the $BORK revolution.</p>
                    <div className="flex justify-end mt-4">
                      <div className="bg-bork-green/20 text-bork-green px-3 py-1 rounded-full text-sm">
                        LIVE NOW
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:w-0 relative my-6 md:my-0 order-1 md:order-2">
                  <div className="h-12 w-12 rounded-full bg-bork-green flex items-center justify-center relative z-10 mx-auto">
                    <Rocket className="h-6 w-6 text-black" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-16 w-16 bg-bork-green/30 rounded-full animate-pulse"></div>
                </div>
                <div className="md:w-1/2 md:pl-12 order-3"></div>
              </div>
              
              {/* Phase 2 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 order-2"></div>
                <div className="md:w-0 relative my-6 md:my-0 order-1">
                  <div className="h-12 w-12 rounded-full bg-bork-green/80 flex items-center justify-center relative z-10 mx-auto">
                    <Star className="h-6 w-6 text-black" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-16 w-16 bg-bork-green/20 rounded-full animate-pulse"></div>
                </div>
                <div className="md:w-1/2 md:pl-12 md:text-left order-3">
                  <div className="bork-card transform transition-all hover:scale-105 hover:rotate-1">
                    <h3 className="text-2xl font-bold mb-2">Phase 2: Community Growth</h3>
                    <p className="text-gray-400">Expanding the pack with referral program, community events, and enhanced rewards system.</p>
                    <div className="flex justify-start mt-4">
                      <div className="bg-black/50 text-gray-300 border border-bork-green/30 px-3 py-1 rounded-full text-sm">
                        Q2 2025
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Phase 3 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right order-2 md:order-1">
                  <div className="bork-card transform transition-all hover:scale-105 hover:-rotate-1">
                    <h3 className="text-2xl font-bold mb-2">Phase 3: Airdrop Campaign</h3>
                    <p className="text-gray-400">Massive airdrop for early supporters and task completers. The most generous drop in memecoin history.</p>
                    <div className="flex justify-end mt-4">
                      <div className="bg-black/50 text-gray-300 border border-bork-green/30 px-3 py-1 rounded-full text-sm">
                        Q3 2025
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:w-0 relative my-6 md:my-0 order-1 md:order-2">
                  <div className="h-12 w-12 rounded-full bg-bork-green/60 flex items-center justify-center relative z-10 mx-auto">
                    <Calendar className="h-6 w-6 text-black" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-16 w-16 bg-bork-green/20 rounded-full animate-pulse"></div>
                </div>
                <div className="md:w-1/2 md:pl-12 order-3"></div>
              </div>
              
              {/* Phase 4 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 order-2"></div>
                <div className="md:w-0 relative my-6 md:my-0 order-1">
                  <div className="h-12 w-12 rounded-full bg-bork-green/40 flex items-center justify-center relative z-10 mx-auto">
                    <Flag className="h-6 w-6 text-black" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-16 w-16 bg-bork-green/20 rounded-full animate-pulse"></div>
                </div>
                <div className="md:w-1/2 md:pl-12 md:text-left order-3">
                  <div className="bork-card transform transition-all hover:scale-105 hover:rotate-1">
                    <h3 className="text-2xl font-bold mb-2">Phase 4: Exchange Listings</h3>
                    <p className="text-gray-400">$BORK goes live on major exchanges, bringing our memecoin to global markets and moon-bound trajectories.</p>
                    <div className="flex justify-start mt-4">
                      <div className="bg-black/50 text-gray-300 border border-bork-green/30 px-3 py-1 rounded-full text-sm">
                        Q4 2025
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 flex justify-center">
            <Link to="/coinomics">
              <Button 
                variant="outline" 
                className="border-2 border-bork-green text-bork-green hover:bg-bork-green hover:text-black transition-all duration-300 text-lg group"
              >
                <span>View Coinomics</span>
                <ArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section ref={howItWorksRef} className="py-20 bg-[#040404] opacity-0 transition-all duration-700 ease-out">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            <span className="text-bork-green neon-text">How</span> It Works
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">Three simple steps to join the $BORK revolution</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bork-card transform transition-all hover:scale-105 hover:border-bork-green">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-bork-green/20 flex items-center justify-center relative">
                  <span className="text-bork-green text-2xl font-bold relative z-10">1</span>
                  <div className="absolute inset-0 rounded-full bg-bork-green/10 animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Connect Your Wallet</h3>
              <p className="text-gray-400 text-center">
                Connect your MetaMask wallet to join the BorkChain community and start earning $BORK coins.
              </p>
            </div>
            
            <div className="bork-card transform transition-all hover:scale-105 hover:border-bork-green">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-bork-green/20 flex items-center justify-center relative">
                  <span className="text-bork-green text-2xl font-bold relative z-10">2</span>
                  <div className="absolute inset-0 rounded-full bg-bork-green/10 animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Complete Tasks</h3>
              <p className="text-gray-400 text-center">
                Browse available tasks, from social media follows to community contributions, and complete them to earn coin rewards.
              </p>
            </div>
            
            <div className="bork-card transform transition-all hover:scale-105 hover:border-bork-green">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-bork-green/20 flex items-center justify-center relative">
                  <span className="text-bork-green text-2xl font-bold relative z-10">3</span>
                  <div className="absolute inset-0 rounded-full bg-bork-green/10 animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Refer & Earn More</h3>
              <p className="text-gray-400 text-center">
                Share your unique referral link with friends. When they join, both of you earn additional $BORK coin rewards.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Coinomics Preview */}
      <section className="py-20 bg-black relative">
        <div className="absolute inset-0 bg-bork-green/5"></div>
        
        {/* Green animated light source */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-bork-green/20 blur-3xl animate-pulse"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            <span className="text-bork-green neon-text">$BORK</span> Coinomics
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">The economics behind the world's most innovative memecoin</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bork-card transform transition-all hover:scale-105 hover:border-bork-green group">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-bork-green transition-colors">Total Supply</h3>
                  <p className="text-bork-green text-3xl font-bold">1,000,000,000</p>
                </div>
                
                <div className="bork-card transform transition-all hover:scale-105 hover:border-bork-green group">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-bork-green transition-colors">Task Rewards</h3>
                  <p className="text-bork-green text-3xl font-bold">40%</p>
                </div>
                
                <div className="bork-card transform transition-all hover:scale-105 hover:border-bork-green group">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-bork-green transition-colors">Community</h3>
                  <p className="text-bork-green text-3xl font-bold">30%</p>
                </div>
                
                <div className="bork-card transform transition-all hover:scale-105 hover:border-bork-green group">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-bork-green transition-colors">Dev & Marketing</h3>
                  <p className="text-bork-green text-3xl font-bold">30%</p>
                </div>
              </div>
              
              <div className="mt-10 flex justify-center lg:justify-start">
                <Link to="/coinomics">
                  <Button 
                    className="bork-button text-lg px-8 py-3 group"
                  >
                    <span>Explore Coinomics</span>
                    <ArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-8 border-bork-green/30 flex items-center justify-center relative">
                  <div className="w-52 h-52 md:w-64 md:h-64 rounded-full border-4 border-bork-green/60 flex items-center justify-center">
                    <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-bork-green/20 flex items-center justify-center">
                      <span className="text-bork-green text-4xl md:text-5xl font-bold neon-text">$BORK</span>
                    </div>
                  </div>
                </div>
                
                {/* Animated particles around coin */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-3 h-3 rounded-full bg-bork-green animate-float"
                    style={{ 
                      top: `${Math.random() * 100}%`, 
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${3 + Math.random() * 4}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-20 bg-[#040404] relative overflow-hidden">
        <div className="absolute inset-0 bg-bork-green/5"></div>
        
        {/* Green animated light source */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-bork-green/20 blur-3xl animate-pulse"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="bork-card max-w-3xl mx-auto text-center transform hover:scale-105 transition-all duration-500 hover:border-bork-green">
            <BorkDog size="small" className="mx-auto mb-6 animate-bounce-small" />
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to earn <span className="text-bork-green neon-text">$BORK</span>?
            </h2>
            
            <p className="text-gray-300 text-lg mb-8">
              Connect your wallet and start completing tasks to earn rewards. Join the BorkChain community today!
            </p>
            
            {connected ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md mx-auto">
                <Card className="bg-black/80 border-bork-green/30 p-6 hover:border-bork-green/70 transition-all">
                  <div className="text-gray-400">Your Balance</div>
                  <div className="text-3xl font-bold text-bork-green mt-2">{balance} $BORK</div>
                </Card>
                
                <Card className="bg-black/80 border-bork-green/30 p-6 hover:border-bork-green/70 transition-all">
                  <div className="text-gray-400">Completed Tasks</div>
                  <div className="text-3xl font-bold text-bork-green mt-2">{completedTasksCount}/{tasks.length}</div>
                </Card>
                
                <div className="sm:col-span-2 mt-4">
                  <Link to="/tasks" className="w-full">
                    <Button className="bork-button w-full text-lg py-6 h-auto">View Tasks Dashboard</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Button 
                onClick={connectWallet} 
                className="bork-button text-lg px-10 py-6 h-auto transform hover:scale-105 transition-all"
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
