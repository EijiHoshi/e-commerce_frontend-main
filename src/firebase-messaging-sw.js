// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase config (sama dengan environment.ts)
firebase.initializeApp({
    apiKey: "AIzaSyB8Iu_m3oybTEEipzD8hDlk8ZZ_9PHo2-4",
    authDomain: "efabli.firebaseapp.com",
    projectId: "efabli",
    storageBucket: "efabli.firebasestorage.app",
    messagingSenderId: "1047273745943",
    appId: "1:1047273745943:web:b89b9d2aefba525a383652",
    measurementId: "G-S7Q0DQ3EH0"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/assets/icon/favicon.png',
        badge: '/assets/icon/favicon.png',
        data: payload.data || {},
        actions: [
            {
                action: 'view',
                title: 'Lihat'
            },
            {
                action: 'close',
                title: 'Tutup'
            }
        ]
    };

    // Tampilkan notifikasi sistem
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    event.notification.close();

    if (event.action === 'view') {
        // Buka aplikasi ke halaman tertentu berdasarkan data notifikasi
        const data = event.notification.data;
        if (data.type === 'order_status') {
            event.waitUntil(
                clients.openWindow(`/order-detail/${data.order_id}`)
            );
        } else {
            event.waitUntil(
                clients.openWindow('/')
            );
        }
    }
}); 