
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBork } from '@/context/BorkContext';
import { Button } from '@/components/ui/button';
import { Rocket, Coins } from 'lucide-react';

const Header = () => {
  const { connected, connecting, account, balance, connectWallet, disconnectWallet } = useBork();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-bork-green/20">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img src="/bork-logo.svg" alt="BorkChain" className="h-8 w-8 mr-2 animate-bounce-small" />
          <span className="font-extrabold text-xl">
            <span className="text-white">Bork</span>
            <span className="text-bork-green">Chain</span>
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className={`font-medium hover:text-bork-green transition-colors ${isActive('/') ? 'text-bork-green' : 'text-white'}`}
          >
            Home
          </Link>
          <Link 
            to="/tasks" 
            className={`font-medium hover:text-bork-green transition-colors ${isActive('/tasks') ? 'text-bork-green' : 'text-white'}`}
          >
            Tasks
          </Link>
          <Link 
            to="/referrals" 
            className={`font-medium hover:text-bork-green transition-colors ${isActive('/referrals') ? 'text-bork-green' : 'text-white'}`}
          >
            Referrals
          </Link>
          <Link 
            to="/airdrop" 
            className={`font-medium hover:text-bork-green transition-colors flex items-center gap-1 ${isActive('/airdrop') ? 'text-bork-green' : 'text-white'}`}
          >
            <Rocket className="w-4 h-4" /> Airdrop
          </Link>
          <Link 
            to="/fundraisers" 
            className={`font-medium hover:text-bork-green transition-colors flex items-center gap-1 ${isActive('/fundraisers') ? 'text-bork-green' : 'text-white'}`}
          >
            <Coins className="w-4 h-4" /> Fundraisers
          </Link>
        </nav>
        
        {/* User Info & Connect Button */}
        <div className="hidden md:flex items-center gap-4">
          {connected && (
            <div className="flex items-center gap-2 mr-2">
              <div className="bg-black/30 rounded-full px-4 py-1 border border-bork-green/30">
                <span className="font-bold text-bork-green">{balance}</span> $BORK
              </div>
              <div className="bg-black/30 rounded-full px-4 py-1 border border-white/30 text-white">
                {truncateAddress(account || '')}
              </div>
            </div>
          )}
          
          <Button 
            onClick={connected ? disconnectWallet : connectWallet}
            variant="outline"
            className={`bork-button ${connecting ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={connecting}
          >
            {connecting ? 'Connecting...' : connected ? 'Disconnect' : 'Connect Wallet'}
          </Button>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white p-2"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
          </svg>
        </button>
      </div>
      
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/95 pt-20">
          <nav className="flex flex-col items-center gap-6 p-8">
            <Link 
              to="/" 
              className={`text-xl font-medium ${isActive('/') ? 'text-bork-green' : 'text-white'}`}
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link 
              to="/tasks" 
              className={`text-xl font-medium ${isActive('/tasks') ? 'text-bork-green' : 'text-white'}`}
              onClick={closeMenu}
            >
              Tasks
            </Link>
            <Link 
              to="/referrals" 
              className={`text-xl font-medium ${isActive('/referrals') ? 'text-bork-green' : 'text-white'}`}
              onClick={closeMenu}
            >
              Referrals
            </Link>
            <Link 
              to="/airdrop" 
              className={`text-xl font-medium flex items-center gap-2 ${isActive('/airdrop') ? 'text-bork-green' : 'text-white'}`}
              onClick={closeMenu}
            >
              <Rocket className="w-5 h-5" /> Airdrop
            </Link>
            <Link 
              to="/fundraisers" 
              className={`text-xl font-medium flex items-center gap-2 ${isActive('/fundraisers') ? 'text-bork-green' : 'text-white'}`}
              onClick={closeMenu}
            >
              <Coins className="w-5 h-5" /> Fundraisers
            </Link>
            
            {connected && (
              <div className="flex flex-col items-center gap-3 mt-4">
                <div className="bg-black/30 rounded-full px-4 py-1 border border-bork-green/30">
                  <span className="font-bold text-bork-green">{balance}</span> $BORK
                </div>
                <div className="bg-black/30 rounded-full px-4 py-1 border border-white/30 text-white">
                  {truncateAddress(account || '')}
                </div>
              </div>
            )}
            
            <Button 
              onClick={connected ? disconnectWallet : connectWallet}
              variant="outline" 
              className="bork-button mt-4 w-full"
              disabled={connecting}
            >
              {connecting ? 'Connecting...' : connected ? 'Disconnect' : 'Connect Wallet'}
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
