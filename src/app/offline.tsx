import React from 'react';
import Image from 'next/image';

export default function Offline() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/icons/icon-192x192.png"
            alt="Routopia"
            width={96}
            height={96}
            className="rounded-lg"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white">
          You're Offline
        </h1>

        {/* Description */}
        <p className="text-gray-400 text-lg">
          Don't worry! You can still:
        </p>

        {/* Features List */}
        <div className="bg-gray-800 rounded-lg p-6 text-left space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-300">
              View cached routes and maps
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-300">
              Track activities (they'll sync when you're back online)
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-300">
              Access your saved preferences and settings
            </p>
          </div>
        </div>

        {/* Retry Button */}
        <button
          onClick={() => window.location.reload()}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Try Again
        </button>

        {/* Help Text */}
        <p className="text-sm text-gray-500">
          Check your internet connection and try again. If the problem persists, some features may be temporarily unavailable.
        </p>
      </div>
    </div>
  );
} 