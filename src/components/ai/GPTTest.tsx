'use client';

import { useState } from 'react';

export default function GPTTest() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const testGPT = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gpt/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error('Test Error:', error);
      setResponse('Error testing GPT integration');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">RouteGPT Test</h2>
      <div className="space-y-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 bg-stone-800 text-white border border-stone-700 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Enter a route planning question..."
        />
        <button
          onClick={testGPT}
          disabled={loading}
          className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-500 disabled:bg-stone-700 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Testing...' : 'Test GPT'}
        </button>
      </div>
      {response && (
        <div className="p-4 bg-stone-800 border border-stone-700 rounded">
          <pre className="whitespace-pre-wrap text-white text-sm">{response}</pre>
        </div>
      )}
    </div>
  );
} 