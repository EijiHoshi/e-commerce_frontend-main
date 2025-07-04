import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  name: string = '';
  email: string = '';
  userInitials: string = '';
  produkCount: number = 0;
  isLaporan: boolean = false;
  laporanMenus = [
    { label: 'Penjualan', path: '/admin/laporan/penjualan' },
    { label: 'Produk', path: '/admin/laporan/produk' },
    { label: 'Pelanggan', path: '/admin/laporan/pelanggan' },
    { label: 'Keuangan', path: '/admin/laporan/keuangan' }
  ];

  constructor(private api: ApiService, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.api.getProfile().subscribe({
      next: (res) => {
        this.name = res.name;
        this.email = res.email;
        this.userInitials = res.name ? res.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'A';
      },
      error: (err) => {
        this.name = 'Admin';
        this.email = '-';
        this.userInitials = 'A';
      }
    });
    this.api.getAdminProducts({ per_page: 1 }).subscribe({
      next: (res) => {
        this.produkCount = res.products?.total || 0;
      },
      error: () => { this.produkCount = 0; }
    });
    this.checkLaporanRoute();
    this.router.events.subscribe(() => {
      this.checkLaporanRoute();
      this.cdr.detectChanges();
    });
  }

  checkLaporanRoute() {
    this.isLaporan = this.router.url.includes('/admin/laporan');
  }
}