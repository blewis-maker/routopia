import React from 'react';
import Link from 'next/link';

const NavigationBar: React.FC = () => {
  return (
    <Link href="/" className="nav-bar__logo">
      <svg 
        className="w-6 h-6 animate-logo-blink" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="12" cy="4.5" r="2.5"/>
        <path d="m10.2 6.3-3.9 3.9"/>
        <circle cx="4.5" cy="12" r="2.5"/>
        <path d="M7 12h10"/>
        <circle cx="19.5" cy="12" r="2.5"/>
        <path d="m13.8 17.7 3.9-3.9"/>
        <circle cx="12" cy="19.5" r="2.5"/>
      </svg>
      <span className="nav-bar__logo-text">Routopia</span>
    </Link>
  );
};

export default NavigationBar; 