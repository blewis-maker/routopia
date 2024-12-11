export default function RoutePlannerLoading() {
  return (
    <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-stone-700 border-t-teal-500 rounded-full animate-spin" />
        <p className="text-stone-400 animate-pulse">Loading route planner...</p>
      </div>
    </div>
  );
} 