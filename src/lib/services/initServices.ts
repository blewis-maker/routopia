import { env } from '@/env.mjs';

class ServiceInitializer {
  private initialized = false;

  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // Your initialization logic here
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize services:', error);
      throw error;
    }
  }

  isInitialized() {
    return this.initialized;
  }
}

export const serviceInitializer = new ServiceInitializer(); 