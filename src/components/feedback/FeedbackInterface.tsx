import React from 'react';
import { useFeedbackStore } from '@/store/feedback/feedback.store';
import { AlertSystem } from './AlertSystem';
import { NotificationCenter } from './NotificationCenter';
import { InteractionFeedback } from './InteractionFeedback';

export const FeedbackInterface: React.FC = () => {
  const store = useFeedbackStore();

  return (
    <div className="feedback-interface" data-testid="feedback-interface">
      <AlertSystem 
        alerts={store.alerts}
        onAlertDismiss={store.dismissAlert}
        onAlertAction={store.handleAlertAction}
      />
      
      <NotificationCenter 
        notifications={store.notifications}
        onNotificationRead={store.markAsRead}
      />
      
      <InteractionFeedback 
        feedback={store.interactionFeedback}
        onFeedbackComplete={store.clearFeedback}
      />
    </div>
  );
}; 