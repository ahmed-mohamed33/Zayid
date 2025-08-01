// Firebase messaging service worker for background notifications
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDT_A1OngbjNwJEOqHmepDjClNl4N2T6Sg",
    authDomain: "zayid-itp25.firebaseapp.com",
    projectId: "zayid-itp25",
    storageBucket: "zayid-itp25.firebasestorage.app",
    messagingSenderId: "802245016540",
    appId: "1:802245016540:web:43b08451f17ae79249ed19",
    measurementId: "G-7GLVZKTM4X",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification?.title || payload.data?.title || 'Zayid Notification';
    const notificationBody = payload.notification?.body || payload.data?.body || 'You have a new notification';

    const notificationOptions = {
        body: notificationBody,
        icon: '/logo-zayid.png',
        badge: '/logo-zayid.png',
        data: payload.data || {},
        requireInteraction: true,
        tag: payload.data?.auctionId || 'zayid-notification', // Group notifications by auction
        actions: [
            {
                action: 'view',
                title: 'عرض المزاد',
                icon: '/logo-zayid.png'
            },
            {
                action: 'dismiss',
                title: 'إغلاق',
                icon: '/logo-zayid.png'
            }
        ]
    };

    // Show notification
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click received.');

    event.notification.close();

    if (event.action === 'view' && event.notification.data?.auctionId) {
        // Open the auction page
        event.waitUntil(
            clients.openWindow(`/auction/${event.notification.data.auctionId}`)
        );
    } else if (event.action === 'dismiss') {
        // Just close the notification
        event.notification.close();
    } else {
        // Default action - open the main app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    console.log('[firebase-messaging-sw.js] Notification closed.');
});

// Handle service worker installation
self.addEventListener('install', (event) => {
    console.log('[firebase-messaging-sw.js] Service Worker installing...');
    self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
    console.log('[firebase-messaging-sw.js] Service Worker activating...');
    event.waitUntil(self.clients.claim());
});

// Handle push events (fallback for older browsers)
self.addEventListener('push', (event) => {
    console.log('[firebase-messaging-sw.js] Push event received.');

    if (event.data) {
        try {
            const payload = event.data.json();
            const notificationTitle = payload.notification?.title || payload.data?.title || 'Zayid Notification';
            const notificationBody = payload.notification?.body || payload.data?.body || 'You have a new notification';

            const notificationOptions = {
                body: notificationBody,
                icon: '/logo-zayid.png',
                badge: '/logo-zayid.png',
                data: payload.data || {},
                requireInteraction: true,
                tag: payload.data?.auctionId || 'zayid-notification'
            };

            event.waitUntil(
                self.registration.showNotification(notificationTitle, notificationOptions)
            );
        } catch (error) {
            console.error('[firebase-messaging-sw.js] Error handling push event:', error);
        }
    }
}); 