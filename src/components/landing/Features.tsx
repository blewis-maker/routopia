import React from 'react';
import { MapIcon, ActivitySquare, Navigation, Cloud, Brain, Users } from 'lucide-react';

const features = [
  {
    icon: MapIcon,
    title: 'Intelligent Route Planning',
    description: 'AI-powered route suggestions based on your preferences, weather conditions, and real-time data.',
  },
  {
    icon: ActivitySquare,
    title: 'Activity Tracking',
    description: 'Track your outdoor activities with detailed statistics, elevation profiles, and performance insights.',
  },
  {
    icon: Navigation,
    title: 'Points of Interest',
    description: 'Discover interesting locations along your route, from scenic viewpoints to local attractions.',
  },
  {
    icon: Cloud,
    title: 'Weather Integration',
    description: 'Real-time weather forecasts and conditions to help you plan the perfect outdoor adventure.',
  },
  {
    icon: Brain,
    title: 'Smart Recommendations',
    description: 'Personalized suggestions for routes and activities based on your preferences and history.',
  },
  {
    icon: Users,
    title: 'Community Features',
    description: 'Share routes, connect with other outdoor enthusiasts, and join group activities.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
            Why Choose Routopia?
          </h2>
          <p className="mt-4 text-lg text-stone-400 max-w-2xl mx-auto">
            Experience the perfect blend of technology and outdoor adventure with our comprehensive features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-stone-900/50 border border-stone-800 hover:border-stone-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-stone-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <button
            onClick={() => document.getElementById('signup')?.click()}
            className="px-8 py-4 rounded-lg font-semibold text-lg bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-teal-500/25"
          >
            Get Started Now
          </button>
        </div>
      </div>
    </section>
  );
} 