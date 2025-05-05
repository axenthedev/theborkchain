
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-bork-green/20 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img src="/bork-logo.svg" alt="BorkChain" className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl">
                <span className="text-white">Bork</span>
                <span className="text-bork-green">Chain</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Complete tasks, refer friends, and earn the $BORK token on this Layer 2 platform.
            </p>
          </div>
          
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <h3 className="text-white font-bold mb-3">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/tasks" className="hover:text-bork-green transition-colors">Tasks</Link></li>
                <li><Link to="/referrals" className="hover:text-bork-green transition-colors">Referrals</Link></li>
                <li><Link to="/airdrop" className="hover:text-bork-green transition-colors">Airdrop</Link></li>
                <li><Link to="/fundraisers" className="hover:text-bork-green transition-colors">Fundraisers</Link></li>
                <li><Link to="/leaderboard" className="hover:text-bork-green transition-colors">Leaderboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-3">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/coinomics" className="hover:text-bork-green transition-colors">Tokenomics</Link></li>
                <li><Link to="/whitepaper" className="hover:text-bork-green transition-colors">Whitepaper</Link></li>
                <li><a href="https://github.com/borkchain" target="_blank" rel="noopener noreferrer" className="hover:text-bork-green transition-colors">GitHub</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-3">Community</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://twitter.com/borkchain" target="_blank" rel="noopener noreferrer" className="hover:text-bork-green transition-colors">Twitter</a></li>
                <li><a href="https://discord.gg/borkchain" target="_blank" rel="noopener noreferrer" className="hover:text-bork-green transition-colors">Discord</a></li>
                <li><a href="https://t.me/borkchain" target="_blank" rel="noopener noreferrer" className="hover:text-bork-green transition-colors">Telegram</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-4 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} BorkChain. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
