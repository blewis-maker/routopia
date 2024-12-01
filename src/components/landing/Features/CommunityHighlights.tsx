const highlights = [
  {
    id: 1,
    title: 'Community Routes',
    description: 'Discover and share amazing routes with fellow adventurers',
    image: '/images/community-routes.jpg'
  },
  {
    id: 2,
    title: 'Group Activities',
    description: 'Plan and coordinate group adventures effortlessly',
    image: '/images/group-activities.jpg'
  },
  {
    id: 3,
    title: 'Achievement Tracking',
    description: 'Track your progress and earn badges for your adventures',
    image: '/images/achievements.jpg'
  }
];

export default function CommunityHighlights() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">
          Join the Community
        </h2>
        <p className="text-xl text-stone-400 max-w-2xl mx-auto">
          Connect with fellow adventurers and share your experiences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {highlights.map((highlight) => (
          <div
            key={highlight.id}
            className="
              relative overflow-hidden rounded-lg
              group cursor-pointer
              aspect-square
            "
          >
            <img
              src={highlight.image}
              alt={highlight.title}
              className="
                absolute inset-0 w-full h-full
                object-cover
                group-hover:scale-110
                transition-transform duration-500
              "
            />
            <div className="
              absolute inset-0
              bg-gradient-to-t from-stone-900 via-stone-900/50 to-transparent
              group-hover:from-teal-900/90
              transition-colors duration-300
            ">
              <div className="absolute bottom-0 p-6 space-y-2">
                <h3 className="text-2xl font-bold">{highlight.title}</h3>
                <p className="text-stone-300">{highlight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 