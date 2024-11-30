import { OpenAIStream } from '@/lib/openai';
import { prisma } from '@/lib/prisma';
import { authenticatedRoute } from '@/lib/auth';

export const POST = authenticatedRoute(async (req: Request, session) => {
  try {
    const { messages, routeContext } = await req.json();

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages format', { status: 400 });
    }

    // Create or update chat session
    const chat = await prisma.chat.create({
      data: {
        userId: session.user.id,
        context: routeContext,
        messages: {
          create: messages.map((msg: any) => ({
            content: msg.content,
            role: msg.role,
            createdAt: new Date(),
          })),
        },
      },
      include: {
        messages: true,
      },
    });

    // Generate AI response stream
    const stream = await OpenAIStream(messages, routeContext);
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}); 