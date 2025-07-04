import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { SidebarComponent } from '../sidebar.component';
import { HeaderComponent } from '../header.component';

@Component({
  selector: 'app-produk',
  templateUrl: './produk.page.html',
  styleUrls: ['./produk.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, SidebarComponent, HeaderComponent]
})
export class ProdukPage implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  statistics: any = {};
  loading: boolean = true;

  // Search and Filter
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedStatus: string = '';
  sortBy: string = 'created_at';

  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  perPage: number = 10;

  // Selection
  selectedProducts: number[] = [];
  isAllSelected: boolean = false;

  // Debounce for search
  private searchTimeout: any;

  constructor(
    private api: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
    console.log('ProdukPage: ngOnInit - checking auth status');
    console.log('ProdukPage: Token exists:', !!localStorage.getItem('token'));
    console.log('ProdukPage: User role:', localStorage.getItem('user_role'));

    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.loading = true;

    const params: any = {
      page: this.currentPage,
      per_page: this.perPage,
      sort_by: this.sortBy,
      sort_order: 'desc'
    };

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    if (this.selectedCategory) {
      params.category_id = this.selectedCategory;
    }

    if (this.selectedStatus) {
      params.status = this.selectedStatus;
    }

    this.api.getAdminProducts(params).subscribe({
      next: (response) => {
        this.products = response.products.data || [];
        this.statistics = response.statistics || {};
        this.categories = response.categories || [];

        // Update pagination
        this.totalPages = response.products.last_page || 1;
        this.currentPage = response.products.current_page || 1;

        this.loading = false;
        this.updateSelectionState();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  loadCategories() {
    this.api.getCategories().subscribe({
      next: (response) => {
        this.categories = response || [];
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  onSearchChange() {
    // Debounce search to avoid too many API calls
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadProducts();
    }, 500);
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadProducts();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  toggleSelectAll() {
    if (this.isAllSelected) {
      this.selectedProducts = [];
    } else {
      this.selectedProducts = this.products.map(product => product.id);
    }
    this.updateSelectionState();
  }

  toggleProductSelection(productId: number) {
    const index = this.selectedProducts.indexOf(productId);
    if (index > -1) {
      this.selectedProducts.splice(index, 1);
    } else {
      this.selectedProducts.push(productId);
    }
    this.updateSelectionState();
  }

  updateSelectionState() {
    this.isAllSelected = this.products.length > 0 &&
      this.selectedProducts.length === this.products.length;
  }

  bulkDelete() {
    if (this.selectedProducts.length === 0) return;

    if (confirm(`Apakah Anda yakin ingin menghapus ${this.selectedProducts.length} produk yang dipilih?`)) {
      this.api.bulkDeleteProducts(this.selectedProducts).subscribe({
        next: (response) => {
          alert(response.message);
          this.selectedProducts = [];
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error bulk deleting products:', error);
          alert('Terjadi kesalahan saat menghapus produk');
        }
      });
    }
  }

  deleteProduct(productId: number) {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      this.api.deleteProduct(productId).subscribe({
        next: (response) => {
          alert(response.message);
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          alert('Terjadi kesalahan saat menghapus produk');
        }
      });
    }
  }

  editProduct(productId: number) {
    this.router.navigate(['/admin/tambah-produk'], {
      queryParams: { edit: productId }
    });
  }

  navigateToAddProduct() {
    this.router.navigate(['/admin/tambah-produk']);
  }

  getImageUrl(path: string): string {
    return this.api.getImageUrl(path);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID').format(price);
  }

  getStatusClass(product: any): string {
    if (product.stock <= 0) {
      return 'out-of-stock';
    } else if (product.stock <= product.minimum_stock) {
      return 'low-stock';
    } else {
      return 'active';
    }
  }

  getStatusText(product: any): string {
    if (product.stock <= 0) {
      return 'Habis';
    } else if (product.stock <= product.minimum_stock) {
      return 'Stok Rendah';
    } else {
      return 'Aktif';
    }
  }
}
