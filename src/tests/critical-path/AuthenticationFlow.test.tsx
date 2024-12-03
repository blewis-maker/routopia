import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthenticationFlow } from '@/components/auth/AuthenticationFlow';
import { vi } from 'vitest';

describe('Critical - Authentication Flow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('user login flow', async () => {
    const user = userEvent.setup({ delay: null });
    
    await act(async () => {
      render(<AuthenticationFlow />);
    });

    // Fill in login form
    await act(async () => {
      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
    });
    
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Submit form
    await act(async () => {
      await user.click(submitButton);
    });

    // Verify loading state
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Logging in...');

    // Fast-forward through loading state
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Verify successful login
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('handles login errors', async () => {
    const user = userEvent.setup({ delay: null });
    
    await act(async () => {
      render(<AuthenticationFlow />);
    });

    const submitButton = screen.getByRole('button', { name: /login/i });

    // Submit empty form to trigger validation
    await act(async () => {
      await user.click(submitButton);
    });

    // Verify initial validation errors
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();

    // Fill in invalid email and short password
    await act(async () => {
      await user.type(screen.getByLabelText('Email'), 'invalid-email');
      await user.type(screen.getByLabelText('Password'), 'short');
    });
    
    // Submit form again
    await act(async () => {
      await user.click(submitButton);
    });

    // Verify updated validation errors
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
  });

  it('handles authentication failure', async () => {
    const user = userEvent.setup({ delay: null });
    
    await act(async () => {
      render(<AuthenticationFlow />);
    });

    // Fill in form with invalid credentials
    await act(async () => {
      await user.type(screen.getByLabelText('Email'), 'wrong@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrongpass123');
    });
    
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Submit form
    await act(async () => {
      await user.click(submitButton);
    });

    // Verify loading state
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Logging in...');

    // Fast-forward through loading state
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Verify error message
    expect(screen.getByText('Authentication failed. Please try again.')).toBeInTheDocument();
    expect(submitButton).toBeEnabled();
    expect(submitButton).toHaveTextContent('Login');
  });
}); 