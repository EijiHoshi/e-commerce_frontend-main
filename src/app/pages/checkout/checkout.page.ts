import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

declare var window: any;

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule],
    templateUrl: './checkout.page.html',
    styleUrls: ['./checkout.page.scss']
})
export class CheckoutPage implements OnInit {
    cartItems: any[] = [];
    addresses: any[] = [];
    paymentMethods: any[] = [];
    selectedAddress: any = null;
    selectedPayment: any = null;
    loading = true;
    total = 0;
    address: any = null;
    paymentMethod: any = null;
    promoCode: string = '';
    subtotal: number = 0;
    tax: number = 0;
    showAddressModal = false;
    showAddAddressForm = false;
    newAddress: any = {
        name: '', phone: '', province: '', city: '', district: '', postal_code: '', street_address: '', detail: ''
    };

    constructor(public apiService: ApiService, private toastController: ToastController, private router: Router) { }

    ngOnInit() {
        this.fetchCart();
        this.fetchAddresses();
        this.fetchPaymentMethods();
        this.address = this.selectedAddress;
        this.paymentMethod = this.selectedPayment;
    }

    fetchCart() {
        this.apiService.getCart().subscribe({
            next: (res) => {
                this.cartItems = Array.isArray(res) ? res : (res.items || res.cart || []);
                this.calculateTotal();
                this.loading = false;
            },
            error: () => {
                this.cartItems = [];
                this.total = 0;
                this.loading = false;
            }
        });
    }

    fetchAddresses() {
        this.apiService.getAddresses().subscribe({
            next: (res) => {
                this.addresses = res.addresses || res.data || res || [];
            },
            error: () => {
                this.addresses = [];
            }
        });
    }

    fetchPaymentMethods() {
        this.apiService.getPaymentMethods().subscribe({
            next: (res) => {
                console.log('Payment methods response:', res);
                this.paymentMethods = Array.isArray(res) ? res : (res.payment_methods || res.data || []);
                console.log('Payment methods parsed:', this.paymentMethods);
            },
            error: () => {
                this.paymentMethods = [];
            }
        });
    }

