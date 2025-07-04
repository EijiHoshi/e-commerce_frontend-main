import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { AlertController, ModalController } from '@ionic/angular';
import { SidebarComponent } from '../sidebar.component';
import { HeaderComponent } from '../header.component';

@Component({
    selector: 'app-metode-pembayaran',
    templateUrl: './metode-pembayaran.page.html',
    styleUrls: ['./metode-pembayaran.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, SidebarComponent, HeaderComponent]
})
export class MetodePembayaranPage implements OnInit {
    metodePembayaran: any[] = [];
    loading = false;
    form: any = { name: '', code: '', type: '', config: {}, is_active: true };
    showForm = false;
    editMode = false;
    selectedId: number | null = null;
    deletingId: number | null = null;

    constructor(private api: ApiService, private alertController: AlertController, private modalController: ModalController) { }

    ngOnInit() {
        this.loadMetodePembayaran();
    }

    loadMetodePembayaran() {
        this.loading = true;
        this.api.get('/admin/payment-methods').subscribe({
            next: (res: any) => {
                this.metodePembayaran = res.data || res;
                this.loading = false;
            },
            error: () => { this.loading = false; }
        });
    }

    async tambah() {
        this.form = { name: '', code: '', type: '', config: {}, is_active: true };
        this.editMode = false;
        this.showForm = true;
    }

    async edit(m: any) {
        this.form = { ...m };
        this.editMode = true;
        this.selectedId = m.id;
        this.showForm = true;
    }

    async simpan() {
        this.loading = true;
        const data = { ...this.form };
        if (this.editMode && this.selectedId) {
            this.api.put(`/admin/payment-methods/${this.selectedId}`, data).subscribe({
                next: () => { this.loadMetodePembayaran(); this.showForm = false; },
                error: () => { alert('Gagal update'); },
                complete: () => { this.loading = false; }
            });
        } else {
            this.api.post('/admin/payment-methods', data).subscribe({
                next: () => { this.loadMetodePembayaran(); this.showForm = false; },
                error: () => { alert('Gagal tambah'); },
                complete: () => { this.loading = false; }
            });
        }
    }

    async hapus(id: number) {
        if (!confirm('Yakin hapus metode pembayaran?')) return;
        this.loading = true;
        this.api.delete(`/admin/payment-methods/${id}`).subscribe({
            next: () => this.loadMetodePembayaran(),
            error: () => alert('Gagal hapus'),
            complete: () => { this.loading = false; }
        });
    }

    async toggleAktif(m: any) {
        this.api.post(`/admin/payment-methods/${m.id}/toggle`, {}).subscribe({
            next: () => this.loadMetodePembayaran(),
            error: () => alert('Gagal update status'),
        });
    }
} 