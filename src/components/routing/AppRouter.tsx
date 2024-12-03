import React from 'react';
import { RouteCreator } from "@/components/route/RouteCreator";

export const AppRouter: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  return (
    <div data-testid="app-router">
      {!isLoggedIn ? (
        <div>
          <h2>Login</h2>
          <form>
            <input aria-label="Email" type="email" />
            <input aria-label="Password" type="password" />
            <button type="submit">Login</button>
          </form>
        </div>
      ) : (
        <>
          <h1>Dashboard</h1>
          <button onClick={() => setIsLoggedIn(false)}>Logout</button>
          <RouteCreator />
        </>
      )}
    </div>
  );
}; 