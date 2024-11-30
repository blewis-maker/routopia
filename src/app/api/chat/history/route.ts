import { authenticatedRoute } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = authenticatedRoute(async (req: Request, session) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limit to last 10 chats
    });

    return Response.json(chats);
  } catch (error) {
    console.error('Chat history error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}); 