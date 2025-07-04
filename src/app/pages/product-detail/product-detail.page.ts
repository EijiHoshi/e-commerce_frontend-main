import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-product-detail',
    templateUrl: './product-detail.page.html',
    styleUrls: ['./product-detail.page.scss'],
    standalone: true,
    imports: [
        IonicModule,
        CommonModule,
        FormsModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProductDetailPage implements OnInit {
    product: any;
    qty: number = 1;
    loading = true;
    productId: string = '';
    selectedImage: string | null = null;
    sizes: string[] = ['S', 'M', 'L', 'XL'];
    selectedSize: string = 'S';
    productImages: string[] = [];
    selectedImageIndex = 0;
    reviews: any[] = [];
    canAddReview = false;
    isInWishlist = false;

    constructor(
        private route: ActivatedRoute,
        private apiService: ApiService,
        private toastController: ToastController,
        private router: Router,
        private alertController: AlertController,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.loadProduct();
        this.loadReviews();
        this.checkWishlistStatus();
        this.selectedSize = this.sizes[0];
        this.selectedImageIndex = 0;
    }

    loadProduct() {
        this.loading = true;
        this.productId = this.route.snapshot.paramMap.get('id') || '';
        this.apiService.getProduct(Number(this.productId)).subscribe({
            next: (res: any) => {
                const data = res.data ? res.data : res;
                this.product = {
                    ...data,
                    is_new: this.isNew(data),
                    discount_price: data.discount_price || null,
                    category: data.category || null,
                    rating: data.rating || null,
                };
                this.productImages = this.product?.images && this.product.images.length > 0
                    ? this.product.images
                    : (this.product?.image ? [this.product.image] : []);
                this.selectedImageIndex = 0;
                this.qty = 1;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    isNew(product: any): boolean {
        if (!product.created_at) return false;
        const created = new Date(product.created_at);
        const now = new Date();
        const diff = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
        return diff < 30; // produk baru < 30 hari
    }

    getImageUrl(img: string) {
        return this.apiService.getImageUrl(img);
    }

    async addToCart() {
        if (this.qty < 1) this.qty = 1;
        try {
            await this.apiService.addToCart(Number(this.productId), this.qty).toPromise();
            const toast = await this.toastController.create({
                message: 'Berhasil menambah ke keranjang!',
                duration: 1500,
                color: 'success',
                position: 'top'
            });
            toast.present();
            // TODO: update badge cart jika ada
        } catch (err) {
            const toast = await this.toastController.create({
                message: 'Gagal menambah ke keranjang',
                duration: 1500,
                color: 'danger',
                position: 'top'
            });
            toast.present();
        }
    }

    checkWishlistStatus() {
        this.apiService.get('/wishlist').subscribe({
            next: (res: any) => {
                const wishlistItems = res.data || [];
                this.isInWishlist = wishlistItems.some((item: any) => item.product_id === Number(this.productId));
            },
            error: () => {
                this.isInWishlist = false;
            }
        });
    }

    async toggleWishlist() {
        if (!this.authService.isAuthenticated()) {
            const toast = await this.toastController.create({
                message: 'Silakan login terlebih dahulu',
                duration: 2000,
                color: 'warning'
            });
            toast.present();
            return;
        }

        try {
            if (this.isInWishlist) {
                // Remove from wishlist
                const wishlistItem = await this.apiService.get('/wishlist').toPromise();
                const items = wishlistItem.data || [];
                const item = items.find((i: any) => i.product_id === Number(this.productId));
                if (item) {
                    await this.apiService.delete(`/wishlist/${item.id}`).toPromise();
                }
                this.isInWishlist = false;
            } else {
                // Add to wishlist
                await this.apiService.post('/wishlist', {
                    product_id: Number(this.productId)
                }).toPromise();
                this.isInWishlist = true;
            }
        } catch (err: any) {
            const toast = await this.toastController.create({
                message: err.error?.message || 'Gagal mengubah wishlist',
                duration: 2000,
                color: 'danger'
            });
            toast.present();
        }
    }

    selectImage(idx: number) {
        this.selectedImageIndex = idx;
    }

    onSlideChanged(event: any) {
        this.selectedImageIndex = event?.realIndex || 0;
    }

    selectSize(size: string) {
        this.selectedSize = size;
    }

    goBack() {
        window.history.back();
    }

    async buyNow() {
        if (this.qty < 1) this.qty = 1;
        try {
            await this.apiService.addToCart(Number(this.productId), this.qty).toPromise();
            this.router.navigate(['/checkout']);
        } catch (err) {
            const toast = await this.toastController.create({
                message: 'Gagal menambah ke keranjang',
                duration: 1500,
                color: 'danger',
                position: 'top'
            });
            toast.present();
        }
    }

    loadReviews() {
        this.apiService.get(`/products/${this.productId}/reviews`).subscribe({
            next: (res: any) => {
                this.reviews = res.data || [];
                this.checkCanAddReview();
            },
            error: () => {
                this.reviews = [];
            }
        });
    }

    checkCanAddReview() {
        // Hanya boleh review jika user sudah pernah membeli produk ini dan status ordernya sudah 'Diterima'
        if (!this.authService.isAuthenticated()) {
            this.canAddReview = false;
            return;
        }
        this.apiService.get('/orders').subscribe({
            next: (res: any) => {
                const orders = res.data || [];
                // Cari order yang statusnya 'Diterima' dan mengandung produk ini
                const hasCompletedOrder = orders.some((order: any) => {
                    if (order.status !== 'Diterima') return false;
                    if (!order.items) return false;
                    return order.items.some((item: any) => item.product_id === Number(this.productId));
                });
                // Pastikan user belum pernah review produk ini
                const alreadyReviewed = this.reviews.some(r => r.user_id === this.authService.getUserId());
                this.canAddReview = hasCompletedOrder && !alreadyReviewed;
            },
            error: () => {
                this.canAddReview = false;
            }
        });
    }

    async showAddReviewModal() {
        const alert = await this.alertController.create({
            header: 'Tambah Review',
            inputs: [
                {
                    name: 'rating',
                    type: 'number',
                    min: 1,
                    max: 5,
                    placeholder: 'Rating (1-5)',
                    value: 5
                },
                {
                    name: 'comment',
                    type: 'textarea',
                    placeholder: 'Tulis review Anda...',
                    attributes: {
                        maxlength: 500
                    }
                }
            ],
            buttons: [
                {
                    text: 'Batal',
                    role: 'cancel'
                },
                {
                    text: 'Kirim',
                    handler: (data) => {
                        this.submitReview(data.rating, data.comment);
                    }
                }
            ]
        });

        await alert.present();
    }

    async submitReview(rating: number, comment: string) {
        if (!rating || rating < 1 || rating > 5) {
            const toast = await this.toastController.create({
                message: 'Rating harus antara 1-5',
                duration: 2000,
                color: 'danger'
            });
            toast.present();
            return;
        }

        if (!comment || comment.trim().length < 10) {
            const toast = await this.toastController.create({
                message: 'Review minimal 10 karakter',
                duration: 2000,
                color: 'danger'
            });
            toast.present();
            return;
        }

        try {
            await this.apiService.post(`/products/${this.productId}/reviews`, {
                rating: rating,
                comment: comment.trim()
            }).toPromise();

            const toast = await this.toastController.create({
                message: 'Review berhasil ditambahkan!',
                duration: 2000,
                color: 'success'
            });
            toast.present();

            this.loadReviews();
        } catch (err: any) {
            const toast = await this.toastController.create({
                message: err.error?.message || 'Gagal menambahkan review',
                duration: 2000,
                color: 'danger'
            });
            toast.present();
        }
    }
} 