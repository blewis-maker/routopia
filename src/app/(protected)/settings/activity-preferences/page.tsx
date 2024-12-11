'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export default function ActivityPreferencesPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-stone-200">Activity Preferences</h1>
      
      <div className="grid gap-6">
        <Card className="p-6 bg-stone-900 border border-stone-800">
          <h2 className="text-lg font-semibold text-stone-200 mb-4">Default Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-stone-300">Default Activity Type</label>
              <Select 
                options={[
                  { value: 'drive', label: 'Drive' },
                  { value: 'bike', label: 'Bike' },
                  { value: 'run', label: 'Run' },
                  { value: 'ski', label: 'Ski' }
                ]}
                className="w-48"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-stone-300">Auto-sync Activities</label>
              <Switch />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-stone-900 border border-stone-800">
          <h2 className="text-lg font-semibold text-stone-200 mb-4">Metrics Display</h2>
          {/* Metric preferences */}
        </Card>

        <Card className="p-6 bg-stone-900 border border-stone-800">
          <h2 className="text-lg font-semibold text-stone-200 mb-4">Integration Settings</h2>
          {/* Provider settings */}
        </Card>
      </div>
    </div>
  );
} 