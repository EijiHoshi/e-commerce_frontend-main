import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule]
})
export class AppComponent {
  constructor(private router: Router, private notificationService: NotificationService) {
    this.checkAuth();
    this.initFCM();
  }

  checkAuth() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      // Jika user belum login, arahkan ke login
      if (this.router.url !== '/auth/login') {
        this.router.navigate(['/auth/login']);
      }
    }
    // Jika sudah login, biarkan user tetap di halaman manapun (dashboard, home, dll)
  }

  async initFCM() {
    // Request permission dan ambil token FCM
    const token = await this.notificationService.requestPermission();
    if (token) {
      // TODO: Kirim token ke backend jika perlu
      console.log('FCM Token:', token);
    }
    // Listen pesan notifikasi
    this.notificationService.currentMessage$.subscribe(msg => {
      if (msg) {
        // Tampilkan notifikasi sederhana (bisa diganti toast/modal/dll)
        alert('Notifikasi: ' + (msg.notification?.title || 'Pesan baru'));
      }
    });
  }
}
