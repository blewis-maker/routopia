import { NextResponse } from 'next/server';
import type { ActivityType, Workout } from '@/types/activities';
import { getWorkouts, createWorkout, updateWorkout } from '@/services/training';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ActivityType;
    const upcoming = searchParams.get('upcoming') === 'true';

    if (!type) {
      return NextResponse.json(
        { error: 'Activity type is required' },
        { status: 400 }
      );
    }

    const workouts = await getWorkouts(type, upcoming);
    return NextResponse.json(workouts);
  } catch (error) {
    console.error('Failed to fetch workouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workouts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const workout: Workout = await request.json();
    const newWorkout = await createWorkout(workout);
    return NextResponse.json(newWorkout);
  } catch (error) {
    console.error('Failed to create workout:', error);
    return NextResponse.json(
      { error: 'Failed to create workout' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const workout: Workout = await request.json();
    const updatedWorkout = await updateWorkout(workout);
    return NextResponse.json(updatedWorkout);
  } catch (error) {
    console.error('Failed to update workout:', error);
    return NextResponse.json(
      { error: 'Failed to update workout' },
      { status: 500 }
    );
  }
} 