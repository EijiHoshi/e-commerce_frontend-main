import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class LoginDebugService {

    constructor(private http: HttpClient) { }

    /** 
     * Test koneksi ke backend
     */
    testBackendConnection(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/ping`).pipe(
            tap(response => console.log('Backend connection test successful:', response)),
            catchError(error => {
                console.error('Backend connection test failed:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Test endpoint login dengan detail error
     */
    testLoginEndpoint(email: string, password: string): Observable<any> {
        const loginData = { email, password };
        console.log('Testing login endpoint with data:', { email, password: '***' });

        return this.http.post(`${environment.apiUrl}/login`, loginData).pipe(
            tap(response => {
                console.log('Login endpoint test successful:', response);
            }),
            catchError((error: HttpErrorResponse) => {
                console.error('Login endpoint test failed:', {
                    status: error.status,
                    statusText: error.statusText,
                    error: error.error,
                    message: error.message,
                    url: error.url
                });
                return throwError(() => error);
            })
        );
    }

    /**
     * Test endpoint sanctum untuk CSRF
     */
    testSanctumEndpoint(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/sanctum/csrf-cookie`).pipe(
            tap(response => console.log('Sanctum endpoint test successful:', response)),
            catchError(error => {
                console.error('Sanctum endpoint test failed:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Test endpoint user untuk cek authentication
     */
    testUserEndpoint(): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        return this.http.get(`${environment.apiUrl}/user`, { headers }).pipe(
            tap(response => console.log('User endpoint test successful:', response)),
            catchError(error => {
                console.error('User endpoint test failed:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Log environment configuration
     */
    logEnvironmentConfig(): void {
        console.log('=== Login Debug Environment ===');
        console.log('API URL:', environment.apiUrl);
        console.log('Image Base URL:', environment.imageBaseUrl);
        console.log('Production:', environment.production);
        console.log('Backend URL:', environment.backend?.url);
        console.log('=============================');
    }

    /**
     * Log browser information
     */
    logBrowserInfo(): void {
        console.log('=== Browser Information ===');
        console.log('User Agent:', navigator.userAgent);
        console.log('Platform:', navigator.platform);
        console.log('Language:', navigator.language);
        console.log('Cookies Enabled:', navigator.cookieEnabled);
        console.log('Online:', navigator.onLine);
        console.log('========================');
    }

    /**
     * Log localStorage information
     */
    logLocalStorage(): void {
        console.log('=== LocalStorage Information ===');
        console.log('Token exists:', !!localStorage.getItem('token'));
        console.log('User role exists:', !!localStorage.getItem('user_role'));
        console.log('Token length:', localStorage.getItem('token')?.length || 0);
        console.log('=============================');
    }

    /**
     * Test dengan credentials yang berbeda
     */
    testWithDifferentCredentials(): Observable<any> {
        // Test dengan data dummy untuk melihat response format
        const testData = {
            email: 'test@example.com',
            password: 'password123'
        };

        console.log('Testing with dummy credentials:', testData);

        return this.http.post(`${environment.apiUrl}/login`, testData).pipe(
            tap(response => {
                console.log('Dummy login test response:', response);
            }),
            catchError(error => {
                console.error('Dummy login test failed:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Check if backend is accessible
     */
    checkBackendAccessibility(): Observable<any> {
        return this.http.get(`${environment.backend.url}/api/ping`).pipe(
            tap(response => console.log('Backend accessibility test successful:', response)),
            catchError(error => {
                console.error('Backend accessibility test failed:', error);
                return throwError(() => error);
            })
        );
    }
} 