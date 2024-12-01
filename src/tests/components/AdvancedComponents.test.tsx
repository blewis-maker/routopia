import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  AdvancedSearchInterface,
  EnhancedSettingsMenu,
  EnhancedFeedbackSystem 
} from '@/components';

describe('AdvancedSearchInterface', () => {
  it('handles voice search correctly', async () => {
    const onSearch = jest.fn();
    render(<AdvancedSearchInterface onSearch={onSearch} />);
    
    const voiceButton = screen.getByLabelText(/start voice search/i);
    fireEvent.click(voiceButton);
    
    await waitFor(() => {
      expect(voiceButton).toHaveClass('listening');
    });
  });

  // ... more tests
});

describe('EnhancedSettingsMenu', () => {
  it('saves settings changes correctly', async () => {
    const onSettingsChange = jest.fn();
    render(<EnhancedSettingsMenu onSettingsChange={onSettingsChange} />);
    
    const themeToggle = screen.getByLabelText(/dark mode/i);
    await userEvent.click(themeToggle);
    
    expect(onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'dark' })
    );
  });

  // ... more tests
});

describe('EnhancedFeedbackSystem', () => {
  it('stacks multiple notifications correctly', async () => {
    const { rerender } = render(
      <EnhancedFeedbackSystem
        message="Test 1"
        type="info"
        enableStacking={true}
      />
    );
    
    rerender(
      <EnhancedFeedbackSystem
        message="Test 2"
        type="info"
        enableStacking={true}
      />
    );
    
    const notifications = screen.getAllByRole('alert');
    expect(notifications).toHaveLength(2);
  });

  // ... more tests
}); 