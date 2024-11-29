'use client';

import { useState } from 'react';
import Map from '@/components/Map';
import { Search, Plus, List, LayersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <div className="h-screen flex flex-col bg-stone-900">
      {/* Top Navigation Bar */}
      <div className="h-14 border-b border-stone-800 bg-stone-900/90 backdrop-blur-sm px-4">
        <div className="flex items-center justify-between h-full max-w-screen-2xl mx-auto">
          {/* Left side - Search */}
          <div className="flex items-center w-72">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search for a location..."
                className="w-full bg-stone-800 border border-stone-700 rounded-md py-2 pl-10 pr-4 text-stone-300 placeholder-stone-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Center - Map Controls */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="border-stone-700 text-stone-300 hover:bg-stone-800">
              <LayersIcon className="h-4 w-4 mr-2" />
              Map Style
            </Button>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-4">
            <Button className="bg-teal-600 hover:bg-teal-500 text-stone-900 font-semibold">
              <Plus className="h-4 w-4 mr-2" />
              Create Route
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <div className="w-72 bg-stone-900 border-r border-stone-800">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-stone-200 mb-4">My Routes</h2>
            {/* Route list would go here */}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <Map />
        </div>
      </div>
    </div>
  );
} 