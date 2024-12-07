'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Menu, X } from 'lucide-react';
import { montserrat } from '@/app/fonts';
import { usePathname } from 'next/navigation';

const navigationItems = [
  { name: 'Features', href: '/#features', scroll: true },
  { name: 'Route Planner', href: '/route-planner' },
  { name: 'POI Explorer', href: '/poi-explorer' },
  { name: 'Activity Hub', href: '/activity-hub' },
];

interface NavigationBarProps {
  className?: string;
}

export default function NavigationBar({ className = '' }: NavigationBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, scroll?: boolean) => {
    if (scroll && isLandingPage) {
      e.preventDefault();
      const element = document.getElementById(href.replace('/#', ''));
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50
      transition-all duration-300 ease-in-out
      ${montserrat.className}
      ${isScrolled 
        ? 'bg-stone-900/80 backdrop-blur-md border-b border-stone-800'
        : isLandingPage 
          ? 'bg-transparent'
          : 'bg-stone-900'
      }
      ${className}
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <Image
                src="/routopia-logo.png"
                alt="Routopia"
                fill
                className="object-contain transition-transform duration-200 group-hover:scale-110"
                priority
              />
            </div>
            <span className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              Routopia
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isLandingPage ? (
              <Link
                href="/login"
                className="flex items-center gap-2 text-stone-300 hover:text-white transition-colors duration-200 font-medium"
              >
                <User className="w-4 h-4" />
                Login
              </Link>
            ) : (
              <>
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href, item.scroll)}
                    className="text-stone-300 hover:text-white transition-colors duration-200 font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-stone-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  <User className="w-4 h-4" />
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-stone-300 hover:text-white"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`
        md:hidden
        transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        overflow-hidden
        ${isScrolled ? 'bg-stone-900/80 backdrop-blur-md' : 'bg-stone-900'}
      `}>
        <div className="px-4 pt-2 pb-3 space-y-1">
          {isLandingPage ? (
            <Link
              href="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-stone-300 hover:text-white hover:bg-stone-800"
            >
              Login
            </Link>
          ) : (
            <>
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    handleNavClick(e, item.href, item.scroll);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block px-3 py-2 rounded-md text-base font-medium text-stone-300 hover:text-white hover:bg-stone-800"
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-stone-300 hover:text-white hover:bg-stone-800"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 