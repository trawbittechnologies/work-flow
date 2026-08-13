self.addEventListener('push', function (event) {
  if (event.data) {
    let data;
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Trawbit FlowDesk', body: event.data.text() };
    }

    const origin = self.location.origin;

    // Convert relative URLs to absolute HTTPS URLs for Android OS Notification tray
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
      actions: data.actions || [
        { action: 'open', title: 'Open FlowDesk' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Trawbit FlowDesk', options)
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || '/';

  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url && client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
