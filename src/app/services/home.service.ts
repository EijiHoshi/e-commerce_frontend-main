import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HomeService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getBanners(): Observable<any> {
        return this.http.get(`${this.apiUrl}/homepage/banners`);
    }

    getCategories(): Observable<any> {
        return this.http.get(`${this.apiUrl}/categories`);
    }

    getPopularProducts(): Observable<any> {
        return this.http.get(`${this.apiUrl}/homepage/popular-products`);
    }

    getNewArrivals(): Observable<any> {
        return this.http.get(`${this.apiUrl}/homepage/new-arrivals`);
    }

    getHomepage(): Observable<any> {
        return this.http.get(`${this.apiUrl}/homepage`);
    }

    getProductsByCategory(category: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/products?category=${encodeURIComponent(category)}`);
    }

    getProducts(): Observable<any> {
        return this.http.get(`${this.apiUrl}/products`);
    }
} 