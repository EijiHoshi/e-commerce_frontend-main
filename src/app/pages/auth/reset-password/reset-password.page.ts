import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.page.html',
    styleUrls: ['./reset-password.page.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule
    ]
})
export class ResetPasswordPage implements OnInit {
    password: string = '';
    passwordConfirmation: string = '';
    loading: boolean = false;
    email: string = '';
    token: string = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        // Mengambil email dan token dari query parameters
        this.route.queryParams.subscribe(params => {
            this.email = params['email'];
            this.token = params['token'];

            if (!this.email || !this.token) {
                this.router.navigate(['/login']);
            }
        });
    }

    async resetPassword() {
        if (!this.password || !this.passwordConfirmation) {
            return;
        }

        if (this.password !== this.passwordConfirmation) {
            // Tambahkan validasi password match
            return;
        }

        this.loading = true;
        try {
            await this.authService.resetPassword({
                email: this.email,
                token: this.token,
                password: this.password,
                password_confirmation: this.passwordConfirmation
            }).toPromise();

            // Redirect ke halaman login setelah berhasil
            this.router.navigate(['/login']);
        } catch (error) {
            console.error('Error resetting password:', error);
        } finally {
            this.loading = false;
        }
    }
} 