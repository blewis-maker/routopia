import type { Preview } from '@storybook/react'
import React from 'react'
import '../src/styles/globals.css'
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'

// Mock Next.js Image component
const NextImage = ({ src, alt, ...props }: any) => {
  return <img src={src} alt={alt} {...props} />;
};

// Mock router context
const mockRouter = {
  back: () => Promise.resolve(),
  forward: () => Promise.resolve(),
  push: () => Promise.resolve(),
  replace: () => Promise.resolve(),
  refresh: () => Promise.resolve(),
  prefetch: () => Promise.resolve(),
  route: '/',
  pathname: '/',
  params: {},
  query: {},
  asPath: '/',
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
  },
  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
    (Story, context) => {
      // Check if the story is set to fullscreen
      const isFullscreen = context.parameters?.layout === 'fullscreen';
      
      return (
        <AppRouterContext.Provider value={mockRouter}>
          <div className={isFullscreen ? 'w-full h-full' : 'p-4 bg-white dark:bg-gray-800'}>
            <Story />
          </div>
        </AppRouterContext.Provider>
      );
    },
  ],
}

// Mock Next.js components and hooks
if (typeof global.Image === 'undefined') {
  global.Image = NextImage;
}

export default preview 