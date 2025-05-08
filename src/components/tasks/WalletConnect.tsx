
import React from 'react';
import { Button } from '@/components/ui/button';
import BorkDog from '@/components/BorkDog';
import { Wallet } from 'lucide-react';

interface WalletConnectProps {
  onConnect: () => Promise<void>;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-8 relative">
        <BorkDog size="large" className="w-40 h-40 animate-bounce-small" />
        <div className="absolute -bottom-4 -right-4 bg-black rounded-full p-1">
          <Wallet className="h-8 w-8 text-bork-green animate-pulse" />
        </div>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Connect Your Wallet</h1>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        Connect your wallet to view available tasks and start earning $BORK rewards!
      </p>
      
      <Button 
        onClick={onConnect}
        size="lg"
        className="px-8 py-6 h-auto text-lg font-bold"
      >
        <Wallet className="mr-2 h-5 w-5" />
        Connect Wallet
      </Button>
    </div>
  );
};

export default WalletConnect;
