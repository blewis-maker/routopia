import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Routopia',
    short_name: 'Routopia',
    description: 'Intelligent route planning and activity tracking',
    start_url: '/',
    display: 'standalone',
    background_color: '#1F2937',
    theme_color: '#4F46E5',
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
    orientation: 'portrait',
    categories: ['navigation', 'fitness', 'lifestyle'],
    shortcuts: [
      {
        name: 'Start Activity',
        short_name: 'Activity',
        description: 'Start tracking a new activity',
        url: '/activity/new',
        icons: [{ src: '/icons/activity.png', sizes: '192x192' }]
      },
      {
        name: 'Plan Route',
        short_name: 'Route',
        description: 'Plan a new route',
        url: '/routes/new',
        icons: [{ src: '/icons/route.png', sizes: '192x192' }]
      }
    ],
    screenshots: [
      {
        src: '/screenshots/home.png',
        sizes: '1080x1920',
        type: 'image/png',
        label: 'Home Screen'
      },
      {
        src: '/screenshots/activity.png',
        sizes: '1080x1920',
        type: 'image/png',
        label: 'Activity Tracking'
      },
      {
        src: '/screenshots/route.png',
        sizes: '1080x1920',
        type: 'image/png',
        label: 'Route Planning'
      }
    ],
    prefer_related_applications: false,
    related_applications: [],
    handle_links: 'preferred',
    launch_handler: {
      client_mode: ['navigate-existing', 'auto']
    },
    edge_side_panel: {
      preferred_width: 480
    },
    share_target: {
      action: '/share-target',
      method: 'POST',
      enctype: 'multipart/form-data',
      params: {
        title: 'title',
        text: 'text',
        url: 'url',
        files: [
          {
            name: 'activity',
            accept: ['application/gpx+xml', '.gpx']
          }
        ]
      }
    }
  };
} 