import type { Meta, StoryObj } from '@storybook/react';
import SignUpModal from './SignUpModal';

const meta: Meta<typeof SignUpModal> = {
  title: 'Auth/SignUpModal',
  component: SignUpModal,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof SignUpModal>;

export const Open: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
  },
}; 