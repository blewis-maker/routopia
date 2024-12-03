import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthenticationFlow } from '@/components/auth/AuthenticationFlow';

describe('Critical - Authentication Flow', () => {
  beforeEach(() => {
    // Mock localStorage
    Storage.prototype.getItem = vi.fn();
    Storage.prototype.setItem = vi.fn();
    Storage.prototype.removeItem = vi.fn();
  });

  it('user login flow', async () => {
    const user = userEvent.setup();
    render(<AuthenticationFlow />);

    // Fill in login form
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    // Verify successful login
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
}); 