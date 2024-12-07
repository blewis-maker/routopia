'use client';

import { Fragment, useState, useEffect, ChangeEvent } from 'react';
import { Dialog, Combobox, Transition } from '@headlessui/react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CommandItem {
  id: string;
  name: string;
  description: string;
  href: string;
}

const commands: CommandItem[] = [
  {
    id: 'dashboard',
    name: 'Go to Dashboard',
    description: 'View your activity dashboard',
    href: '/dashboard',
  },
  {
    id: 'route-planner',
    name: 'Plan a Route',
    description: 'Create a new route',
    href: '/route-planner',
  },
  {
    id: 'poi',
    name: 'Explore POIs',
    description: 'Discover points of interest',
    href: '/poi',
  },
  {
    id: 'profile',
    name: 'View Profile',
    description: 'Manage your profile settings',
    href: '/profile',
  },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const filteredCommands = query === ''
    ? commands
    : commands.filter((command) =>
        command.name.toLowerCase().includes(query.toLowerCase()) ||
        command.description.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20"
        onClose={setIsOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500/75 transition-opacity" aria-hidden="true" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Combobox
            onChange={(command: CommandItem) => {
              setIsOpen(false);
              router.push(command.href);
            }}
            as="div"
            className="relative mx-auto max-w-xl divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5"
          >
            <div className="flex items-center px-4">
              <Search className="h-6 w-6 text-gray-500" />
              <Combobox.Input
                className="h-12 w-full border-0 bg-transparent pl-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                placeholder="Search commands..."
                onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
              />
            </div>

            {query === '' && (
              <div className="py-14 px-6 text-center text-sm sm:px-14">
                <Search className="mx-auto h-6 w-6 text-gray-400" />
                <p className="mt-4 text-gray-900">
                  Quick access to navigation and commands
                </p>
                <p className="mt-2 text-gray-500">
                  Press Ctrl+K to open this dialog
                </p>
              </div>
            )}

            <Combobox.Options static className="max-h-96 overflow-y-auto py-4 text-sm">
              {filteredCommands.map((command) => (
                <Combobox.Option
                  key={command.id}
                  value={command}
                  className={({ active }) =>
                    `relative cursor-default select-none px-4 py-2 ${
                      active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                    }`
                  }
                >
                  {({ active }) => (
                    <>
                      <div className="flex items-center">
                        <span className="font-medium">{command.name}</span>
                      </div>
                      <span
                        className={`block truncate text-sm ${
                          active ? 'text-indigo-200' : 'text-gray-500'
                        }`}
                      >
                        {command.description}
                      </span>
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Combobox>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  );
}