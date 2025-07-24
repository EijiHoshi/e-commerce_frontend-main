import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';

interface OrderItem {
    id: number;
    product: {
        id: number;
        name: string;
        image: string;
        price: number;
    };
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    order_number: string;
    created_at: string;
    status: string;
    total_amount: number;
    order_items: OrderItem[];
}

const BASE_IMAGE_URL = 'https://efabli.site/'; // Ganti jika base URL backend berbeda

@Component({
    selector: 'app-leave-review',
    templateUrl: './leave-review.page.html',
    styleUrls: ['./leave-review.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
})
export class LeaveReviewPage implements OnInit {
    reviewForm: FormGroup;
    orderId: number | null = null;
    order: Order | null = null;
    loading: any;
    uploadedImages: string[] = [];
    maxImages = 5;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private apiService: ApiService,
        private toastController: ToastController,
        private loadingController: LoadingController,
        private alertController: AlertController
    ) {
        this.reviewForm = this.fb.group({
            overallRating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
            productRatings: this.fb.array([]),
            comment: ['', [Validators.maxLength(500)]],
            shippingRating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
            uploadedImages: [[]]
        });
    }

    ngOnInit() {
        const orderIdParam = this.route.snapshot.paramMap.get('orderId');
        this.orderId = orderIdParam ? +orderIdParam : null;

        if (this.orderId) {
            this.loadOrderDetails();
        }
    }

    async loadOrderDetails() {
        try {
            this.loading = await this.loadingController.create({
                message: 'Loading order details...'
            });
            await this.loading.present();

            const response = await this.apiService.get(`/orders/${this.orderId}`).toPromise();
            this.order = response.data;

            // Initialize product ratings form array
            this.initializeProductRatings();

        } catch (error) {
            console.error('Error loading order details:', error);
            this.showToast('Error loading order details', 'danger');
        } finally {
            if (this.loading) {
                await this.loading.dismiss();
            }
        }
    }

    initializeProductRatings() {
        if (this.order?.order_items) {
            const productRatingsArray = this.reviewForm.get('productRatings') as FormArray;
            productRatingsArray.clear();

            this.order.order_items.forEach(item => {
                productRatingsArray.push(this.fb.group({
                    productId: [item.product.id],
                    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
                }));
            });
        }
    }

    get productRatingsArray() {
        return this.reviewForm.get('productRatings') as FormArray;
    }

    setRating(formControl: string, rating: number) {
        this.reviewForm.get(formControl)?.setValue(rating);
    }

    setProductRating(index: number, rating: number) {
        const productRatingsArray = this.reviewForm.get('productRatings') as FormArray;
        productRatingsArray.at(index).get('rating')?.setValue(rating);
    }

    onFileSelected(event: any) {
        const file: File = event.target.files && event.target.files.length > 0 ? event.target.files[0] : null;
        if (!file) {
            console.warn('Tidak ada file yang dipilih!');
            return;
        }
        this.uploadImage(file);
    }

    async uploadImage(file: File) {
        if (!file) {
            console.warn('uploadImage: file null!');
            return;
        }
        const formData = new FormData();
        formData.append('image', file); // key HARUS 'image'

        try {
            const response = await this.apiService.post('/reviews/upload-image', formData).toPromise();
            this.uploadedImages.push(response.url);
            this.reviewForm.get('uploadedImages')?.setValue(this.uploadedImages);
        } catch (error) {
            console.error('Error uploading image:', error);
            this.showToast('Error uploading image', 'danger');
        }
    }

    removeImage(index: number) {
        this.uploadedImages.splice(index, 1);
        this.reviewForm.get('uploadedImages')?.setValue(this.uploadedImages);
    }

    async saveDraft() {
        // Save draft functionality - bisa disimpan ke localStorage atau backend
        const draftData = {
            orderId: this.orderId,
            formData: this.reviewForm.value,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem(`review_draft_${this.orderId}`, JSON.stringify(draftData));
        this.showToast('Draft saved successfully', 'success');
    }

    async submitReview() {
        if (this.reviewForm.invalid) {
            this.showToast('Please fill all required fields', 'warning');
            return;
        }

        try {
            this.loading = await this.loadingController.create({
                message: 'Submitting review...'
            });
            await this.loading.present();

            const formData = this.reviewForm.value;

            // Submit review for each product
            for (let i = 0; i < formData.productRatings.length; i++) {
                const productRating = formData.productRatings[i];

                const reviewData = {
                    product_id: productRating.productId,
                    rating: productRating.rating,
                    comment: formData.comment,
                    images: this.uploadedImages,
                    shipping_rating: formData.shippingRating
                };

                await this.apiService.post(`/products/${productRating.productId}/reviews`, reviewData).toPromise();
            }

            // Remove draft
            localStorage.removeItem(`review_draft_${this.orderId}`);

            this.showToast('Review submitted successfully', 'success');
            this.router.navigate(['/order-history']);

        } catch (error) {
            console.error('Error submitting review:', error);
            this.showToast('Error submitting review', 'danger');
        } finally {
            if (this.loading) {
                await this.loading.dismiss();
            }
        }
    }

    async showToast(message: string, color: string = 'primary') {
        const toast = await this.toastController.create({
            message,
            duration: 3000,
            color,
            position: 'top'
        });
        await toast.present();
    }

    goBack() {
        this.router.navigate(['/order-history']);
    }

    skip() {
        this.router.navigate(['/order-history']);
    }

    getProductImageUrl(imagePath: string): string {
        if (!imagePath) return 'assets/img/no-image.png';
        if (imagePath.startsWith('http')) return imagePath;
        return BASE_IMAGE_URL + imagePath;
    }
} 