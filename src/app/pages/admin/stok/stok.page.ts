import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { SidebarComponent } from '../sidebar.component';
import { HeaderComponent } from '../header.component';

@Component({
  selector: 'app-stok',
  templateUrl: './stok.page.html',
  styleUrls: ['./stok.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, SidebarComponent, HeaderComponent]
})
export class StokPage implements OnInit {
  produkList: any[] = [];
  filteredProdukList: any[] = [];
  isLoading = false;
  errorMsg = '';

  // Statistik
  totalStok = 0;
  stokMenipis = 0;
  stokHabis = 0;
  totalNilaiStok = 0;

  // Filter
  filterStok = 'all'; // all, low, out

  searchText: string = '';
  filterKategori: string = '';
  sortBy: string = 'name';
  kategoriList: any[] = [];

  stockType: 'in' | 'out' = 'in';

  page: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  paginatedProdukList: any[] = [];

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loadStok();
  }

  loadStok() {
    this.isLoading = true;
    const params: any = {
      page: this.page,
      per_page: this.pageSize,
      search: this.searchText || undefined,
      category_id: this.filterKategori && this.filterKategori !== 'all' ? this.filterKategori : undefined,
      stock_status: this.filterStok && this.filterStok !== 'all' ? this.filterStok : undefined,
      sort_by: this.sortBy || undefined
    };
    this.api.getAdminProducts(params).subscribe({
      next: (res) => {
        this.produkList = (res.products && res.products.data) ? res.products.data : [];
        this.kategoriList = res.categories || [];
        if (res.statistics) {
          this.totalStok = res.statistics.total_products || 0;
          this.stokMenipis = res.statistics.low_stock_products || 0;
          this.stokHabis = res.statistics.out_of_stock_products || 0;
          this.totalNilaiStok = this.produkList.reduce((total, p) => total + (p.stock * p.price), 0);
        } else {
          this.calculateStats();
        }
        // Update paginasi dari backend
        this.totalPages = res.products?.last_page || 1;
        this.page = res.products?.current_page || 1;
        this.paginatedProdukList = this.produkList;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = 'Gagal memuat data stok';
        this.isLoading = false;
      }
    });
  }

  calculateStats() {
    this.totalStok = this.produkList.length;
    this.stokMenipis = this.produkList.filter(p => p.stock <= (p.minimum_stock || 5) && p.stock > 0).length;
    this.stokHabis = this.produkList.filter(p => p.stock === 0).length;
    this.totalNilaiStok = this.produkList.reduce((total, p) => total + (p.stock * p.price), 0);
  }

  applyFilter() {
    let filtered = this.produkList;

    // Filter berdasarkan pencarian
    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(p =>
        (p.name && p.name.toLowerCase().includes(search)) ||
        (p.sku && p.sku.toLowerCase().includes(search))
      );
    }

    // Filter berdasarkan kategori
    if (this.filterKategori && this.filterKategori !== 'all') {
      filtered = filtered.filter(p => p.category_id == this.filterKategori);
    }

    // Filter berdasarkan status stok
    if (this.filterStok && this.filterStok !== 'all') {
      if (this.filterStok === 'low') {
        filtered = filtered.filter(p => p.stock <= (p.minimum_stock || 5) && p.stock > 0);
      } else if (this.filterStok === 'out') {
        filtered = filtered.filter(p => p.stock === 0);
      }
    }

    // Sorting
    if (this.sortBy) {
      filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'stock':
            return a.stock - b.stock;
          case 'price':
            return b.price - a.price;
          default:
            return 0;
        }
      });
    }

    this.filteredProdukList = filtered;
    this.totalPages = Math.ceil(this.filteredProdukList.length / this.pageSize) || 1;
    this.page = Math.min(this.page, this.totalPages); // jaga agar page tidak melebihi total
    this.updatePaginatedProdukList();
  }

  updatePaginatedProdukList() {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedProdukList = this.filteredProdukList.slice(start, end);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.page = page;
    this.loadStok();
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadStok();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadStok();
    }
  }

  onSearchChange() {
    this.page = 1;
    this.loadStok();
  }

  onFilterKategoriChange() {
    this.page = 1;
    this.loadStok();
  }

  onFilterStokChange() {
    this.page = 1;
    this.loadStok();
  }

  onSortChange() {
    this.page = 1;
    this.loadStok();
  }

  getStockStatus(stock: number, minStock: number = 5): string {
    if (stock === 0) return 'habis';
    if (stock <= minStock) return 'menipis';
    return 'tersedia';
  }

  setStockType(type: 'in' | 'out') {
    this.stockType = type;
    // TODO: filter data stok masuk/keluar jika diperlukan
  }
}
