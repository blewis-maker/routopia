import type { StorybookConfig } from '@storybook/nextjs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from .storybook/.env
dotenv.config({ path: '.storybook/.env' })

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    '@storybook/addon-styling-webpack',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {}
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../public'],
  env: (config) => {
    return {
      ...config,
      NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
      NEXT_PUBLIC_GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
      ENABLE_REALTIME_UPDATES: process.env.ENABLE_REALTIME_UPDATES,
      ENABLE_POI_SUGGESTIONS: process.env.ENABLE_POI_SUGGESTIONS,
      ENABLE_PARALLEL_TESTING: process.env.ENABLE_PARALLEL_TESTING,
      ENABLE_MCP_SERVER: process.env.ENABLE_MCP_SERVER,
      ENABLE_SOCIAL_LOGIN: process.env.ENABLE_SOCIAL_LOGIN,
      ENABLE_EMAIL_VERIFICATION: process.env.ENABLE_EMAIL_VERIFICATION,
      ENABLE_PASSWORD_RESET: process.env.ENABLE_PASSWORD_RESET,
      NODE_ENV: process.env.NODE_ENV || 'development',
    }
  },
  core: {
    builder: '@storybook/builder-webpack5',
    disableTelemetry: true,
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    check: false,
  },
  webpackFinal: async (config) => {
    if (config.module?.rules) {
      config.module.rules.push({
        test: /\.css$/,
        use: [
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('tailwindcss'),
                  require('autoprefixer'),
                ],
              },
            },
          },
        ],
      });
    }
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '../src'),
      };
    }
    return config;
  },
}

export default config 