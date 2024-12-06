import { useState, useEffect } from 'react';
import type { TrainingPlan, Workout, ActivityType } from '@/types/activities';

interface Props {
  activityType?: ActivityType;
}

export function TrainingIntegration({ activityType }: Props) {
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainingData = async () => {
      try {
        const [planRes, workoutsRes] = await Promise.all([
          fetch(`/api/training/plan?type=${activityType}`),
          fetch(`/api/training/workouts?type=${activityType}&upcoming=true`)
        ]);
        
        const [planData, workoutsData] = await Promise.all([
          planRes.json(),
          workoutsRes.json()
        ]);

        setTrainingPlan(planData);
        setUpcomingWorkouts(workoutsData);
      } catch (error) {
        console.error('Failed to fetch training data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activityType) {
      fetchTrainingData();
    }
  }, [activityType]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-stone-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-stone-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-800 rounded-lg p-6">
      {/* Training Plan Overview */}
      {trainingPlan ? (
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white">{trainingPlan.name}</h2>
              <p className="text-sm text-stone-400">
                {new Date(trainingPlan.startDate).toLocaleDateString()} - {new Date(trainingPlan.endDate).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/training/edit'}
              className="px-4 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-500 transition-colors"
            >
              Edit Plan
            </button>
          </div>
          <p className="text-stone-300">{trainingPlan.goal}</p>
        </div>
      ) : (
        <div className="text-center py-8 mb-8 border-2 border-dashed border-stone-700 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-2">No Training Plan</h2>
          <p className="text-stone-400 mb-4">Create a training plan to track your progress</p>
          <button
            onClick={() => window.location.href = '/training/create'}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500 transition-colors"
          >
            Create Plan
          </button>
        </div>
      )}

      {/* Upcoming Workouts */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Upcoming Workouts</h3>
        <div className="space-y-4">
          {upcomingWorkouts.length === 0 ? (
            <p className="text-center py-4 text-stone-400">No upcoming workouts</p>
          ) : (
            upcomingWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="bg-stone-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-white">{workout.type}</h4>
                    <p className="text-sm text-stone-400">
                      {new Date(workout.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                  {workout.actualMetrics ? (
                    <span className="px-2 py-1 bg-emerald-600 text-white text-sm rounded">
                      Completed
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-stone-600 text-white text-sm rounded">
                      Upcoming
                    </span>
                  )}
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-400">Target Distance</span>
                    <span className="text-white">{workout.targetMetrics.distance} km</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-400">Target Duration</span>
                    <span className="text-white">{Math.floor(workout.targetMetrics.duration / 60)}h {workout.targetMetrics.duration % 60}m</span>
                  </div>
                  {workout.notes && (
                    <p className="text-sm text-stone-400 mt-2">{workout.notes}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 