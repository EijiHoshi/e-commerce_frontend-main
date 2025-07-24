import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, IonicModule } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';
import { LoginDebugService } from '../../../services/login-debug.service';
import { environment } from '../../../../environments/environment';
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
        private loginDebug: LoginDebugService,
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

        // Debug information
        this.loginDebug.logEnvironmentConfig();
        this.loginDebug.logBrowserInfo();
        this.loginDebug.logLocalStorage();

        try {
            console.log('=== Login Attempt ===');
            console.log('Email:', this.email);
            console.log('Remember me:', this.rememberMe);
            console.log('API URL:', environment.apiUrl);

            // Test backend connection first
            try {
                await this.loginDebug.testBackendConnection().toPromise();
                console.log('Backend connection test passed');
            } catch (backendError) {
                console.error('Backend connection test failed:', backendError);
                const toast = await this.toastController.create({
                    message: 'Backend connection failed. Please check if Laravel server is running.',
                    duration: 3000,
                    color: 'danger'
                });
                toast.present();
                return;
            }

            // Test login endpoint
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
                throw new Error('Invalid response format - no token received');
            }
        } catch (error: any) {
            console.error('=== Login Error Details ===');
            console.error('Error type:', typeof error);
            console.error('Error message:', error.message);
            console.error('Error status:', error.status);
            console.error('Error statusText:', error.statusText);
            console.error('Error error:', error.error);
            console.error('Error url:', error.url);
            console.error('Full error object:', error);

            let errorMessage = 'Login failed. Please check your credentials.';

            if (error.status === 0) {
                errorMessage = 'Cannot connect to server. Please check if backend is running.';
            } else if (error.status === 401) {
                errorMessage = 'Invalid credentials. Please check your email and password.';
            } else if (error.status === 422) {
                errorMessage = error.error?.message || 'Validation error. Please check your input.';
            } else if (error.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (error.error?.message) {
                errorMessage = error.error.message;
            }

            const toast = await this.toastController.create({
                message: errorMessage,
                duration: 3000,
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