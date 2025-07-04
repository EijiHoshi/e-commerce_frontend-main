import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { formatDate } from '@angular/common';
import { SidebarComponent } from '../sidebar.component';
import { HeaderComponent } from '../header.component';

interface LaporanPenjualan {
  id: number;
  user: { name: string };
  created_at: string;
  total_amount: number;
  status: string;
}

@Component({
  selector: 'app-laporan',
  templateUrl: './laporan.page.html',
  styleUrls: ['./laporan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, SidebarComponent, HeaderComponent]
})
export class LaporanPage implements OnInit {
  laporanList: LaporanPenjualan[] = [];
  filteredLaporan: LaporanPenjualan[] = [];
  isLoading = false;
  errorMsg = '';

  // Statistik
  totalOrders = 0;
  completedOrders = 0;
  pendingOrders = 0;
  cancelledOrders = 0;
  totalRevenue = 0;

  // Filter
  statusFilter: string = '';
  statusOptions = [
    { label: 'Semua', value: '' },
    { label: 'Menunggu Pembayaran', value: 'Menunggu Pembayaran' },
    { label: 'Diproses', value: 'Diproses' },
    { label: 'Dikirim', value: 'Dikirim' },
    { label: 'Diterima', value: 'Diterima' },
    { label: 'Dibatalkan', value: 'Dibatalkan' },
  ];

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loadStatistik();
    this.loadLaporan();
  }

  loadStatistik() {
    this.api.getAdminDashboard().subscribe({
      next: (res) => {
        this.totalOrders = res.total_orders || 0;
        this.completedOrders = res.delivered_orders || 0;
        this.pendingOrders = res.pending_orders || 0;
        this.cancelledOrders = res.cancelled_orders || 0;
        this.totalRevenue = res.total_revenue || 0;
      },
      error: () => { }
    });
  }

  loadLaporan() {
    this.isLoading = true;
    this.api.getAdminOrders().subscribe({
      next: (res) => {
        this.laporanList = (res.data || []).map((o: any) => ({
          id: o.id,
          user: o.user || { name: '-' },
          created_at: o.created_at,
          total_amount: o.total_amount,
          status: o.status
        }));
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = 'Gagal memuat data laporan penjualan';
        this.isLoading = false;
      }
    });
  }

  applyFilter() {
    if (!this.statusFilter) {
      this.filteredLaporan = this.laporanList;
    } else {
      this.filteredLaporan = this.laporanList.filter(p => p.status === this.statusFilter);
    }
  }

  onStatusChange() {
    this.applyFilter();
  }

  formatTanggal(date: string) {
    return formatDate(date, 'dd/MM/yyyy HH:mm', 'id-ID');
  }
}
