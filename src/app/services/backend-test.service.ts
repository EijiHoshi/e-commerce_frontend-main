import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BackendTestService {

    constructor(private http: HttpClient) { }

    /**
     * Test koneksi ke backend Laravel
     */
    testBackendConnection(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/test-connection`);
    }

    /**
     * Test endpoint login untuk memastikan backend berjalan
     */
    testLoginEndpoint(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/sanctum/csrf-cookie`);
    }

    /**
     * Test koneksi database melalui backend
     */
    testDatabaseConnection(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/test-database`);
    }

    /**
     * Mendapatkan informasi backend
     */
    getBackendInfo(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/backend-info`);
    }

    /**
     * Log konfigurasi environment untuk debugging
     */
    logEnvironmentConfig(): void {
        console.log('=== Backend Configuration ===');
        console.log('API URL:', environment.apiUrl);
        console.log('Image Base URL:', environment.imageBaseUrl);
        console.log('Production:', environment.production);
        console.log('Backend URL:', environment.backend?.url);
        console.log('Database:', environment.backend?.database);
        console.log('============================');
    }

    /**
     * Test endpoint untuk memastikan backend berjalan
     */
    pingBackend(): Observable<any> {
        return this.http.get(`${environment.backend.url}/api/ping`);
    }

    /**
     * Test endpoint products untuk memastikan API berfungsi
     */
    testProductsEndpoint(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/products`);
    }

    /**
     * Test endpoint categories untuk memastikan API berfungsi
     */
    testCategoriesEndpoint(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/categories`);
    }
} 