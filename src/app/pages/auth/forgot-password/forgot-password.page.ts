import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.page.html',
    styleUrls: ['./forgot-password.page.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule
    ]
})
export class ForgotPasswordPage {
    email: string = '';
    loading: boolean = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private toastController: ToastController
    ) { }

    async showToast(message: string, color: string = 'success') {
        const toast = await this.toastController.create({
            message: message,
            duration: 3000,
            position: 'top',
            color: color
        });
        await toast.present();
    }

    async resetPassword() {
        if (!this.email) {
            await this.showToast('Please enter your email address', 'danger');
            return;
        }

        this.loading = true;
        try {
            await this.authService.forgotPassword(this.email).toPromise();
            await this.showToast('Password reset link has been sent to your email');
            this.router.navigate(['/login']);
        } catch (error: any) {
            console.error('Error resetting password:', error);
            await this.showToast(error.error?.message || 'Failed to send reset password email', 'danger');
        } finally {
            this.loading = false;
        }
    }
} 