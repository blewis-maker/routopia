import React from 'react';

interface InteractionFeedbackProps {
  feedback: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>;
}

export const InteractionFeedback: React.FC<InteractionFeedbackProps> = ({ feedback }) => {
  if (!feedback || feedback.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {feedback.map((item) => (
        <div
          key={item.id}
          className={`rounded-lg p-4 shadow-lg ${
            item.type === 'success'
              ? 'bg-green-100 text-green-800'
              : item.type === 'error'
              ? 'bg-red-100 text-red-800'
              : item.type === 'warning'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}; 