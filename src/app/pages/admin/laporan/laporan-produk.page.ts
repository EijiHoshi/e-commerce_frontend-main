import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { SidebarComponent } from '../sidebar.component';
import { HeaderComponent } from '../header.component';

interface LaporanProduk {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: string;
}

@Component({
    selector: 'app-laporan-produk',
    templateUrl: './laporan-produk.page.html',
    styleUrls: ['./laporan.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, SidebarComponent, HeaderComponent]
})
export class LaporanProdukPage implements OnInit {
    produkList: LaporanProduk[] = [];
    filteredProduk: LaporanProduk[] = [];
    isLoading = false;
    errorMsg = '';

    // Statistik
    totalProduk = 0;
    activeProduk = 0;
    draftProduk = 0;
    lowStockProduk = 0;

    // Filter
    statusFilter: string = '';
    kategoriFilter: string = '';
    statusOptions = [
        { label: 'Semua', value: '' },
        { label: 'Aktif', value: 'active' },
        { label: 'Draft', value: 'draft' },
    ];
    kategoriOptions: string[] = ['Semua'];

    constructor(private api: ApiService) { }

    ngOnInit() {
        this.loadLaporanProduk();
    }

    loadLaporanProduk() {
        this.isLoading = true;
        this.api.get('/reports/products').subscribe({
            next: (res: any) => {
                const statistik = res.statistik || {};
                this.totalProduk = statistik.total || 0;
                this.activeProduk = statistik.active || 0;
                this.draftProduk = statistik.draft || 0;
                this.lowStockProduk = statistik.low_stock || 0;
                this.produkList = res.data || [];
                this.kategoriOptions = ['Semua', ...Array.from(new Set(this.produkList.map(p => p.category)).values()).filter(k => k && k !== '-')];
                this.applyFilter();
                this.isLoading = false;
            },
            error: (err) => {
                this.errorMsg = 'Gagal memuat data laporan produk';
                this.isLoading = false;
            }
        });
    }

    applyFilter() {
        let data = this.produkList;
        if (this.statusFilter) {
            data = data.filter(p => p.status === this.statusFilter);
        }
        if (this.kategoriFilter && this.kategoriFilter !== 'Semua') {
            data = data.filter(p => p.category === this.kategoriFilter);
        }
        this.filteredProduk = data;
    }

    onStatusChange() {
        this.applyFilter();
    }

    onKategoriChange() {
        this.applyFilter();
    }

    formatRupiah(value: number) {
        return 'Rp ' + value.toLocaleString('id-ID');
    }
} 