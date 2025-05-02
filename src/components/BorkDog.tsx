
import React from 'react';

interface BorkDogProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  animate?: boolean;
}

const BorkDog: React.FC<BorkDogProps> = ({ className = '', size = 'medium', animate = true }) => {
  const sizeClasses = {
    small: 'h-20 w-20',
    medium: 'h-40 w-40', 
    large: 'h-64 w-64'
  };
  
  const animationClass = animate ? 'animate-float' : '';
  
  return (
    <div className={`${sizeClasses[size]} ${animationClass} ${className}`}>
      <svg 
        viewBox="0 0 400 400" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <g>
          {/* Dog Body */}
          <ellipse cx="200" cy="220" rx="120" ry="100" fill="#F2A900" />
          
          {/* Face */}
          <circle cx="200" cy="180" r="90" fill="#F2A900" />
          
          {/* Ears */}
          <ellipse cx="120" cy="140" rx="30" ry="45" fill="#F2A900" transform="rotate(-15, 120, 140)" />
          <ellipse cx="280" cy="140" rx="30" ry="45" fill="#F2A900" transform="rotate(15, 280, 140)" />
          
          {/* Eyes */}
          <circle cx="170" cy="165" r="15" fill="white" />
          <circle cx="230" cy="165" r="15" fill="white" />
          <circle cx="170" cy="165" r="8" fill="black" />
          <circle cx="230" cy="165" r="8" fill="black" />
          <circle cx="166" cy="160" r="4" fill="white" />
          <circle cx="226" cy="160" r="4" fill="white" />
          
          {/* Nose */}
          <ellipse cx="200" cy="195" rx="15" ry="10" fill="black" />
          
          {/* Mouth */}
          <path d="M180 210 Q200 225 220 210" stroke="black" strokeWidth="3" fill="none" />
          
          {/* Tongue */}
          <path d="M195 220 Q200 230 205 220" fill="#FF9999" />
          
          {/* Neon Green Collar */}
          <path d="M135 220 Q200 250 265 220" stroke="#39FF14" strokeWidth="10" fill="none" className="animate-glow" />
          <circle cx="200" cy="235" r="8" fill="#39FF14" className="animate-glow" />
          
          {/* Paws */}
          <ellipse cx="150" cy="300" rx="25" ry="15" fill="#F2A900" />
          <ellipse cx="250" cy="300" rx="25" ry="15" fill="#F2A900" />

          {/* Dollar Sign */}
          <text x="195" y="235" fontFamily="Arial" fontSize="20" fontWeight="bold" fill="#000">$</text>
        </g>
      </svg>
    </div>
  );
};

export default BorkDog;
