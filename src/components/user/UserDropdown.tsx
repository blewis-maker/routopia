import { Menu } from '@headlessui/react';
import { User } from '@prisma/client';
import Link from 'next/link';

export function UserDropdown({ user }: { user: User }) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center">
        {/* Avatar component */}
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-56 bg-stone-900 border border-stone-800 rounded-lg shadow-lg">
        <div className="p-1">
          <Menu.Item>
            <Link href="/my-routes" className="flex items-center px-4 py-2 text-sm text-stone-300 hover:bg-stone-800 rounded-md">
              My Routes & Activities
            </Link>
          </Menu.Item>
          
          <Menu.Item>
            <Link href="/settings/activity-preferences" className="flex items-center px-4 py-2 text-sm text-stone-300 hover:bg-stone-800 rounded-md">
              Activity Preferences
            </Link>
          </Menu.Item>

          {/* Existing menu items */}
        </div>
      </Menu.Items>
    </Menu>
  );
} 