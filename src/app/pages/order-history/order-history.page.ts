import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-order-history',
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule],
    templateUrl: './order-history.page.html',
    styleUrls: ['./order-history.page.scss']
})
export class OrderHistoryPage implements OnInit {
    orders: any[] = [];
    filteredOrders: any[] = [];
    loading = false;
    error: string | null = null;
    activeTab: 'active' | 'finished' | 'canceled' = 'active';

    constructor(public api: ApiService, public router: Router) { }

    ngOnInit() {
        this.fetchOrders();
    }

    fetchOrders() {
        this.loading = true;
        this.api.get('/orders').subscribe({
            next: (res: any) => {
                this.orders = res.data;
                this.filterOrders();
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Gagal memuat riwayat pesanan';
                this.loading = false;
            }
        });
    }

    setTab(tab: 'active' | 'finished' | 'canceled') {
        this.activeTab = tab;
        this.filterOrders();
    }

    filterOrders() {
        if (this.activeTab === 'active') {
            this.filteredOrders = this.orders.filter(order =>
                ['Menunggu Pembayaran', 'Diproses', 'Dikirim'].includes(order.status)
            );
        } else if (this.activeTab === 'finished') {
            this.filteredOrders = this.orders.filter(order => order.status === 'Selesai' || order.status === 'Diterima');
        } else if (this.activeTab === 'canceled') {
            this.filteredOrders = this.orders.filter(order => order.status === 'Dibatalkan');
        }
    }

    goToDetail(orderId: number) {
        this.router.navigate(['/order-detail', orderId]);
    }

    leaveReview(orderId: number) {
        // Navigasi ke halaman review (bisa disesuaikan)
        this.router.navigate(['/leave-review', orderId]);
    }

    goBack() {
        this.router.navigate(['/profile']);
    }

    reOrder(orderId: number) {
        // Cari order berdasarkan id
        const order = this.orders.find(o => o.id === orderId);
        if (order && order.order_items && order.order_items.length > 0) {
            const productId = order.order_items[0].product?.id;
            if (productId) {
                // Navigasi ke halaman detail produk (atau bisa ke checkout ulang jika diinginkan)
                this.router.navigate(['/product-detail', productId]);
            }
        }
    }
} 