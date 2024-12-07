import { Heading } from '@/components/common/Typography';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <Heading 
        level={1}
        variant="2xl"
        className="mb-6 font-montserrat"
      >
        Welcome to Routopia
      </Heading>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-stone-800 rounded-xl p-6 border border-stone-700">
          <Heading 
            level={2}
            variant="lg"
            className="mb-4"
          >
            Quick Actions
          </Heading>
          <div className="space-y-3">
            <button className="w-full p-3 bg-stone-700 rounded-lg hover:bg-stone-600 transition-colors text-left">
              🗺️ Create New Route
            </button>
            <button className="w-full p-3 bg-stone-700 rounded-lg hover:bg-stone-600 transition-colors text-left">
              🎯 Explore POIs
            </button>
            <button className="w-full p-3 bg-stone-700 rounded-lg hover:bg-stone-600 transition-colors text-left">
              📊 View Activities
            </button>
          </div>
        </div>

        {/* Recent Routes */}
        <div className="bg-stone-800 rounded-xl p-6 border border-stone-700">
          <Heading 
            level={2}
            variant="lg"
            className="mb-4"
          >
            Recent Routes
          </Heading>
          <div className="text-stone-400">
            No routes created yet. Start planning your next adventure!
          </div>
        </div>

        {/* Weather Widget Placeholder */}
        <div className="bg-stone-800 rounded-xl p-6 border border-stone-700">
          <Heading 
            level={2}
            variant="lg"
            className="mb-4"
          >
            Weather
          </Heading>
          <div className="text-stone-400">
            Weather information coming soon...
          </div>
        </div>
      </div>
    </div>
  );
} 