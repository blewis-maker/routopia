import React, { useState } from 'react';

export const AuthenticationFlow: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsLoading(false);
    setIsLoggedIn(true);
  };

  if (isLoggedIn) {
    return <div>Dashboard</div>;
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" aria-label="Email" />
        <input type="password" aria-label="Password" />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}; 