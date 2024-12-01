import React from 'react';
import { MainApplicationView } from '@/components/app/MainApplicationView';
import { useMainApplicationStore } from '@/store/app/mainApplication.store';

export default function TestPage() {
  const store = useMainApplicationStore();

  React.useEffect(() => {
    // Initialize the application
    store.initializeIntegration();
  }, []);

  return (
    <div className="test-page">
      <header className="test-controls">
        <h1>Routopia Test Page</h1>
        <div className="test-actions">
          <button onClick={() => store.toggleLeftPanel()}>
            Toggle Left Panel
          </button>
          <button onClick={() => store.toggleRightPanel()}>
            Toggle Right Panel
          </button>
          <button onClick={() => store.setActiveView('map')}>
            Show Map
          </button>
        </div>
      </header>

      <main className="test-content">
        <MainApplicationView />
      </main>

      <footer className="test-metrics">
        <div>Left Panel: {store.layout.leftPanelOpen ? 'Open' : 'Closed'}</div>
        <div>Right Panel: {store.layout.rightPanelOpen ? 'Open' : 'Closed'}</div>
        <div>Active View: {store.layout.activeView}</div>
      </footer>
    </div>
  );
} 