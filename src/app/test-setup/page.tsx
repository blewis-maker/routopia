'use client';

import { useState, useEffect } from 'react';

interface TestStatus {
  status?: string;
  openai?: string | null;
  redis?: boolean | null;
  message?: string;
  errors?: string[];
  details?: string;
}

export default function TestSetup() {
  const [status, setStatus] = useState<TestStatus>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testSetup() {
      try {
        console.log('Starting test setup...');
        const response = await fetch('/api/test-setup');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error text:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
        }

        try {
          const data = await response.json();
          console.log('Response data:', data);
          setStatus(data);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error('Failed to parse response as JSON');
        }
      } catch (error) {
        console.error('Full error object:', error);
        setError(error instanceof Error ? 
          `${error.message}\n${error.stack}` : 
          'Failed to test setup'
        );
      } finally {
        setIsLoading(false);
      }
    }

    testSetup();
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">System Setup Test</h1>
      
      {isLoading ? (
        <div className="text-gray-600">Testing connections...</div>
      ) : error ? (
        <div className="space-y-4">
          <div className="text-red-500 p-4 border border-red-300 rounded whitespace-pre-wrap">
            Error: {error}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry Test
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 border rounded">
            <h2 className="font-semibold mb-2">
              Status: <span className={status.status === 'success' ? 'text-green-500' : 'text-yellow-500'}>
                {status.status}
              </span>
            </h2>
            {status.message && (
              <p className="text-red-500">{status.message}</p>
            )}
          </div>
          
          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">OpenAI:</h3>
            <p className={status.openai ? 'text-green-500' : 'text-red-500'}>
              {status.openai || 'No response'}
            </p>
          </div>
          
          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">Redis:</h3>
            <p className={status.redis ? 'text-green-500' : 'text-red-500'}>
              {status.redis ? 'Connected' : 'Not connected'}
            </p>
          </div>

          {status.errors && status.errors.length > 0 && (
            <div className="p-4 border rounded">
              <h3 className="font-semibold mb-2">Errors:</h3>
              <ul className="list-disc pl-6">
                {status.errors.map((error, index) => (
                  <li key={index} className="text-red-500">{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 