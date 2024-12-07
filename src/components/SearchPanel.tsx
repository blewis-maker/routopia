'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';

interface SearchPanelProps {
  onSearch: (query: string) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search routes..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <Button type="submit" variant="primary">
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchPanel; 