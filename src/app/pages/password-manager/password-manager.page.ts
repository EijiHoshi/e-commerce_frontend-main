import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ToastController } from '@ionic/angular';

@Component({
    selector: 'app-password-manager',
    templateUrl: './password-manager.page.html',
    styleUrls: ['./password-manager.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class PasswordManagerPage {
    passwordForm: FormGroup;
    showCurrent = false;
    showNew = false;
    showConfirm = false;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private apiService: ApiService,
        private toastController: ToastController
    ) {
        this.passwordForm = this.fb.group({
            currentPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]]
        });
    }

    goBack() {
        this.router.navigate(['/settings']);
    }

    goToForgotPassword() {
        this.router.navigate(['/auth/forgot-password']);
    }

    async presentToast(message: string, color: 'success' | 'danger' = 'success') {
        const toast = await this.toastController.create({
            message,
            duration: 2000,
            color,
            position: 'bottom',
            cssClass: 'custom-toast'
        });
        toast.present();
    }

    changePassword() {
        if (this.passwordForm.invalid) return;
        const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
        this.apiService.changePassword({
            current_password: currentPassword,
            new_password: newPassword,
            new_password_confirmation: confirmPassword
        }).subscribe({
            next: (res) => {
                this.presentToast('Password changed successfully!', 'success');
                this.passwordForm.reset();
            },
            error: (err) => {
                this.presentToast(err?.error?.message || 'Failed to change password', 'danger');
            }
        });
    }
} 