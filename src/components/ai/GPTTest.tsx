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
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">RouteGPT Test</h2>
      <div className="space-y-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter a route planning question..."
        />
        <button
          onClick={testGPT}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {loading ? 'Testing...' : 'Test GPT'}
        </button>
      </div>
      {response && (
        <div className="p-4 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap">{response}</pre>
        </div>
      )}
    </div>
  );
} 