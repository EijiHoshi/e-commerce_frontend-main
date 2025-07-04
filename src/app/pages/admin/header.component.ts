import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
  <div class="admin-header">
    <div class="header-nav">
      <div class="header-logo-section">
        <div class="logo-circle"><span class="logo-e">E</span></div>
        <div class="logo-title">EFABLI</div>
      </div>
      <div class="header-actions">
        <div class="notif-box">
          <button class="notif-btn">
            <ion-icon name="notifications-outline"></ion-icon>
            <span class="notif-badge">{{ notifCount }}</span>
          </button>
        </div>
        <div class="user-menu" (click)="toggleDropdown()" tabindex="0" #profileBtn>
          <div class="avatar"><span>{{ initials }}</span></div>
          <div class="user-info">
            <div class="user-name">{{ name || 'Admin' }}</div>
            <div class="user-desc">{{ email || 'Aplikasi E-Commerce' }}</div>
          </div>
          <ion-icon name="chevron-down-outline" class="chevron"></ion-icon>
          <div class="profile-dropdown" *ngIf="dropdownOpen">
            <div class="dropdown-item"><ion-icon name="settings-outline"></ion-icon> Settings</div>
            <div class="dropdown-item" (click)="logout($event)"><ion-icon name="log-out-outline"></ion-icon> Logout</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  name: string = '';
  email: string = '';
  initials: string = '';
  dropdownOpen: boolean = false;
  @ViewChild('profileBtn') profileBtn!: ElementRef;
  notifCount: number = 0;

  constructor(private api: ApiService, private auth: AuthService) { }

  ngOnInit() {
    this.api.getProfile().subscribe({
      next: (res) => {
        this.name = res.name;
        this.email = res.email;
        this.initials = res.name ? res.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'A';
      },
      error: (err) => {
        this.name = 'Admin';
        this.email = '-';
        this.initials = 'A';
      }
    });
    this.api.http.get<any>(`${this.api['apiUrl']}/notifications`, { headers: this.api.getHeaders() })
      .subscribe({
        next: (res) => {
          this.notifCount = Array.isArray(res) ? res.filter((n: any) => n.status === 'unread').length : 0;
        },
        error: () => { this.notifCount = 0; }
      });
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  handleClickOutside(event: MouseEvent) {
    if (this.dropdownOpen && this.profileBtn && !this.profileBtn.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }

  logout(event: Event) {
    event.stopPropagation();
    this.dropdownOpen = false;
    this.auth.logout();
  }
} 