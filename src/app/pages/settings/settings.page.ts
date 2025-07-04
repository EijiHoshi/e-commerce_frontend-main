import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.page.html',
    styleUrls: ['./settings.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule]
})
export class SettingsPage {
    constructor(private router: Router) { }

    goBack() {
        this.router.navigate(['/profile']);
    }

    goToNotif() {
        // Navigasi ke halaman notification center
        this.router.navigate(['/notification-center']);
    }

    goToPasswordManager() {
        // Navigasi ke halaman password manager
        this.router.navigate(['/password-manager']);
    }

    goToDeleteAccount() {
        // Navigasi ke halaman delete account
        this.router.navigate(['/delete-account']);
    }
} 