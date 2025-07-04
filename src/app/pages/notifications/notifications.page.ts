import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pipe, PipeTransform } from '@angular/core';
import { Location } from '@angular/common';

@Pipe({ name: 'timeAgo', standalone: true })
export class TimeAgoPipe implements PipeTransform {
    transform(value: string | Date): string {
        if (!value) return '';
        const now = new Date();
        const date = new Date(value);
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diff < 60) return 'now';
        if (diff < 3600) return Math.floor(diff / 60) + 'm';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h';
        if (diff < 2592000) return Math.floor(diff / 86400) + 'd';
        return date.toLocaleDateString();
    }
}

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.page.html',
    styleUrls: ['./notifications.page.scss'],
    imports: [IonicModule, CommonModule, FormsModule, TimeAgoPipe],
    standalone: true,
    providers: [],
})
export class NotificationsPage implements OnInit {
    notifications: any[] = [];
    loading = false;
    error = '';

    constructor(
        private api: ApiService,
        private auth: AuthService,
        private location: Location
    ) { }

    ngOnInit() {
        console.log('ngOnInit notifications');
        this.loadNotifications();
    }

    async loadNotifications() {
        console.log('loadNotifications called');
        this.loading = true;
        this.error = '';

        try {
            const response = await this.api.get('/notifications').toPromise();
            console.log('API response:', response);
            this.notifications = response.data || [];
        } catch (err: any) {
            console.error('API error:', err);
            this.error = err.error?.message || 'Gagal memuat notifikasi';
        } finally {
            this.loading = false;
        }
    }

    async markAsRead(notificationId: number) {
        try {
            await this.api.post(`/notifications/${notificationId}/read`, {}).toPromise();
            const notification = this.notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.status = 'read';
            }
        } catch (err: any) {
            this.error = err.error?.message || 'Gagal menandai sebagai dibaca';
        }
    }

    async markAllAsRead() {
        try {
            await this.api.post('/notifications/read-all', {}).toPromise();
            this.notifications.forEach(notification => {
                notification.status = 'read';
            });
        } catch (err: any) {
            this.error = err.error?.message || 'Gagal menandai semua sebagai dibaca';
        }
    }

    getNotificationIcon(type: string): string {
        switch (type) {
            case 'payment_received':
                return 'card-outline';
            case 'order_status':
                return 'cube-outline';
            case 'stock_alert':
                return 'alert-outline';
            case 'promo':
                return 'pricetag-outline';
            default:
                return 'notifications-outline';
        }
    }

    goBack() {
        this.location.back();
    }
} 