    calculateTotal() {
        this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1), 0);
        this.tax = Math.round(this.subtotal * 0.1);
        this.total = this.subtotal + this.tax;
    }

    onCheckout() {
        // TODO: implementasi createOrder
    }

    goBack() {
        window.history.back();
    }

    editAddress() {
        this.showAddressModal = true;
        this.showAddAddressForm = false;
        // Default selected address ke address aktif
        if (this.address) {
            this.selectedAddress = this.address;
        } else if (this.addresses.length > 0) {
            this.selectedAddress = this.addresses[0];
        }
    }

    closeAddressModal() {
        this.showAddressModal = false;
        this.showAddAddressForm = false;
        this.newAddress = { name: '', phone: '', province: '', city: '', district: '', postal_code: '', street_address: '', detail: '' };
    }

    selectAddress(addr: any) {
        this.selectedAddress = addr;
    }

    applySelectedAddress() {
        if (this.selectedAddress) {
            this.address = this.selectedAddress;
            this.closeAddressModal();
        }
    }

    addAddress() {
        this.apiService.post('/addresses', this.newAddress).subscribe({
            next: (res) => {
                this.fetchAddresses();
                this.showAddAddressForm = false;
                this.newAddress = { name: '', phone: '', province: '', city: '', district: '', postal_code: '', street_address: '', detail: '' };
            },
            error: () => {
                alert('Gagal menambah alamat');
            }
        });
    }

    editCart() {
        alert('Edit cart clicked');
    }

    editDelivery() {
        this.showAddressModal = true;
        this.showAddAddressForm = false;
        // Default selected address ke address aktif
        if (this.address) {
            this.selectedAddress = this.address;
        } else if (this.addresses.length > 0) {
            this.selectedAddress = this.addresses[0];
        }
    }

    editPayment() {
        alert('Edit payment clicked');
    }

    decrementQty(item: any) {
        if (item.quantity > 1) {
            item.quantity--;
            this.calculateTotal();
        }
    }

    incrementQty(item: any) {
        item.quantity++;
        this.calculateTotal();
    }

    applyPromo() {
        alert('Promo applied: ' + this.promoCode);
    }

    async placeOrder() {
        if (!this.address?.id) {
            this.presentToast('Pilih alamat pengiriman terlebih dahulu!', 'warning');
            return;
        }
        if (!this.paymentMethod?.id) {
            this.presentToast('Pilih metode pembayaran terlebih dahulu!', 'warning');
            return;
        }
        const data = {
            address_id: this.address.id,
            payment_method_id: this.paymentMethod.id,
            type: 'cart'
        };
        this.apiService.createOrder(data).subscribe({
            next: async (res) => {
                const orderId = res.order?.id || res.data?.id;
                if (!orderId) {
                    this.presentToast('Order berhasil, tapi ID pesanan tidak ditemukan!', 'danger');
                    return;
                }
                // Cek apakah payment method gateway (misal: Midtrans)
                if (this.paymentMethod.code === 'midtrans' || this.paymentMethod.type === 'gateway') {
                    // Inisiasi pembayaran Midtrans
                    this.apiService.payWithMidtrans(orderId).subscribe({
                        next: (snapRes: any) => {
                            if (snapRes.snap_token) {
                                // Pastikan Snap JS sudah di-load
                                if (!window.snap) {
                                    const script = document.createElement('script');
                                    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
                                    script.setAttribute('data-client-key', 'YOUR_CLIENT_KEY'); // Ganti dengan client key dari .env
                                    script.onload = () => {
                                        window.snap.pay(snapRes.snap_token, {
                                            onSuccess: (result: any) => {
                                                this.presentToast('Pembayaran berhasil!', 'success');
                                                this.router.navigate(['/order-detail', orderId]);
                                            },
                                            onPending: (result: any) => {
                                                this.presentToast('Pembayaran masih pending.', 'warning');
                                                this.router.navigate(['/order-detail', orderId]);
                                            },
                                            onError: (err: any) => {
                                                this.presentToast('Pembayaran gagal.', 'danger');
                                            },
                                            onClose: () => {
                                                this.presentToast('Anda menutup popup pembayaran.', 'warning');
                                            }
                                        });
                                    };
                                    document.body.appendChild(script);
                                } else {
                                    window.snap.pay(snapRes.snap_token, {
                                        onSuccess: (result: any) => {
                                            this.presentToast('Pembayaran berhasil!', 'success');
                                            this.router.navigate(['/order-detail', orderId]);
                                        },
                                        onPending: (result: any) => {
                                            this.presentToast('Pembayaran masih pending.', 'warning');
                                            this.router.navigate(['/order-detail', orderId]);
                                        },
                                        onError: (err: any) => {
                                            this.presentToast('Pembayaran gagal.', 'danger');
                                        },
                                        onClose: () => {
                                            this.presentToast('Anda menutup popup pembayaran.', 'warning');
                                        }
                                    });
                                }
                            } else {
                                this.presentToast('Gagal mendapatkan Snap Token.', 'danger');
                            }
                        },
                        error: (err) => {
                            this.presentToast('Gagal inisiasi pembayaran Midtrans.', 'danger');
                        }
                    });
                } else {
                    // Jika manual/transfer, langsung redirect ke order detail
                    this.router.navigate(['/order-detail', orderId]);
                }
            },
            error: (err) => {
                this.presentToast('Gagal membuat pesanan! ' + (err.error?.message || ''), 'danger');
            }
        });
    }

    async presentToast(message: string, color: string = 'primary') {
        const toast = await this.toastController.create({
            message,
            duration: 2000,
            color,
            position: 'bottom',
        });
        toast.present();
    }

    async selectPaymentMethod(method: any) {
        this.paymentMethod = method;
        const toast = await this.toastController.create({
            message: 'Metode pembayaran diterapkan: ' + this.paymentMethod.name,
            duration: 1200,
            color: 'success',
            position: 'top'
        });
        toast.present();
    }

    applyPaymentMethod() {
        if (!this.paymentMethod) {
            alert('Pilih metode pembayaran terlebih dahulu!');
            return;
        }
        alert('Metode pembayaran diterapkan: ' + this.paymentMethod.name);
    }

    getPaymentIcon(code: string): string {
        switch (code) {
            case 'credit_card': return 'card-outline';
            case 'e_wallet': return 'wallet-outline';
            case 'bank_transfer': return 'business-outline';
            case 'qris': return 'qr-code-outline';
            default: return 'card-outline';
        }
    }

    getPaymentDesc(method: any): string {
        switch (method.code) {
            case 'credit_card': return 'Visa, Master Card, JCB';
            case 'e_wallet': return 'GoPay, OVO, DANA, ShoppePay';
            case 'bank_transfer': return 'BCA, Mandiri, BRI, BNI';
            case 'qris': return 'Scan QR untuk bayar';
            default: return method.desc || '';
        }
    }
} 