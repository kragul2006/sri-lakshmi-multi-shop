import React, { useState, useEffect } from 'react';

function OfflineCartIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState(0);

  useEffect(() => {
    const updatePendingActions = () => {
      const actions = JSON.parse(localStorage.getItem('offline_actions') || '[]');
      setPendingActions(actions.length);
    };

    updatePendingActions();
    
    const handleOnline = () => {
      setIsOnline(true);
      updatePendingActions();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div style={{
      backgroundColor: '#f39c12',
      color: '#fff',
      padding: '8px 15px',
      borderRadius: '8px',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '10px',
    }}>
      <span>⚠️</span>
      <span>You're offline. Your cart is saved locally.</span>
      {pendingActions > 0 && (
        <span style={{
          backgroundColor: '#e74c3c',
          padding: '2px 6px',
          borderRadius: '10px',
          fontSize: '10px',
        }}>
          {pendingActions} pending
        </span>
      )}
    </div>
  );
}

export default OfflineCartIndicator;