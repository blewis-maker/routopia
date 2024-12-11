import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MainNav() {
  const pathname = usePathname();
  
  const links = [
    { href: '/route-planner', label: 'Plan Route' },
    { href: '/my-routes', label: 'My Routes' },
    // ... other navigation items
  ];

  return (
    <nav className="flex items-center space-x-6">
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm font-medium transition-colors hover:text-stone-200
            ${pathname === link.href ? 'text-stone-200' : 'text-stone-400'}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
} 