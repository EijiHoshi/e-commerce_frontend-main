import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePage implements OnInit {
  userName = '';
  userPhoto = '';
  loading = true;
  showLogoutModal = false;

  constructor(private apiService: ApiService, private router: Router, private authService: AuthService, private location: Location) { }

  ngOnInit() {
    this.loading = true;
    this.apiService.http.get<any>(`${this.apiService['apiUrl']}/user/profile`, { headers: this.apiService.getHeaders() })
      .subscribe({
        next: (res) => {
          if (!res?.name) {
            this.router.navigate(['/login']);
            return;
          }
          this.userName = res.name;
          this.userPhoto = res.photo || '';
          this.loading = false;
        },
        error: () => {
          this.router.navigate(['/login']);
        }
      });
  }

  goBack() {
    this.location.back();
  }
  goToProfileDetail() {
    alert('Your Profile');
  }
  goToOrders() {
    this.router.navigate(['/order-history']);
  }
  goToSettings() {
    this.router.navigate(['/settings']);
  }
  goToLogout() {
    this.showLogoutModal = true;
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.showLogoutModal = false;
  }
  goToHome() {
    this.router.navigate(['/home']);
  }
  goToChat() {
    this.router.navigate(['/chat']);
  }
  goToCart() {
    this.router.navigate(['/cart']);
  }
  goToProfile() {
    this.router.navigate(['/profile']);
  }
} 