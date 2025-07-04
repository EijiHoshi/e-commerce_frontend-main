import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar.component';
import { HeaderComponent } from '../header.component';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-laporan-pelanggan',
    standalone: true,
    imports: [CommonModule, IonicModule, SidebarComponent, HeaderComponent],
    templateUrl: './laporan-pelanggan.page.html',
    styleUrls: ['./laporan-pelanggan.page.scss']
})
export class LaporanPelangganPage implements OnInit {
    statistik: any[] = [];
    pelangganList: any[] = [];
    totalPages = 1;
    // filterNama: string = '';

    constructor(private api: ApiService) { }

    ngOnInit() {
        this.getStatistik();
        this.getPelanggan();
    }

    getStatistik() {
        this.api.get('/reports/customers').subscribe((res: any) => {
            this.statistik = [
                { label: 'Total', value: res.statistik?.total ?? 0, icon: 'fa-users', iconClass: 'bg-primary' },
                { label: 'Aktif', value: res.statistik?.active ?? 0, icon: 'fa-user-check', iconClass: 'bg-success' },
                { label: 'Baru', value: res.statistik?.new ?? 0, icon: 'fa-user-plus', iconClass: 'bg-info' }
            ];
        });
    }

    getPelanggan() {
        this.api.get('/reports/customers').subscribe((res: any) => {
            this.pelangganList = Array.isArray(res.data) ? res.data : [];
            this.totalPages = res.total_pages || 1;
        });
    }
} 