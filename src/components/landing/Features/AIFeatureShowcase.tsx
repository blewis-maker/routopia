import { Brain, Map, Navigation2 } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Planning',
    description: 'Intelligent route suggestions based on your preferences and conditions'
  },
  {
    icon: Map,
    title: 'Smart Navigation',
    description: 'Real-time adaptations and optimal path finding'
  },
  {
    icon: Navigation2,
    title: 'Contextual Awareness',
    description: 'Weather-aware and terrain-conscious route planning'
  }
];

export default function AIFeatureShowcase() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">
          Powered by Intelligence
        </h2>
        <p className="text-xl text-stone-400 max-w-2xl mx-auto">
          Experience the future of route planning with our advanced AI features
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div 
            key={feature.title}
            className="
              p-6 rounded-lg
              bg-stone-800/50 backdrop-blur-sm
              border border-stone-700
              hover:border-teal-500
              transition-all duration-300
            "
          >
            <feature.icon className="h-8 w-8 text-teal-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-stone-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 