import { Injectable } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class NotificationService {
    private currentMessage = new BehaviorSubject<any>(null);
    public currentMessage$ = this.currentMessage.asObservable();
    private notifications = new BehaviorSubject<any[]>([]);
    public notifications$ = this.notifications.asObservable();

    constructor(private messaging: Messaging, private http: HttpClient) {
        this.listen();
        this.loadNotifications();
    }

    // Request permission dan ambil token FCM
    async requestPermission(): Promise<string | null> {
        try {
            // Register service worker
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                console.log('Service Worker registered:', registration);
            }

            const token = await getToken(this.messaging, {
                vapidKey: 'YOUR_VAPID_KEY_HERE' // Sudah diisi VAPID key
            });

            if (token) {
                this.sendFcmTokenToBackend(token);
            }

            return token;
        } catch (error) {
            console.error('Error getting FCM token:', error);
            return null;
        }
    }

    // Listen pesan notifikasi saat aplikasi aktif
    private listen() {
        onMessage(this.messaging, (payload) => {
            console.log('Message received:', payload);

            // Tampilkan notifikasi saat aplikasi aktif
            this.showNotification(payload.notification?.title || 'Notifikasi', payload.notification?.body || '');

            // Simpan ke local storage
            this.saveNotification({
                id: Date.now(),
                title: payload.notification?.title || 'Notifikasi',
                body: payload.notification?.body || '',
                data: payload.data || {},
                timestamp: new Date().toISOString(),
                read: false
            });
        });
    }

    // Kirim FCM token ke backend
    private async sendFcmTokenToBackend(token: string) {
        try {
            const response = await this.http.post('/api/user/fcm-token', { fcm_token: token }).toPromise();
            console.log('FCM token sent to backend:', response);
        } catch (error) {
            console.error('Error sending FCM token to backend:', error);
        }
    }

    // Tampilkan notifikasi sederhana
    private showNotification(title: string, body: string) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body });
        } else {
            // Fallback: alert jika notification API tidak tersedia
            alert(`${title}\n${body}`);
        }
    }

    // Simpan notifikasi ke local storage
    private saveNotification(notification: any) {
        const notifications = this.getNotificationsFromStorage();
        notifications.unshift(notification); // Tambah di awal array

        // Batasi hanya 50 notifikasi terbaru
        if (notifications.length > 50) {
            notifications.splice(50);
        }

        localStorage.setItem('notifications', JSON.stringify(notifications));
        this.notifications.next(notifications);
    }

    // Ambil notifikasi dari local storage
    private getNotificationsFromStorage(): any[] {
        try {
            const stored = localStorage.getItem('notifications');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading notifications:', error);
            return [];
        }
    }

    // Load notifikasi saat service diinisialisasi
    private loadNotifications() {
        const notifications = this.getNotificationsFromStorage();
        this.notifications.next(notifications);
    }

    // Mark notifikasi sebagai sudah dibaca
    markAsRead(notificationId: number) {
        const notifications = this.getNotificationsFromStorage();
        const index = notifications.findIndex(n => n.id === notificationId);

        if (index !== -1) {
            notifications[index].read = true;
            localStorage.setItem('notifications', JSON.stringify(notifications));
            this.notifications.next(notifications);
        }
    }

    // Hapus notifikasi
    deleteNotification(notificationId: number) {
        const notifications = this.getNotificationsFromStorage();
        const filtered = notifications.filter(n => n.id !== notificationId);

        localStorage.setItem('notifications', JSON.stringify(filtered));
        this.notifications.next(filtered);
    }

    // Hapus semua notifikasi
    clearAllNotifications() {
        localStorage.removeItem('notifications');
        this.notifications.next([]);
    }
} 