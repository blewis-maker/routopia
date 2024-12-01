const activities = [
  { id: 'hiking', name: 'Hiking', icon: '🥾', color: 'from-green-500 to-emerald-500' },
  { id: 'cycling', name: 'Cycling', icon: '🚴', color: 'from-blue-500 to-cyan-500' },
  { id: 'running', name: 'Running', icon: '🏃', color: 'from-orange-500 to-amber-500' },
  { id: 'skiing', name: 'Skiing', icon: '⛷️', color: 'from-blue-500 to-indigo-500' },
  { id: 'walking', name: 'Walking', icon: '🚶', color: 'from-teal-500 to-emerald-500' },
  { id: 'climbing', name: 'Climbing', icon: '🧗', color: 'from-red-500 to-pink-500' }
];

export default function ActivityTypesGrid() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">
          Activities for Everyone
        </h2>
        <p className="text-xl text-stone-400 max-w-2xl mx-auto">
          Choose your adventure from our wide range of supported activities
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {activities.map((activity) => (
          <button
            key={activity.id}
            className={`
              p-6 rounded-lg
              bg-gradient-to-r ${activity.color}
              hover:scale-105
              transition-all duration-300
              group
            `}
          >
            <div className="text-center space-y-2">
              <span className="text-4xl" role="img" aria-label={activity.name}>
                {activity.icon}
              </span>
              <p className="text-lg font-medium text-white">{activity.name}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 