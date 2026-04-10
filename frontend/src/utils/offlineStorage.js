// Save data for offline access
export const saveForOffline = (key, data) => {
  try {
    localStorage.setItem(`offline_${key}`, JSON.stringify({
      data: data,
      timestamp: Date.now(),
      version: '1.0'
    }));
    console.log(`Saved ${key} for offline access`);
  } catch (error) {
    console.error('Error saving offline data:', error);
  }
};

// Get offline data
export const getOfflineData = (key) => {
  try {
    const saved = localStorage.getItem(`offline_${key}`);
    if (saved) {
      return JSON.parse(saved).data;
    }
    return null;
  } catch (error) {
    console.error('Error getting offline data:', error);
    return null;
  }
};

// Check if data is stale (older than 1 hour)
export const isDataStale = (key, maxAgeMinutes = 60) => {
  try {
    const saved = localStorage.getItem(`offline_${key}`);
    if (saved) {
      const { timestamp } = JSON.parse(saved);
      const age = (Date.now() - timestamp) / (1000 * 60);
      return age > maxAgeMinutes;
    }
    return true;
  } catch (error) {
    return true;
  }
};

// Clear offline data
export const clearOfflineData = (key) => {
  if (key) {
    localStorage.removeItem(`offline_${key}`);
  } else {
    // Clear all offline data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('offline_')) {
        localStorage.removeItem(key);
      }
    });
  }
};

// Queue actions for when back online
let actionQueue = [];

export const queueAction = (action) => {
  actionQueue.push(action);
  localStorage.setItem('offline_actions', JSON.stringify(actionQueue));
};

export const processQueue = () => {
  const actions = JSON.parse(localStorage.getItem('offline_actions') || '[]');
  if (actions.length > 0) {
    console.log(`Processing ${actions.length} queued actions`);
    actions.forEach(async (action) => {
      try {
        // Process action based on type
        if (action.type === 'order') {
          // Retry order submission
          console.log('Retrying order submission:', action.data);
        }
      } catch (error) {
        console.error('Failed to process queued action:', error);
      }
    });
    localStorage.removeItem('offline_actions');
    actionQueue = [];
  }
};