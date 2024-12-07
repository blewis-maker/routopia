import React, { useState } from 'react';

interface RouteGPTProps {
  onSuggestion: (suggestion: any) => void;
}

export const RouteGPT: React.FC<RouteGPTProps> = ({ onSuggestion }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock AI response
    onSuggestion({
      route: {
        name: 'AI Suggested Route',
        description: 'A scenic route based on your preferences',
        distance: Math.random() * 10 + 5,
        elevation: Math.random() * 500 + 200,
      },
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Route AI Assistant</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Describe your ideal route..."
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Get Suggestions
        </button>
      </form>
    </div>
  );
};

export default RouteGPT; 