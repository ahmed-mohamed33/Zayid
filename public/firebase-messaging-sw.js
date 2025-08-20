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


firebase.initializeApp(firebaseConfig);


const messaging = firebase.messaging();


messaging.usePublicVapidKey = messaging.usePublicVapidKey || messaging.usePublicVapidKey || function (key) {

};


messaging.usePublicVapidKey(vapidKey);

// Handle background messages
messaging.onBackgroundMessage((payload) => {
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


self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view' && event.notification.data?.auctionId) {
        
        event.waitUntil(
            clients.openWindow(`/auction/${event.notification.data.auctionId}`)
        );
    } else if (event.action === 'dismiss') {
   
        event.notification.close();
    } else {
      
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
});


self.addEventListener('install', (event) => {
    self.skipWaiting();
});


self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});


self.addEventListener('push', (event) => {
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