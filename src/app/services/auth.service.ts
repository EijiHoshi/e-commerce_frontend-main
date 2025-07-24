import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private api: ApiService,
        private router: Router
    ) { }

    login(email: string, password: string, remember: boolean = false): Observable<any> {
        console.log('AuthService: Attempting login to:', `${this.apiUrl}/login`);
        console.log('AuthService: Email:', email);

        return this.http.post(`${this.apiUrl}/login`, { email, password, remember }).pipe(
            tap((response: any) => {
                console.log('AuthService: Login response received:', response);
                if (response && response.token) {
                    localStorage.setItem('token', response.token);
                    if (response.user && response.user.role) {
                        localStorage.setItem('user_role', response.user.role);
                    }
                    console.log('AuthService: Token and role stored', {
                        token: response.token ? 'exists' : 'missing',
                        role: response.user?.role
                    });
                }
            })
        );
    }

    register(data: {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        phone: string;
        birth_date: string;
        gender: string;
    }): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, data);
    }

    sendVerificationEmail(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/send-verification-email`, { email });
    }

    verifyEmail(email: string, code: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/email/verify`, { email, code });
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot-password`, { email });
    }

    resetPassword(data: {
        email: string;
        token: string;
        password: string;
        password_confirmation: string;
    }): Observable<any> {
        return this.http.post(`${this.apiUrl}/reset-password`, data);
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        this.resetChatState();
        this.router.navigate(['/auth/login']);
        console.log('AuthService: Logged out, cleared storage');
    }

    resetChatState(): void {
        // Reset state chat global jika ada (misal: di localStorage, session, atau service global)
        // Jika hanya di komponen chat, bisa dibiarkan kosong atau tambahkan log
        // Contoh jika pakai localStorage:
        localStorage.removeItem('chatId');
        localStorage.removeItem('messages');
        // Jika ada state global lain, reset di sini
        console.log('AuthService: Reset chat state');
    }

    isAuthenticated(): boolean {
        const token = localStorage.getItem('token');
        console.log('AuthService.isAuthenticated(): Token exists:', !!token);
        return !!token;
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getUserRole(): string | null {
        return localStorage.getItem('user_role');
    }

    isAdmin(): boolean {
        const role = this.getUserRole();
        console.log('AuthService.isAdmin(): User role:', role);
        const isAdmin = role === 'admin';
        return isAdmin;
    }

    // Method untuk cek token validity dengan backend
    checkTokenValidity(): Observable<any> {
        return this.http.get(`${this.apiUrl}/user`);
    }

    // Debug method untuk cek status auth
    debugAuthStatus(): void {
        console.log('=== Auth Service Debug ===');
        console.log('Token exists:', !!localStorage.getItem('token'));
        console.log('User role:', localStorage.getItem('user_role'));
        console.log('Is authenticated:', this.isAuthenticated());
        console.log('Is admin:', this.isAdmin());
        console.log('Current URL:', window.location.href);
        console.log('=======================');
    }

    getUserId(): number | null {
        // Coba ambil dari localStorage jika pernah disimpan
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && user.id) return Number(user.id);
            } catch { }
        }
        // Jika tidak ada, coba decode dari JWT (jika format JWT dan ada payload user_id)
        const token = this.getToken();
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload && (payload.id || payload.user_id)) {
                    return Number(payload.id || payload.user_id);
                }
            } catch { }
        }
        return null;
    }
} 