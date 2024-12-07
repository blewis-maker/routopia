import { MapPin, Route, Activity, Cloud, Brain, Users } from 'lucide-react';
import { typography } from '@/styles/tokens/typography';
import { colors } from '@/styles/tokens/colors';
import { combineClasses } from '@/utils/formatters';

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
    <div id="features" className="py-24 sm:py-32 bg-gradient-to-b from-black/60 via-black/80 to-black">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className={combineClasses(
            "text-brand-primary font-montserrat",
            "text-sm font-semibold tracking-wider uppercase",
            "bg-gradient-to-r from-teal-400 to-emerald-400 text-transparent bg-clip-text"
          )}>
            Everything you need
          </h2>
          <p className={combineClasses(
            "mt-2 font-bold tracking-tight text-white",
            "text-4xl font-primary",
            "leading-tight"
          )}>
            Intelligent Route Planning
          </p>
          <p className={combineClasses(
            "mt-6 text-lg leading-8 text-gray-300",
            "font-secondary"
          )}>
            Experience the future of route planning with our comprehensive set of features,
            designed to make your outdoor adventures more enjoyable and efficient.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div 
                key={feature.name} 
                className={combineClasses(
                  "relative group p-8 rounded-2xl",
                  "bg-white/5 backdrop-blur-sm",
                  "border border-white/10",
                  "hover:bg-white/10",
                  "transition-all duration-300",
                  "transform hover:scale-105"
                )}
              >
                <dt className="flex items-center gap-x-3">
                  <div className={combineClasses(
                    "flex-shrink-0 flex items-center justify-center",
                    "h-12 w-12 rounded-lg",
                    "bg-brand-primary-teal-500/10 group-hover:bg-brand-primary-teal-500/20",
                    "transition-colors duration-300"
                  )}>
                    <feature.icon className="h-6 w-6 text-brand-primary-teal-500" />
                  </div>
                  <h3 className={combineClasses(
                    "text-xl font-semibold text-white",
                    "font-primary leading-snug"
                  )}>
                    {feature.name}
                  </h3>
                </dt>
                <dd className="mt-4">
                  <p className={combineClasses(
                    "text-base text-gray-300",
                    "font-secondary leading-relaxed"
                  )}>
                    {feature.description}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
} 