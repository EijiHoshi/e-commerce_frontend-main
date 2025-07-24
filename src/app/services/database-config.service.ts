import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DatabaseConfigService {

    constructor(private http: HttpClient) { }

    /**
     * Test koneksi ke backend API
     */
    testApiConnection(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/health-check`);
    }

    /**
     * Test koneksi database melalui backend
     */
    testDatabaseConnection(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/test-database`);
    }

    /**
     * Mendapatkan informasi konfigurasi backend
     */
    getBackendInfo(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/backend-info`);
    }

    /**
     * Log konfigurasi environment untuk debugging
     */
    logEnvironmentConfig(): void {
        console.log('=== Environment Configuration ===');
        console.log('API URL:', environment.apiUrl);
        console.log('Image Base URL:', environment.imageBaseUrl);
        console.log('Production:', environment.production);
        console.log('===============================');
    }

    /**
     * Test endpoint untuk memastikan backend berjalan
     */
    pingBackend(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/ping`);
    }
} 