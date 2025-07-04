import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-category',
    templateUrl: './category.page.html',
    styleUrls: ['./category.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule],
    providers: [DecimalPipe]
})
export class CategoryPage implements OnInit {
    categoryName: string = '';
    products: any[] = [];
    categories: any[] = [];
    loading = true;

    constructor(private route: ActivatedRoute, private apiService: ApiService, private router: Router) { }

    ngOnInit() {
        this.loadCategories();
        this.route.paramMap.subscribe(params => {
            this.categoryName = params.get('name') || '';
            this.fetchProducts();
        });
    }

    loadCategories() {
        this.loading = true;
        this.apiService.getCategories().subscribe({
            next: (res: any) => {
                this.categories = res.data ? res.data : res;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    fetchProducts() {
        this.loading = true;
        this.apiService.getProductsByCategory(this.categoryName).subscribe({
            next: (data) => {
                this.products = data || [];
                this.loading = false;
            },
            error: (err) => {
                this.loading = false;
                console.error('Gagal mengambil produk kategori:', err);
            }
        });
    }

    onCategoryFilterClick(cat: any) {
        this.categoryName = cat.name;
        this.fetchProducts();
    }

    getImageUrl(img: string) {
        return this.apiService.getImageUrl(img);
    }

    goToCategory(cat: any) {
        this.router.navigate(['/products'], { queryParams: { category: cat.slug || cat.name } });
    }
} 