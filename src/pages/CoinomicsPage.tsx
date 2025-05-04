
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BorkDog from '@/components/BorkDog';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const CoinomicsPage = () => {
  // Refs for animation
  const chartRef = useRef<HTMLDivElement>(null);
  const distributionRef = useRef<HTMLDivElement>(null);
  
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
    
    if (chartRef.current) observer.observe(chartRef.current);
    if (distributionRef.current) observer.observe(distributionRef.current);
    
    return () => {
      if (chartRef.current) observer.unobserve(chartRef.current);
      if (distributionRef.current) observer.unobserve(distributionRef.current);
    };
  }, []);
  
  const distributionData = [
    { name: 'Community Tasks', percentage: 50, color: '#39FF14' },
    { name: 'Referrals', percentage: 20, color: '#7DFF66' },
    { name: 'Dev Fund', percentage: 15, color: '#32D912' },
    { name: 'Airdrops', percentage: 10, color: '#A0FE8B' },
    { name: 'Liquidity', percentage: 5, color: '#C5FFBB' },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(57,255,20,0.15)_0%,rgba(0,0,0,0)_70%)]"></div>
        
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#39FF1410_1px,transparent_1px),linear-gradient(to_bottom,#39FF1410_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/" className="inline-flex items-center text-bork-green hover:text-white mb-8 transition-colors group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-center">
            <span className="text-bork-green neon-text">$BORK</span> Coinomics
          </h1>
          
          <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto text-center">
            Understanding the economics and distribution of the $BORK coin ecosystem.
          </p>
        </div>
      </section>
      
      {/* Total Supply Section */}
      <section className="py-16 bg-[#040404]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="w-full md:w-1/2 order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Total <span className="text-bork-green neon-text">Supply</span>
              </h2>
              
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                The $BORK coin was designed with a fixed supply to create scarcity and potential appreciation in value over time. The total supply is capped at 1 billion coins, ensuring $BORK remains a deflationary asset.
              </p>
              
              <div className="bork-card mb-8 p-8">
                <div className="flex justify-between items-center">
                  <span className="text-xl text-gray-300">Maximum Supply:</span>
                  <span className="text-4xl font-bold text-bork-green">1,000,000,000</span>
                </div>
              </div>
              
              <div className="bork-card p-8">
                <h3 className="text-xl font-bold mb-4">Key Supply Features:</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-bork-green mr-2 flex-shrink-0 mt-0.5" />
                    <span>Fixed maximum supply - no inflation</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-bork-green mr-2 flex-shrink-0 mt-0.5" />
                    <span>Gradual distribution through community activities</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-bork-green mr-2 flex-shrink-0 mt-0.5" />
                    <span>Strategic burns to increase scarcity over time</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 flex justify-center order-1 md:order-2">
              <div className="relative">
                <div className="absolute -inset-4 bg-bork-green/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-8 border-bork-green/50 flex items-center justify-center relative animate-float">
                  <div className="text-center">
                    <div className="text-6xl md:text-7xl font-bold text-bork-green mb-2 neon-text">1B</div>
                    <div className="text-xl md:text-2xl text-white">$BORK Coins</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Distribution Section */}
      <section className="py-16 bg-black" ref={distributionRef}>
        <div className="container mx-auto px-4 opacity-0 transition-all duration-700">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            <span className="text-bork-green neon-text">Distribution</span> Breakdown
          </h2>
          
          <p className="text-gray-300 text-lg mb-12 max-w-2xl mx-auto text-center">
            The $BORK coin distribution model prioritizes community engagement and rewards participation.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="space-y-6">
                {distributionData.map((item, index) => (
                  <div key={index} className="bork-card transform hover:scale-105 transition-all">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full mr-4" style={{ backgroundColor: item.color }}></div>
                        <span className="text-lg font-medium">{item.name}</span>
                      </div>
                      <span className="text-2xl font-bold">{item.percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-800 rounded-b-lg overflow-hidden">
                      <div 
                        className="h-full transition-all duration-1000 ease-out" 
                        style={{ 
                          width: `${item.percentage}%`, 
                          backgroundColor: item.color,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div ref={chartRef} className="flex justify-center order-1 lg:order-2">
              <div className="relative w-80 h-80">
                {/* Circular chart segments */}
                <div className="absolute inset-0 rounded-full border-8 border-gray-800"></div>
                
                {/* Each segment needs to be positioned with the correct rotation and color */}
                {/* This is a simplified visual representation */}
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="transparent" stroke="#39FF14" strokeWidth="25" strokeDasharray="141.3 282.6" />
                  <circle cx="50" cy="50" r="45" fill="transparent" stroke="#7DFF66" strokeWidth="25" strokeDasharray="56.52 282.6" strokeDashoffset="-141.3" />
                  <circle cx="50" cy="50" r="45" fill="transparent" stroke="#32D912" strokeWidth="25" strokeDasharray="42.39 282.6" strokeDashoffset="-197.82" />
                  <circle cx="50" cy="50" r="45" fill="transparent" stroke="#A0FE8B" strokeWidth="25" strokeDasharray="28.26 282.6" strokeDashoffset="-240.21" />
                  <circle cx="50" cy="50" r="45" fill="transparent" stroke="#C5FFBB" strokeWidth="25" strokeDasharray="14.13 282.6" strokeDashoffset="-268.47" />
                  <circle cx="50" cy="50" r="20" fill="black" />
                  <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-sm font-bold" fill="white">$BORK</text>
                </svg>

                {/* Animated particles */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-bork-green animate-float"
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
      </section>
      
      {/* Vesting & Release Section */}
      <section className="py-16 bg-[#040404]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            Vesting & <span className="text-bork-green neon-text">Release</span>
          </h2>
          
          <p className="text-gray-300 text-lg mb-12 max-w-2xl mx-auto text-center">
            Strategic release schedule ensures long-term sustainability of the $BORK ecosystem.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bork-card transform hover:scale-105 transition-all hover:border-bork-green">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-3">Community Tasks</h3>
                <p className="text-gray-400 mb-4">Released gradually as users complete tasks in the ecosystem.</p>
                <div className="h-2 w-full bg-gray-800 rounded-lg overflow-hidden">
                  <div className="h-full bg-bork-green w-3/4"></div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span>Current: 75%</span>
                  <span>Target: 100%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bork-card transform hover:scale-105 transition-all hover:border-bork-green">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-3">Referral Program</h3>
                <p className="text-gray-400 mb-4">Unlocked as new users join through referrals.</p>
                <div className="h-2 w-full bg-gray-800 rounded-lg overflow-hidden">
                  <div className="h-full bg-bork-green w-1/2"></div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span>Current: 50%</span>
                  <span>Target: 100%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bork-card transform hover:scale-105 transition-all hover:border-bork-green">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-3">Dev Fund</h3>
                <p className="text-gray-400 mb-4">6-month cliff, then linear vesting over 2 years.</p>
                <div className="h-2 w-full bg-gray-800 rounded-lg overflow-hidden">
                  <div className="h-full bg-bork-green w-1/4"></div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span>Current: 25%</span>
                  <span>Target: 100%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bork-card transform hover:scale-105 transition-all hover:border-bork-green">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-3">Airdrops</h3>
                <p className="text-gray-400 mb-4">Scheduled for release in quarterly community airdrops.</p>
                <div className="h-2 w-full bg-gray-800 rounded-lg overflow-hidden">
                  <div className="h-full bg-bork-green w-1/3"></div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span>Current: 33%</span>
                  <span>Target: 100%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Burn Mechanism Section */}
      <section className="py-16 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-bork-green/5"></div>
        
        {/* Green animated light source */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-bork-green/20 blur-3xl animate-pulse"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              <span className="text-bork-green neon-text">Burn</span> Mechanism
            </h2>
            
            <p className="text-gray-300 text-lg mb-8 text-center">
              To ensure $BORK remains deflationary, we implement periodic burns that permanently remove coins from circulation.
            </p>
            
            <div className="bork-card p-8 mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">Quarterly Burns</h3>
                  <p className="text-gray-400">We burn 1% of total supply every quarter, permanently reducing circulation.</p>
                </div>
                
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-bork-green/50 flex items-center justify-center">
                    <div className="absolute inset-0 animate-pulse bg-bork-green/20 rounded-full"></div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-bork-green">1%</div>
                      <div className="text-sm">Quarterly</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bork-card p-8">
              <h3 className="text-xl font-bold mb-4">Benefits of the Burn Mechanism:</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 text-bork-green mr-2 flex-shrink-0 mt-0.5" />
                  <span>Creates deflationary pressure on $BORK supply</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 text-bork-green mr-2 flex-shrink-0 mt-0.5" />
                  <span>Increases scarcity and potential value for holders</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 text-bork-green mr-2 flex-shrink-0 mt-0.5" />
                  <span>Rewards long-term community members</span>
                </li>
              </ul>
            </div>
            
            <div className="flex justify-center mt-10">
              <Link to="/tasks">
                <Button 
                  className="bork-button text-lg px-8 py-3 group"
                >
                  <span>Start Earning $BORK</span>
                  <ArrowLeft className="ml-2 transform -rotate-180 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* BorkDog Small Banner */}
      <section className="py-12 bg-[#040404]">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <BorkDog size="small" className="filter drop-shadow-[0_0_20px_rgba(57,255,20,0.3)] animate-bounce-small" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CoinomicsPage;
