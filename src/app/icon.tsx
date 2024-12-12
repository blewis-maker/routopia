import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 35.2 35.2">
          <circle
            cx="17.6"
            cy="5.6"
            r="4"
            fill="none"
            stroke="#2baf9d"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m14.72,8.48l-6.24,6.24"
            fill="none"
            stroke="#2baf9d"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="5.6"
            cy="17.6"
            r="4"
            fill="none"
            stroke="#2baf9d"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m9.6,17.6h16"
            fill="none"
            stroke="#2baf9d"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="29.6"
            cy="17.6"
            r="4"
            fill="none"
            stroke="#2baf9d"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m20.48,26.72l6.24-6.24"
            fill="none"
            stroke="#2baf9d"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="17.6"
            cy="29.6"
            r="4"
            fill="none"
            stroke="#2baf9d"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
} 