import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {

    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    canActivate(): boolean {
        console.log('=== AuthGuard: Checking access ===');
        console.log('Current URL:', window.location.href);

        // Debug auth status
        this.authService.debugAuthStatus();

        // Cek apakah user sudah login
        if (!this.authService.isAuthenticated()) {
            console.log('AuthGuard: User not authenticated, redirecting to login');
            console.log('Token in localStorage:', localStorage.getItem('token'));
            console.log('User role in localStorage:', localStorage.getItem('user_role'));
            this.router.navigate(['/auth/login']);
            return false;
        }

        // Cek apakah user adalah admin
        if (!this.authService.isAdmin()) {
            console.log('AuthGuard: User is not admin, redirecting to login');
            console.log('User role:', this.authService.getUserRole());
            this.router.navigate(['/auth/login']);
            return false;
        }

        console.log('AuthGuard: User authenticated and is admin, allowing access');
        return true;
    }
} 