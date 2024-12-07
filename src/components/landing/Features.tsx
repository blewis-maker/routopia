import { MapPin, Route, Activity, Cloud, Brain, Users } from 'lucide-react';

const features = [
  {
    name: 'AI-Powered Route Generation',
    description:
      'Our advanced AI understands your preferences and creates optimal routes tailored to your needs, considering factors like difficulty, scenery, and points of interest.',
    icon: Brain,
  },
  {
    name: 'Real-Time Weather Integration',
    description:
      'Stay informed with up-to-date weather conditions and forecasts along your route, helping you plan the perfect time for your adventure.',
    icon: Cloud,
  },
  {
    name: 'Smart POI Discovery',
    description:
      'Automatically discover and integrate interesting locations along your route, from scenic viewpoints to local cafes and historical landmarks.',
    icon: MapPin,
  },
  {
    name: 'Activity Tracking',
    description:
      'Monitor your progress, track your achievements, and analyze your performance with detailed statistics and insights.',
    icon: Activity,
  },
  {
    name: 'Dynamic Route Optimization',
    description:
      'Routes automatically adjust based on real-time conditions, crowd levels, and your preferences to ensure the best possible experience.',
    icon: Route,
  },
  {
    name: 'Community Features',
    description:
      'Share your favorite routes, discover popular paths from other users, and join a community of outdoor enthusiasts.',
    icon: Users,
  },
];

export default function Features() {
  return (
    <div id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            Everything you need
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Intelligent Route Planning
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Experience the future of route planning with our comprehensive set of features,
            designed to make your outdoor adventures more enjoyable and efficient.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon
                    className="h-5 w-5 flex-none text-indigo-600"
                    aria-hidden="true"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
} 