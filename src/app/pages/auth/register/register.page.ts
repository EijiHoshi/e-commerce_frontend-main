import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-register',
    templateUrl: './register.page.html',
    styleUrls: ['./register.page.scss'],
    standalone: true,
    imports: [IonicModule, FormsModule, CommonModule, RouterModule]
})
export class RegisterPage {
    name: string = '';
    email: string = '';
    password: string = '';
    confirmPassword: string = '';
    phone: string = '';
    birth_date: string = '';
    gender: string = '';
    agreeTerms: boolean = false;
    loading: boolean = false;

    constructor(
        private router: Router,
        private authService: AuthService,
        private toastController: ToastController
    ) { }

    async register() {
        if (!this.name || !this.email || !this.password || !this.confirmPassword ||
            !this.phone || !this.birth_date || !this.gender || !this.agreeTerms) {
            const toast = await this.toastController.create({
                message: 'Please fill in all required fields',
                duration: 3000,
                position: 'bottom',
                color: 'danger'
            });
            toast.present();
            return;
        }

        if (this.password !== this.confirmPassword) {
            const toast = await this.toastController.create({
                message: 'Password and confirmation password do not match',
                duration: 3000,
                position: 'bottom',
                color: 'danger'
            });
            toast.present();
            return;
        }

        this.loading = true;
        try {
            const response = await this.authService.register({
                name: this.name,
                email: this.email,
                password: this.password,
                password_confirmation: this.confirmPassword,
                phone: this.phone,
                birth_date: this.birth_date,
                gender: this.gender
            }).toPromise();

            const toast = await this.toastController.create({
                message: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi.',
                duration: 5000,
                position: 'bottom',
                color: 'success'
            });
            toast.present();

            // Redirect ke halaman verifikasi email dengan email yang baru didaftarkan
            this.router.navigate(['/auth/verify-email'], {
                queryParams: {
                    email: this.email,
                    pending: 'true'
                }
            });
        } catch (error: any) {
            let errorMessage = 'Registration failed';

            if (error.error && error.error.errors) {
                // Handle validation errors from backend
                const errors = error.error.errors;
                errorMessage = Object.values(errors)
                    .reduce((acc: string[], val: any) => acc.concat(val), [])
                    .join('\n');
            } else if (error.error?.message) {
                errorMessage = error.error.message;
            }

            const toast = await this.toastController.create({
                message: errorMessage,
                duration: 5000,
                position: 'bottom',
                color: 'danger'
            });
            toast.present();
        } finally {
            this.loading = false;
        }
    }
} 