import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { styleGuide as sg } from '@/lib/style-guide';

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
          className={cn(
            sg.typography.sizes.sm,
            "transition-colors",
            "hover:text-stone-200",
            pathname === link.href ? sg.colors.text.primary : sg.colors.text.secondary
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
} 