import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { SidebarComponent } from '../sidebar.component';
import { HeaderComponent } from '../header.component';

interface Pelanggan {
  id: number;
  name: string;
  email: string;
  birth_date?: string;
  gender?: string;
  created_at?: string;
}

@Component({
  selector: 'app-pelanggan',
  templateUrl: './pelanggan.page.html',
  styleUrls: ['./pelanggan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, SidebarComponent, HeaderComponent]
})
export class PelangganPage implements OnInit {
  pelangganList: Pelanggan[] = [];
  filteredList: Pelanggan[] = [];
  isLoading = false;
  errorMsg = '';
  search = '';

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loadPelanggan();
  }

  loadPelanggan() {
    this.isLoading = true;
    this.api.get('/admin/customers').subscribe({
      next: (res: any) => {
        this.pelangganList = res.data || [];
        this.filteredList = this.pelangganList;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = 'Gagal memuat data pelanggan';
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    const q = this.search.toLowerCase();
    this.filteredList = this.pelangganList.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)
    );
  }
}
