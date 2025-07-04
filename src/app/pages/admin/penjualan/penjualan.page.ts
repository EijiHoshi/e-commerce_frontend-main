import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { formatDate } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar.component';
import { HeaderComponent } from '../header.component';

interface Penjualan {
  id: number;
  user: { name: string };
  created_at: string;
  total_amount: number;
  status: string;
  payment?: { proof_of_payment?: string };
}

@Component({
  selector: 'app-penjualan',
  templateUrl: './penjualan.page.html',
  styleUrls: ['./penjualan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, SidebarComponent, HeaderComponent]
})
export class PenjualanPage implements OnInit {
  penjualanList: Penjualan[] = [];
  filteredPenjualan: Penjualan[] = [];
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

  showConfirmAlert = false;
  showCancelAlert = false;
  selectedOrder: Penjualan | null = null;

  constructor(public api: ApiService) { }

  ngOnInit() {
    this.loadStatistik();
    this.loadPenjualan();
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

  loadPenjualan() {
    this.isLoading = true;
    this.api.getAdminOrders().subscribe({
      next: (res) => {
        console.log('Admin Orders Response:', res);
        this.penjualanList = (res.data || []).map((o: any) => ({
          id: o.id,
          user: o.user || { name: '-' },
          created_at: o.created_at,
          total_amount: o.total_amount,
          status: o.status,
          payment: o.payment || {}
        }));
        console.log('Processed penjualanList:', this.penjualanList);
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading penjualan:', err);
        this.errorMsg = 'Gagal memuat data penjualan';
        this.isLoading = false;
      }
    });
  }

  applyFilter() {
    if (!this.statusFilter) {
      this.filteredPenjualan = this.penjualanList;
    } else {
      this.filteredPenjualan = this.penjualanList.filter(p => p.status === this.statusFilter);
    }
  }

  onStatusChange() {
    this.applyFilter();
  }

  formatTanggal(date: string) {
    return formatDate(date, 'dd/MM/yyyy HH:mm', 'id-ID');
  }

  onKonfirmasi(order: Penjualan) {
    this.selectedOrder = order;
    this.showConfirmAlert = true;
  }

  onBatalkan(order: Penjualan) {
    this.selectedOrder = order;
    this.showCancelAlert = true;
  }

  confirmOrder() {
    if (!this.selectedOrder) return;
    this.api.post(`/admin/orders/${this.selectedOrder.id}/confirm`, {}).subscribe({
      next: () => {
        this.loadPenjualan();
        this.showConfirmAlert = false;
        this.selectedOrder = null;
      },
      error: () => {
        alert('Gagal konfirmasi order');
        this.showConfirmAlert = false;
        this.selectedOrder = null;
      }
    });
  }

  cancelOrder() {
    if (!this.selectedOrder) return;
    this.api.post(`/admin/orders/${this.selectedOrder.id}/cancel`, {}).subscribe({
      next: () => {
        this.loadPenjualan();
        this.showCancelAlert = false;
        this.selectedOrder = null;
      },
      error: () => {
        alert('Gagal membatalkan order');
        this.showCancelAlert = false;
        this.selectedOrder = null;
      }
    });
  }

  getStatus(p: Penjualan): string {
    if (p.payment?.proof_of_payment && p.status === 'Menunggu Pembayaran') {
      return 'Menunggu Konfirmasi';
    }
    return p.status;
  }

  get confirmButtons() {
    return [
      { text: 'Batal', role: 'cancel', handler: () => { this.showConfirmAlert = false; } },
      { text: 'Ya', handler: () => { this.confirmOrder(); } }
    ];
  }
  get cancelButtons() {
    return [
      { text: 'Batal', role: 'cancel', handler: () => { this.showCancelAlert = false; } },
      { text: 'Ya', handler: () => { this.cancelOrder(); } }
    ];
  }

  onKirim(order: Penjualan) {
    if (!order) return;
    if (!confirm('Yakin ingin mengubah status pesanan menjadi Dikirim?')) return;
    this.api.updateOrderStatus(order.id, 'Dikirim').subscribe({
      next: () => {
        this.loadPenjualan();
        alert('Status pesanan berhasil diubah menjadi Dikirim.');
      },
      error: () => {
        alert('Gagal mengubah status pesanan.');
      }
    });
  }
}
