import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, IonicModule } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, FormsModule, RouterModule]
})
export class LoginPage {
    email: string = '';
    password: string = '';
    loading: boolean = false;
    rememberMe: boolean = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private toastController: ToastController
    ) { }

    async login() {
        if (!this.email || !this.password) {
            const toast = await this.toastController.create({
                message: 'Please fill in all fields',
                duration: 2000,
                color: 'danger'
            });
            toast.present();
            return;
        }

        this.loading = true;
        try {
            console.log('Attempting login with:', { email: this.email, remember: this.rememberMe });
            const response = await this.authService.login(this.email, this.password, this.rememberMe).toPromise();
            console.log('Login response:', response);

            if (response && response.token) {
                // Token sudah disimpan di AuthService
                console.log('Token stored, user role:', response.user?.role);

                if (response.user && response.user.role === 'admin') {
                    console.log('Login admin, navigating to dashboard');
                    this.router.navigate(['/admin/dashboard']);
                } else {
                    console.log('Login customer, navigating to home');
                    this.router.navigate(['/home']);
                }
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            const toast = await this.toastController.create({
                message: error.error?.message || 'Login failed. Please check your credentials.',
                duration: 2000,
                color: 'danger'
            });
            toast.present();
        } finally {
            this.loading = false;
        }
    }

    goToVerification() {
        // Jika user sudah input email, gunakan email tersebut
        if (this.email) {
            this.router.navigate(['/auth/verify-email'], {
                queryParams: {
                    email: this.email,
                    pending: 'true'
                }
            });
        } else {
            // Jika belum input email, arahkan ke halaman verifikasi tanpa email
            this.router.navigate(['/auth/verify-email'], {
                queryParams: {
                    pending: 'true'
                }
            });
        }
    }
} 