import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule]
})
export class AppComponent {
  constructor(private router: Router) {
    this.checkAuth();
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
}
