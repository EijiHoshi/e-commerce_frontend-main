import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastController } from '@ionic/angular';

@Component({
    selector: 'app-order-detail',
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule],
    templateUrl: './order-detail.page.html',
    styleUrls: ['./order-detail.page.scss']
})
export class OrderDetailPage implements OnInit {
    order: any = null;
    loading = false;
    error: string | null = null;
    proofFile: File | null = null;
    proofPreview: string | null = null;
    uploading = false;
    uploadError: string | null = null;
    uploadSuccess: string | null = null;
    trackingData: any[] = [];
    toastMessage: string = '';
    toastColor: string = 'success';
    showToast: boolean = false;

    constructor(private route: ActivatedRoute, public api: ApiService, private toastCtrl: ToastController) { }

    ngOnInit() {
        const orderId = this.route.snapshot.paramMap.get('id');
        if (orderId) {
            this.fetchOrder(orderId);
            this.loadTrackingData(orderId);
        }
    }

    fetchOrder(orderId: string) {
        this.loading = true;
        this.api.get(`/orders/${orderId}`).subscribe({
            next: (res: any) => {
                this.order = res.data;
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Gagal memuat detail pesanan';
                this.loading = false;
            }
        });
    }

    loadTrackingData(orderId: string) {
        this.api.get(`/orders/${orderId}/tracking`).subscribe({
            next: (res: any) => {
                this.trackingData = res.data || [];
            },
            error: () => {
                this.trackingData = [];
            }
        });
    }

    getTrackingIcon(status: string): string {
        switch (status.toLowerCase()) {
            case 'order_placed':
                return 'cart-outline';
            case 'processing':
                return 'construct-outline';
            case 'shipped':
                return 'car-outline';
            case 'delivered':
                return 'checkmark-circle-outline';
            case 'cancelled':
                return 'close-circle-outline';
            default:
                return 'information-circle-outline';
        }
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.proofFile = file;
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.proofPreview = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    uploadProof() {
        if (!this.proofFile || !this.order?.payment?.id) return;
        this.uploading = true;
        this.uploadError = null;
        this.uploadSuccess = null;
        this.api.uploadProofOfPayment(this.order.payment.id, this.proofFile).subscribe({
            next: (res: any) => {
                this.uploading = false;
                this.uploadSuccess = 'Bukti transfer berhasil diupload!';
                this.proofFile = null;
                this.proofPreview = null;
                // Refresh order detail agar bukti tampil
                this.fetchOrder(this.order.id);
            },
            error: (err) => {
                this.uploading = false;
                this.uploadError = err.error?.message || 'Gagal upload bukti transfer';
            }
        });
    }

    async presentToast(message: string, color: string = 'success') {
        const toast = await this.toastCtrl.create({
            message,
            duration: 2200,
            color,
            position: 'bottom',
            cssClass: 'custom-toast',
        });
        toast.present();
    }

    konfirmasiDiterima() {
        if (!this.order || this.order.status !== 'Dikirim') return;
        this.api.updateOrderStatusCustomer(this.order.id, 'Diterima').subscribe({
            next: () => {
                this.presentToast('Terima kasih! Pesanan telah dikonfirmasi diterima.', 'success');
                this.fetchOrder(this.order.id);
            },
            error: () => {
                this.presentToast('Gagal mengkonfirmasi pesanan.', 'danger');
            }
        });
    }
} 