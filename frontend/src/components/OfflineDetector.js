import React, { useState, useEffect } from 'react';

function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setWasOffline(true);
      
      setTimeout(() => {
        setShowBanner(false);
      }, 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      setWasOffline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkConnection = setInterval(() => {
      if (navigator.onLine !== isOnline) {
        setIsOnline(navigator.onLine);
        setShowBanner(true);
        if (navigator.onLine) {
          setTimeout(() => setShowBanner(false), 4000);
        }
      }
    }, 3000);

    return () => clearInterval(checkConnection);
  }, [isOnline]);

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '70px',
      left: 0,
      right: 0,
      zIndex: 9999,
      animation: 'slideDown 0.3s ease',
    }}>
      {!isOnline ? (
        <div style={{
          backgroundColor: '#e74c3c',
          color: 'white',
          padding: '12px 20px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '24px' }}>📡</span>
            <div>
              <strong>You are offline!</strong>
              <p style={{ margin: '5px 0 0', fontSize: '13px', opacity: 0.9 }}>
                Please check your internet connection. Some features may be limited.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: 'white',
                color: '#e74c3c',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Retry
            </button>
          </div>
        </div>
      ) : wasOffline && (
        <div style={{
          backgroundColor: '#27ae60',
          color: 'white',
          padding: '12px 20px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          animation: 'fadeOut 0.5s ease 3s forwards',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>✅</span>
            <div>
              <strong>Back online!</strong>
              <p style={{ margin: '5px 0 0', fontSize: '13px', opacity: 0.9 }}>
                Your connection has been restored.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
            visibility: hidden;
          }
        }
      `}</style>
    </div>
  );
}

export default OfflineDetector;