export const LoadingStates = {
  Hero: function HeroLoader() {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="h-12 bg-stone-800 rounded-lg w-3/4 mx-auto" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-48 bg-stone-800 rounded-lg" />
          <div className="h-48 bg-stone-800 rounded-lg" />
          <div className="h-48 bg-stone-800 rounded-lg" />
        </div>
      </div>
    );
  },

  Feature: function FeatureLoader() {
    return (
      <div className="glass-effect rounded-lg p-6 animate-pulse">
        <div className="h-8 w-8 bg-stone-800 rounded-full mb-4" />
        <div className="h-6 bg-stone-800 rounded w-3/4 mb-3" />
        <div className="h-4 bg-stone-800 rounded w-full" />
      </div>
    );
  },

  ActivityCard: function ActivityLoader() {
    return (
      <div className="aspect-square rounded-lg animate-pulse bg-stone-800">
        <div className="h-full flex items-center justify-center">
          <div className="h-12 w-12 bg-stone-700 rounded-full" />
        </div>
      </div>
    );
  }
}; 