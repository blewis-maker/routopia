import { NotificationPreferences, RouteUpdate } from '@/types/notification';

export class RouteNotificationService {
  private readonly VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY;
  private notificationPreferences: NotificationPreferences = {
    routeUpdates: true,
    weatherAlerts: true,
    trafficAlerts: true,
    socialUpdates: false
  };

  constructor() {
    this.initNotifications();
  }

  private async initNotifications() {
    try {
      if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return;
      }

      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      await this.registerServiceWorker();
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      
      // Register for push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.VAPID_PUBLIC_KEY
      });

      // Send subscription to backend
      await this.updateSubscription(subscription);
    }
  }

  private async updateSubscription(subscription: PushSubscription) {
    try {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          preferences: this.notificationPreferences
        }),
      });
    } catch (error) {
      console.error('Failed to update push subscription:', error);
    }
  }

  public async updatePreferences(preferences: Partial<NotificationPreferences>) {
    this.notificationPreferences = {
      ...this.notificationPreferences,
      ...preferences
    };

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await this.updateSubscription(subscription);
    }
  }

  public async subscribeToRouteUpdates(routeId: string) {
    try {
      await fetch('/api/routes/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ routeId }),
      });
    } catch (error) {
      console.error('Failed to subscribe to route updates:', error);
    }
  }

  public async unsubscribeFromRouteUpdates(routeId: string) {
    try {
      await fetch('/api/routes/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ routeId }),
      });
    } catch (error) {
      console.error('Failed to unsubscribe from route updates:', error);
    }
  }

  public getPreferences(): NotificationPreferences {
    return { ...this.notificationPreferences };
  }

  public async handleRouteUpdate(update: RouteUpdate) {
    if (!this.notificationPreferences.routeUpdates) return;

    const notification = new Notification(update.title, {
      body: update.description,
      icon: '/icons/route-update.png',
      badge: '/icons/badge-72x72.png',
      data: {
        routeId: update.routeId,
        type: 'route-update'
      },
      actions: [
        {
          action: 'view',
          title: 'View Route'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });

    notification.onclick = () => {
      window.open(`/routes/${update.routeId}`);
    };
  }
} 