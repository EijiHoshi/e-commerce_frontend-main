import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { SidebarComponent } from '../sidebar.component';
import { HeaderComponent } from '../header.component';

interface StatistikKeuangan {
    total_pendapatan: number;
    laba_bersih: number;
    margin_laba_bersih: number;
    rata_rata_per_hari: number;
    trend: number | null;
    periode: { start: string; end: string };
}

interface TransaksiKeuangan {
    id: number;
    order_id: number;
    user_id: number;
    total_amount: number;
    payment_amount: number;
    status: string;
    created_at: string;
}

@Component({
    selector: 'app-laporan-keuangan',
    templateUrl: './laporan-keuangan.page.html',
    styleUrls: ['./laporan.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, SidebarComponent, HeaderComponent]
})
export class LaporanKeuanganPage implements OnInit {
    statistik: StatistikKeuangan | null = null;
    transaksiList: TransaksiKeuangan[] = [];
    isLoading = false;
    errorMsg = '';

    constructor(private api: ApiService) { }

    ngOnInit() {
        this.loadLaporanKeuangan();
    }

    loadLaporanKeuangan() {
        this.isLoading = true;
        this.api.get('/admin/reports/finance').subscribe({
            next: (res: any) => {
                this.statistik = res.statistik || null;
                this.transaksiList = res.data || [];
                this.isLoading = false;
            },
            error: (err) => {
                this.errorMsg = 'Gagal memuat data laporan keuangan';
                this.isLoading = false;
            }
        });
    }

    formatRupiah(value: number) {
        return 'Rp ' + (value || 0).toLocaleString('id-ID');
    }
} 