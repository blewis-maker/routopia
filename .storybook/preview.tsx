import type { Preview } from '@storybook/react'
import React from 'react'
import '../src/styles/globals.css'
import { withThemeByClassName } from '@storybook/addon-themes'

// Mock Next.js Image component
const NextImage = ({ src, alt, ...props }: any) => {
  return <img src={src} alt={alt} {...props} />;
};

// Mock useRouter
const useRouter = () => {
  return {
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: () => Promise.resolve(true),
    replace: () => Promise.resolve(true),
    reload: () => null,
    back: () => null,
    prefetch: () => Promise.resolve(),
    events: {
      on: () => null,
      off: () => null,
      emit: () => null,
    },
  };
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
        query: {},
      },
    },
    layout: 'centered',
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
    (Story) => (
      <div className="p-4 bg-white dark:bg-gray-800">
        <Story />
      </div>
    ),
  ],
}

// Mock Next.js components and hooks
if (typeof global.Image === 'undefined') {
  global.Image = NextImage;
}
if (typeof global.useRouter === 'undefined') {
  (global as any).useRouter = useRouter;
}

export default preview 