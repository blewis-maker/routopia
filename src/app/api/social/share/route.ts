import { NextResponse } from 'next/server';
import { SocialIntegrationService } from '@/services/social/SocialIntegrationService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { content, visibility } = body;

    if (!content || !visibility) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize social service
    const socialService = new SocialIntegrationService();

    // Share activity
    await socialService.integrateActivity({
      userId: session.user.id,
      type: content.type,
      data: content.data,
      timestamp: new Date().toISOString()
    }, visibility);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Activity shared successfully'
    });
  } catch (error) {
    console.error('Failed to share activity:', error);
    return NextResponse.json(
      { error: 'Failed to share activity' },
      { status: 500 }
    );
  }
} 