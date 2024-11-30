import { prisma } from '@/lib/prisma';

export interface ChatContext {
  startLocation?: string;
  endLocation?: string;
  routeType?: 'CAR' | 'BIKE' | 'SKI';
  preferences?: Record<string, any>;
}

export async function saveChatContext(chatId: string, context: ChatContext) {
  return prisma.chat.update({
    where: { id: chatId },
    data: { context },
  });
}

export async function getChatContext(chatId: string) {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: { context: true },
  });
  return chat?.context as ChatContext | null;
}

export function generateSystemPrompt(context: ChatContext) {
  return `You are a route planning assistant helping with a ${context.routeType?.toLowerCase() || 'general'} journey.
    ${context.startLocation ? `Starting from: ${context.startLocation}` : ''}
    ${context.endLocation ? `Destination: ${context.endLocation}` : ''}
    Provide specific, actionable advice and consider relevant factors like weather, traffic, and terrain when applicable.`;
} 