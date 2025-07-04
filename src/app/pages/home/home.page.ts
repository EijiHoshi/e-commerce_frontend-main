import { Component, OnInit, OnDestroy } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HomeService } from '../../services/home.service';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, FormsModule],
    providers: [DecimalPipe],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePage implements OnInit, OnDestroy {
    loading = true;
    userName: string = '';
    cartCount: number = 0;
    notifCount: number = 0;
    searchQuery: string = '';
    searchResults: any[] = [];
    searching: boolean = false;
    bannerActiveIndex: number = 0;
    bannerInterval: any;

    // Slider Options
    slideOpts = {
        initialSlide: 0,
        speed: 400,
        autoplay: { delay: 3500, disableOnInteraction: false },
        loop: true
    };

    productSlideOpts = {
        slidesPerView: 2.2,
        spaceBetween: 10,
        speed: 400
    };

    banners: any[] = [];
    categories: any[] = [];
    popularProducts: any[] = [];
    newArrivals: any[] = [];
    selectedCategory: string = '';
    allProducts: any[] = [];
    filteredProducts: any[] = [];

    constructor(
        private decimalPipe: DecimalPipe,
        private router: Router,
        private homeService: HomeService,
        private apiService: ApiService,
        private toastController: ToastController
    ) { }

    ngOnInit() {
        // Ambil produk (semua kategori)
        this.homeService.getProducts().subscribe((products) => {
            this.allProducts = products;
            this.filteredProducts = [...this.allProducts];
            this.loading = false;
        }, (err) => {
            this.loading = false;
            console.error('Gagal mengambil data produk:', err);
        });

        // Ambil banner & kategori dari /homepage
        this.homeService.getHomepage().subscribe({
            next: (data) => {
                this.banners = data.banners || [];
                this.categories = data.categories || [];
            }
        });

        this.getUserProfile();
        this.getCartCount();
        this.getNotifCount();
        this.startBannerAutoSlide();
    }

    startBannerAutoSlide() {
        if (this.bannerInterval) clearInterval(this.bannerInterval);
        this.bannerInterval = setInterval(() => {
            if (this.banners && this.banners.length > 0) {
                this.bannerActiveIndex = (this.bannerActiveIndex + 1) % this.banners.length;
            }
        }, 3000);
    }

    setBannerIndex(i: number) {
        this.bannerActiveIndex = i;
        this.startBannerAutoSlide();
    }

    ngOnDestroy() {
        if (this.bannerInterval) clearInterval(this.bannerInterval);
    }

    getUserProfile() {
        // Asumsi endpoint: /user/profile
        this.apiService.http.get<any>(`${this.apiService['apiUrl']}/user/profile`, { headers: this.apiService.getHeaders() })
            .subscribe({
                next: (res) => {
                    this.userName = res?.name || '';
                },
                error: () => { this.userName = ''; }
            });
    }

    getCartCount() {
        this.apiService.getCart().subscribe({
            next: (res) => {
                this.cartCount = Array.isArray(res?.items) ? res.items.length : (res?.cart?.length || 0);
            },
            error: () => { this.cartCount = 0; }
        });
    }

    getNotifCount() {
        // Asumsi endpoint: /notifications
        this.apiService.http.get<any>(`${this.apiService['apiUrl']}/notifications`, { headers: this.apiService.getHeaders() })
            .subscribe({
                next: (res) => {
                    this.notifCount = Array.isArray(res) ? res.filter((n: any) => n.status === 'unread').length : 0;
                },
                error: () => { this.notifCount = 0; }
            });
    }

    formatPrice(price: number): string {
        return this.decimalPipe.transform(price, '1.0-0') || '0';
    }

    onCategoryClick(category: any) {
        this.selectedCategory = category.name;
        if (!category.name || category.name.toLowerCase() === 'semua') {
            this.filteredProducts = [...this.allProducts];
            return;
        }
        const slug = (category.slug || category.name)?.toLowerCase();
        this.filteredProducts = this.allProducts.filter(
            p => p.category && p.category.slug && p.category.slug.toLowerCase() === slug
        );
    }

    goToProductDetail(product: any) {
        this.router.navigate(['/product', product.id]);
    }

    getImageUrl(path: string): string {
        return this.apiService.getImageUrl(path);
    }

    getCategoryIcon(slug: string): string {
        switch (slug) {
            case 'elektronik':
                return 'phone-portrait-outline';
            case 'fashion':
                return 'shirt-outline';
            case 'kesehatan':
                return 'medkit-outline';
            case 'rumah-tangga':
                return 'home-outline';
            default:
                return 'pricetag-outline';
        }
    }

    onSearchChange(event: any) {
        const query = typeof event === 'string' ? event : (event.detail?.value || this.searchQuery);
        this.searchQuery = query;
        if (!query || query.length < 2) {
            this.filteredProducts = [...this.allProducts];
            return;
        }
        const q = query.toLowerCase();
        this.filteredProducts = this.allProducts.filter(p =>
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.description && p.description.toLowerCase().includes(q))
        );
    }

    goToCart() {
        this.router.navigate(['/cart']);
    }

    goToNotifications() {
        this.router.navigate(['/notifications']);
    }

    goToWishlist() {
        this.router.navigate(['/wishlist']);
    }

    onBannerSlideChange(event: any) {
        this.bannerActiveIndex = event?.realIndex || 0;
    }

    onBannerClick(banner: any) {
        if (banner.link) {
            if (banner.link.startsWith('/')) {
                this.router.navigate([banner.link]);
            } else {
                window.open(banner.link, '_blank');
            }
        }
    }

    toggleWishlist(product: any, event: Event) {
        event.stopPropagation();
        if (product.in_wishlist) {
            // Optional: implementasi hapus dari wishlist jika ada endpoint
        } else {
            this.apiService.addToWishlist(product.id).subscribe({
                next: () => { product.in_wishlist = true; },
                error: () => { }
            });
        }
    }

    async addToCart(product: any, event: Event) {
        event.stopPropagation();
        try {
            await this.apiService.addToCart(product.id, 1).toPromise();
            this.getCartCount();
            const toast = await this.toastController.create({
                message: 'Berhasil menambah ke keranjang!',
                duration: 1500,
                color: 'success',
                position: 'top'
            });
            toast.present();
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

    goToHome() {
        this.router.navigate(['/home']);
    }

    goToCategory() {
        this.router.navigate(['/category']);
    }

    goToProfile() {
        this.router.navigate(['/profile']);
    }

    get recommendedProducts() {
        return this.filteredProducts;
    }

    goToChat() {
        this.router.navigate(['/chat']);
    }
} 