import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../ui/Button';
import { Typography } from '../ui/Typography';

const meta = {
  title: 'Components/Common/UI',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Buttons: Story = {
  render: () => (
    <div className="space-y-4">
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Button variant="outline">Outline Button</Button>
    </div>
  ),
};

export const Text: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography.Heading>Heading Text</Typography.Heading>
      <Typography.Text>Regular text content</Typography.Text>
      <Typography.Caption>Caption text</Typography.Caption>
      <Typography.Link href="#">Link text</Typography.Link>
      <Typography.Emphasis>Emphasized text</Typography.Emphasis>
    </div>
  ),
}; 