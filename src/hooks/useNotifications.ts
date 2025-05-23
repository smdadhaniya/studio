import { useState, useEffect, useCallback } from 'react';

type NotificationPermission = 'default' | 'granted' | 'denied';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      return;
    }
    setPermission(Notification.permission as NotificationPermission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return 'denied' as NotificationPermission;
    }
    const status = await Notification.requestPermission();
    setPermission(status as NotificationPermission);
    return status as NotificationPermission;
  }, []);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported.');
      return null;
    }

    if (permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icons/habit-forge-logo.png', // Placeholder, replace with actual icon path
        badge: '/icons/habit-forge-badge.png', // Placeholder
        ...options,
      });
      return notification;
    } else if (permission === 'default') {
      requestPermission().then(status => {
        if (status === 'granted') {
          const notification = new Notification(title, { 
             icon: '/icons/habit-forge-logo.png',
             badge: '/icons/habit-forge-badge.png',
            ...options 
          });
          return notification;
        }
      });
    } else {
      console.log('Notification permission denied.');
    }
    return null;
  }, [permission, requestPermission]);

  return { permission, requestPermission, showNotification };
}
