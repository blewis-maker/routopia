'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

const navigationItems = [
  { name: 'Features', href: '#features' },
  { name: 'Route Planner', href: '/route-planner' },
  { name: 'POI Explorer', href: '/poi-explorer' },
  { name: 'Activity Hub', href: '/activity-hub' },
];

export default function NavigationBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300 ease-in-out
        ${isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-lg'
          : 'bg-black/20 backdrop-blur-sm'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center space-x-3 group">
            <div className="relative w-8 h-8 transform transition-transform group-hover:scale-110">
              <Image
                src="/routopia-logo.png"
                alt="Routopia"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className={`
              font-montserrat font-bold text-lg
              transition-colors duration-300
              ${isScrolled ? 'text-brand-text' : 'text-white'}
            `}>
              Routopia
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  relative font-medium text-sm
                  transition-colors duration-200
                  hover:text-brand-primary
                  group
                  ${isScrolled ? 'text-brand-text' : 'text-white'}
                `}
              >
                {item.name}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-brand-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
              </Link>
            ))}
            
            <Link
              href="/get-started"
              className={`
                inline-flex items-center justify-center
                px-4 py-2
                text-sm font-medium
                rounded-lg
                transition-all duration-200
                transform hover:scale-105
                ${isScrolled
                  ? 'text-white bg-brand-primary hover:bg-brand-primary/90'
                  : 'text-brand-primary bg-white hover:bg-white/90'
                }
              `}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`
                inline-flex items-center justify-center
                p-2 rounded-md
                transition-colors duration-200
                ${isScrolled ? 'text-brand-text' : 'text-white'}
                hover:text-brand-primary
              `}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`
        md:hidden
        transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        overflow-hidden
        ${isScrolled ? 'bg-white/90 backdrop-blur-md' : 'bg-black/80 backdrop-blur-md'}
      `}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                block px-3 py-2 rounded-md text-base font-medium
                transition-colors duration-200
                ${isScrolled
                  ? 'text-brand-text hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
                }
              `}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/get-started"
            className={`
              block px-3 py-2 rounded-md text-base font-medium
              transition-colors duration-200
              ${isScrolled
                ? 'bg-brand-primary text-white hover:bg-brand-primary/90'
                : 'bg-white text-brand-primary hover:bg-white/90'
              }
            `}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
} 