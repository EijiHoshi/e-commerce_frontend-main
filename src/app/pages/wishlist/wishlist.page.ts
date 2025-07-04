import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-wishlist',
    templateUrl: './wishlist.page.html',
    styleUrls: ['./wishlist.page.scss'],
    imports: [IonicModule, CommonModule, FormsModule],
})
export class WishlistPage implements OnInit {
    wishlistItems: any[] = [];
    loading = false;
    error = '';

    constructor(
        public api: ApiService,
        private auth: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadWishlist();
    }

    async loadWishlist() {
        this.loading = true;
        this.error = '';

        try {
            const response = await this.api.get('/wishlist').toPromise();
            this.wishlistItems = response.data || [];
        } catch (err: any) {
            this.error = err.error?.message || 'Gagal memuat wishlist';
        } finally {
            this.loading = false;
        }
    }

    async removeFromWishlist(wishlistId: number) {
        try {
            await this.api.delete(`/wishlist/${wishlistId}`).toPromise();
            this.wishlistItems = this.wishlistItems.filter(item => item.id !== wishlistId);
        } catch (err: any) {
            this.error = err.error?.message || 'Gagal menghapus dari wishlist';
        }
    }

    async addToCart(product: any) {
        try {
            await this.api.post('/cart', {
                product_id: product.id,
                quantity: 1
            }).toPromise();

            // Remove from wishlist after adding to cart
            const wishlistItem = this.wishlistItems.find(item => item.product.id === product.id);
            if (wishlistItem) {
                await this.removeFromWishlist(wishlistItem.id);
            }
        } catch (err: any) {
            this.error = err.error?.message || 'Gagal menambahkan ke keranjang';
        }
    }

    goToHome() {
        this.router.navigate(['/home']);
    }
} 