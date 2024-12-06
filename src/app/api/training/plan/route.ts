import { NextResponse } from 'next/server';
import type { ActivityType, TrainingPlan } from '@/types/activities';
import { getTrainingPlan, createTrainingPlan, updateTrainingPlan } from '@/services/training';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ActivityType;

    if (!type) {
      return NextResponse.json(
        { error: 'Activity type is required' },
        { status: 400 }
      );
    }

    const plan = await getTrainingPlan(type);
    return NextResponse.json(plan);
  } catch (error) {
    console.error('Failed to fetch training plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training plan' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const plan: TrainingPlan = await request.json();
    const newPlan = await createTrainingPlan(plan);
    return NextResponse.json(newPlan);
  } catch (error) {
    console.error('Failed to create training plan:', error);
    return NextResponse.json(
      { error: 'Failed to create training plan' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const plan: TrainingPlan = await request.json();
    const updatedPlan = await updateTrainingPlan(plan);
    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error('Failed to update training plan:', error);
    return NextResponse.json(
      { error: 'Failed to update training plan' },
      { status: 500 }
    );
  }
} 