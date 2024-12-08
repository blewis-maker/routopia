'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Route, Activity } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Route Planner',
      href: '/route-planner',
      icon: Route,
    },
    {
      label: 'Activity Hub',
      href: '/activity-hub',
      icon: Activity,
    },
    {
      label: 'POI Explorer',
      href: '/poi-explorer',
      icon: MapPin,
    },
  ];

  return (
    <aside className="dashboard-layout__sidebar">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-stone-800 text-white' 
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
} 