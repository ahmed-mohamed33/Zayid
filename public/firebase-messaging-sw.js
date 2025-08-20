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

const vapidKey = "BFxskOBTpKt7ahmR0c_dSqkrCzs-Wz9zzjfVZgkWo4ox44_nIvU2dyl4Vds3byN1KNLa-unmUeB_WJZD7RSMESk";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize messaging
const messaging = firebase.messaging();

// Set VAPID key for web push - handle both old and new Firebase versions
try {
    if (typeof messaging.usePublicVapidKey === 'function') {
        messaging.usePublicVapidKey(vapidKey);
    } else if (typeof messaging.usePublicVapidKey === 'function') {
        messaging.usePublicVapidKey(vapidKey);
    } else {
        // For newer Firebase versions, set the VAPID key in the config
        console.log('Setting VAPID key in messaging config');
    }
} catch (error) {
    console.warn('Could not set VAPID key:', error);
}

// Handle background messages (when app is closed)
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

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

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event);

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
        // Default action - open home page
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    console.log('[firebase-messaging-sw.js] Notification closed:', event);
});

// Handle push events (for web push)
self.addEventListener('push', (event) => {
    console.log('[firebase-messaging-sw.js] Push event received:', event);

    if (event.data) {
        try {
            const payload = event.data.json();
            console.log('[firebase-messaging-sw.js] Push payload:', payload);

            const notificationTitle = payload.notification?.title || payload.data?.title || 'Zayid Notification';
            const notificationBody = payload.notification?.body || payload.data?.body || 'You have a new notification';

            const notificationOptions = {
                body: notificationBody,
                icon: '/logo-zayid.png',
                badge: '/logo-zayid.png',
                data: payload.data || {},
                requireInteraction: true,
                tag: payload.data?.auctionId || 'zayid-notification',
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

            event.waitUntil(
                self.registration.showNotification(notificationTitle, notificationOptions)
            );
        } catch (error) {
            console.error('[firebase-messaging-sw.js] Error handling push event:', error);
        }
    }
});

// Service worker lifecycle events
self.addEventListener('install', (event) => {
    console.log('[firebase-messaging-sw.js] Service Worker installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[firebase-messaging-sw.js] Service Worker activating...');
    event.waitUntil(self.clients.claim());
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    console.log('[firebase-messaging-sw.js] Message received from main thread:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Log when service worker starts
console.log('[firebase-messaging-sw.js] Service Worker loaded and ready'); 