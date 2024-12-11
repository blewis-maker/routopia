import { create } from 'zustand';
import type { SavedRoute } from '@/types/routes';
import { RouteCache } from '@/lib/cache/RouteCache';
import { prisma } from '@/lib/prisma';

interface RouteState {
  activeRoute: SavedRoute | null;
  chatHistory: ChatMessage[];
  setActiveRoute: (route: SavedRoute) => Promise<void>;
  clearActiveRoute: () => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  activeRoute: null,
  chatHistory: [],
  setActiveRoute: async (route) => {
    // Load chat history from database
    const history = await prisma.chatMessage.findMany({
      where: {
        routeId: route.id,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 50, // Limit to last 50 messages
    });

    set({ 
      activeRoute: route,
      chatHistory: history
    });

    // Cache the route and its chat history
    const routeCache = new RouteCache();
    await routeCache.set(`route:${route.id}:chat`, history);
  },
  clearActiveRoute: () => set({ 
    activeRoute: null,
    chatHistory: [] 
  })
})); 