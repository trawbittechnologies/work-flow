self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', function (event) {
  let data = { title: 'Flowdesk Notification', body: 'You have a new update in Flowdesk.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Flowdesk Notification', body: event.data.text() };
    }
  }

  const origin = self.location.origin;

  // Resolve icon & badge relative paths to absolute HTTPS URLs for Chrome Android & Desktop push shades
  const iconUrl = data.icon 
    ? (data.icon.startsWith('http') ? data.icon : origin + data.icon) 
    : origin + '/icon-192.png';

  const badgeUrl = data.badge 
    ? (data.badge.startsWith('http') ? data.badge : origin + data.badge) 
    : origin + '/badge-72.png';

  const options = {
    body: data.body || '',
    icon: iconUrl,
    badge: badgeUrl,
    image: data.image || undefined,
    vibrate: [100, 50, 100, 50, 100],
    tag: data.tag || 'flowdesk-notification',
    renotify: true,
    requireInteraction: false,
    data: {
      dateOfArrival: Date.now(),
      url: data.url || '/',
      notificationId: data.notificationId,
    },
    actions: [
      { action: 'open', title: 'Open in Flowdesk' },
      { action: 'mark_read', title: 'Mark Read' }
    ]
  };

  const pushTitle = data.title && !data.title.startsWith('Flowdesk') 
    ? `Flowdesk · ${data.title}` 
    : (data.title || 'Flowdesk Notification');

  event.waitUntil(
    self.registration.showNotification(pushTitle, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const notificationData = event.notification?.data || {};
  const targetUrl = notificationData.url || '/';
  const notificationId = notificationData.notificationId;

  // Handle Mark Read action directly from notification shade
  if (event.action === 'mark_read' && notificationId) {
    event.waitUntil(
      fetch(`/api/notifications/${notificationId}`, { method: 'PATCH' }).catch(function (e) {
        console.error('Failed to mark read from service worker:', e);
      })
    );
    return;
  }

  // Handle click or Open action to focus/navigate open tab or launch new window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url && client.url.includes(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
