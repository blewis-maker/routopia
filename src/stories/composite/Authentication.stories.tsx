import type { Meta, StoryObj } from '@storybook/react';
import { MainApplicationView } from '@/components/app/MainApplicationView';
import SignUpModal from '@/components/SignUpModal';
import { AuthButtons } from '@/components/AuthButtons';
import { UserMenu } from '@/components/UserMenu';

const meta = {
  title: 'Flows/Authentication',
  component: MainApplicationView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Authentication flows and user session management scenarios.',
      },
    },
  },
} satisfies Meta<typeof MainApplicationView>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  image: 'https://avatars.githubusercontent.com/u/1?v=4',
};

export const SignUpFlow: Story = {
  args: {
    showSignUpModal: true,
    initialStep: 'signup',
  },
};

export const SignInFlow: Story = {
  args: {
    showSignUpModal: true,
    initialStep: 'signin',
  },
};

export const AuthenticatedState: Story = {
  args: {
    user: mockUser,
    showUserMenu: true,
  },
};

export const PasswordReset: Story = {
  args: {
    showSignUpModal: true,
    initialStep: 'reset',
    email: 'john@example.com',
  },
};

export const EmailVerification: Story = {
  args: {
    showVerificationScreen: true,
    email: 'john@example.com',
    verificationStatus: 'pending',
  },
};

export const SocialAuth: Story = {
  args: {
    showSignUpModal: true,
    initialStep: 'social',
    availableProviders: ['google', 'apple'],
  },
}; 