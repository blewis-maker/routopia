import { useRealTimeStore } from '@/store/realtime/realtime.store';
import { useFeedbackStore } from '@/store/feedback/feedback.store';

export const realTimeService = {
  // WebSocket connection
  socket: null as WebSocket | null,

  // Initialize real-time connections
  async initialize() {
    try {
      this.socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
      
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleUpdate(data);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.handleError(error);
      };

      // Set up reconnection
      this.socket.onclose = () => {
        setTimeout(() => this.initialize(), 5000);
      };

    } catch (error) {
      this.handleError(error);
    }
  },

  // Handle different types of updates
  handleUpdate(data: any) {
    const store = useRealTimeStore.getState();
    
    switch (data.type) {
      case 'weather':
        store.updateWeather(data.payload);
        break;
      case 'traffic':
        store.updateTraffic(data.payload);
        break;
      case 'conditions':
        store.updateConditions(data.payload);
        break;
      default:
        console.warn('Unknown update type:', data.type);
    }
  },

  // Error handling
  handleError(error: any) {
    const feedbackStore = useFeedbackStore.getState();
    feedbackStore.addAlert({
      type: 'error',
      message: 'Real-time connection error',
      detail: error.message
    });
  },

  // Clean up
  cleanup() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}; 