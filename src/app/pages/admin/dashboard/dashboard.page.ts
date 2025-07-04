import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { SidebarComponent } from '../sidebar.component';
import { HeaderComponent } from '../header.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, SidebarComponent, HeaderComponent]
})
export class DashboardPage implements OnInit {
  dashboardData: any = {};
  recentOrders: any[] = [];
  loading: boolean = true;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.api.getAdminDashboard().subscribe({
      next: (res) => {
        this.dashboardData = {
          total_orders: res.total_orders || 0,
          pending_orders: res.pending_orders || 0,
          processing_orders: res.processing_orders || 0,
          delivered_orders: res.delivered_orders || 0,
          total_revenue: res.total_revenue || 0,
          total_orders_growth: res.total_orders_growth ?? null,
          pending_orders_growth: res.pending_orders_growth ?? null,
          processing_orders_growth: res.processing_orders_growth ?? null,
          delivered_orders_growth: res.delivered_orders_growth ?? null
        };
        this.recentOrders = res.recent_orders || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.loading = false;
      }
    });
  }

  getProductNames(order: any): string {
    if (order.order_items && order.order_items.length > 0) {
      const productNames = order.order_items.map((item: any) =>
        item.product?.name || 'Unknown Product'
      );
      return productNames.join(', ');
    }
    return 'No products';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Menunggu Pembayaran':
        return 'status-pending';
      case 'Diproses':
        return 'status-processing';
      case 'Dikirim':
        return 'status-shipped';
      case 'Diterima':
        return 'status-delivered';
      case 'Dibatalkan':
        return 'status-canceled';
      default:
        return 'status-pending';
    }
  }
}
