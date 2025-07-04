import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = environment.apiUrl;

    constructor(public http: HttpClient) { }

    // Fungsi untuk mendapatkan token
    getToken(): string {
        return localStorage.getItem('token') || '';
    }

    // Fungsi untuk membuat header dengan token
    getHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
        });
    }

    // Generic HTTP methods
    get(endpoint: string): Observable<any> {
        return this.http.get(`${this.apiUrl}${endpoint}`, { headers: this.getHeaders() });
    }

    post(endpoint: string, data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}${endpoint}`, data, { headers: this.getHeaders() });
    }

    put(endpoint: string, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}${endpoint}`, data, { headers: this.getHeaders() });
    }

    delete(endpoint: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}${endpoint}`, { headers: this.getHeaders() });
    }

    // Fungsi untuk mendapatkan URL gambar
    getImageUrl(path: string): string {
        if (!path) return '';
        if (path.startsWith('http')) return path;

        // Jika path sudah mengandung 'images/', langsung gabungkan
        if (path.startsWith('images/')) {
            return `${environment.apiUrl.replace('/api', '')}/${path}`;
        }

        // Jika path sudah mengandung 'storage/', langsung gabungkan
        if (path.startsWith('storage/')) {
            return `${environment.apiUrl.replace('/api', '')}/${path}`;
        }

        // Default: tambahkan 'images/products/' di depan jika hanya nama file
        return `${environment.apiUrl.replace('/api', '')}/images/products/${path}`;
    }

    // Auth Services
    login(email: string, password: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, { email, password });
    }

    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData);
    }

    // Email Verification Services
    verifyEmail(code: string, email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/email/verify`, { code, email });
    }

    resendVerificationEmail(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/email/resend`, { email });
    }

    // Product Services
    getProducts(): Observable<any> {
        return this.http.get(`${this.apiUrl}/products`, { headers: this.getHeaders() });
    }

    getProduct(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() });
    }

    getProductsByCategory(category: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/products?category=${encodeURIComponent(category)}`, { headers: this.getHeaders() });
    }

    // Cart Services
    getCart(): Observable<any> {
        return this.http.get(`${this.apiUrl}/cart`, { headers: this.getHeaders() });
    }

    addToCart(productId: number, quantity: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/cart/add`, { product_id: productId, quantity }, { headers: this.getHeaders() });
    }

    updateCartQty(cartId: number, quantity: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/cart/update/${cartId}`, { quantity }, { headers: this.getHeaders() });
    }

    removeCartItem(cartId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/cart/remove/${cartId}`, { headers: this.getHeaders() });
    }

    // Order Services
    createOrder(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/checkout`, data, { headers: this.getHeaders() });
    }

    getOrders(): Observable<any> {
        return this.http.get(`${this.apiUrl}/orders`, { headers: this.getHeaders() });
    }

    // Wishlist Services
    getWishlist(): Observable<any> {
        return this.http.get(`${this.apiUrl}/wishlist`, { headers: this.getHeaders() });
    }

    addToWishlist(productId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/wishlist/add`,
            { product_id: productId },
            { headers: this.getHeaders() }
        );
    }

    getCategories(): Observable<any> {
        return this.http.get(`${this.apiUrl}/categories`, { headers: this.getHeaders() });
    }

    getAddresses() {
        return this.http.get<any>(`${this.apiUrl}/addresses`, { headers: this.getHeaders() });
    }

    getPaymentMethods() {
        return this.http.get<any>(`${this.apiUrl}/payment-methods`, { headers: this.getHeaders() });
    }

    // Upload bukti transfer pembayaran
    uploadProofOfPayment(paymentId: number, file: File) {
        const formData = new FormData();
        formData.append('proof_of_payment', file);
        return this.http.post(`${this.apiUrl}/payments/${paymentId}/upload-proof`, formData, {
            headers: new HttpHeaders({
                'Authorization': `Bearer ${this.getToken()}`
                // Jangan set Content-Type, biarkan browser set multipart/form-data
            })
        });
    }

    // Ganti Password
    changePassword(data: { current_password: string, new_password: string, new_password_confirmation: string }) {
        return this.http.post(`${this.apiUrl}/user/change-password`, data, { headers: this.getHeaders() });
    }

    // Admin Dashboard
    getAdminDashboard(): Observable<any> {
        return this.http.get(`${this.apiUrl}/admin/dashboard`, { headers: this.getHeaders() });
    }

    // Admin Products
    getAdminProducts(params?: any): Observable<any> {
        let url = `${this.apiUrl}/admin/products`;
        if (params) {
            const queryParams = new URLSearchParams();
            Object.keys(params).forEach(key => {
                if (params[key] !== null && params[key] !== undefined) {
                    queryParams.append(key, params[key]);
                }
            });
            url += `?${queryParams.toString()}`;
        }
        return this.http.get(url, { headers: this.getHeaders() });
    }

    createProduct(productData: any): Observable<any> {
        // Check if productData is FormData (for file upload)
        if (productData instanceof FormData) {
            return this.http.post(`${this.apiUrl}/admin/products`, productData, {
                headers: new HttpHeaders({
                    'Authorization': `Bearer ${this.getToken()}`
                    // Don't set Content-Type, let browser set multipart/form-data
                })
            });
        }

        // For regular JSON data
        return this.http.post(`${this.apiUrl}/admin/products`, productData, { headers: this.getHeaders() });
    }

    updateProduct(id: number, productData: any): Observable<any> {
        console.log('Updating product with token:', this.getToken());

        // Check if productData is FormData (for file upload)
        if (productData instanceof FormData) {
            // Untuk FormData, kita perlu menggunakan POST dengan _method=PUT
            productData.append('_method', 'PUT');
            console.log('Using FormData with _method=PUT');
            return this.http.post(`${this.apiUrl}/admin/products/${id}`, productData, {
                headers: new HttpHeaders({
                    'Authorization': `Bearer ${this.getToken()}`
                    // Don't set Content-Type, let browser set multipart/form-data
                })
            });
        }

        // For regular JSON data
        console.log('Using JSON data with PUT method');
        return this.http.put(`${this.apiUrl}/admin/products/${id}`, productData, { headers: this.getHeaders() });
    }

    deleteProduct(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/admin/products/${id}`, { headers: this.getHeaders() });
    }

    bulkDeleteProducts(productIds: number[]): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin/products/bulk-delete`, { product_ids: productIds }, { headers: this.getHeaders() });
    }

    getAdminSalesReport(): Observable<any> {
        return this.http.get(`${this.apiUrl}/admin/reports/sales`, { headers: this.getHeaders() });
    }

    // Admin Orders
    getAdminOrders(params?: any): Observable<any> {
        let url = `${this.apiUrl}/admin/orders`;
        if (params) {
            const queryParams = new URLSearchParams();
            Object.keys(params).forEach(key => {
                if (params[key] !== null && params[key] !== undefined) {
                    queryParams.append(key, params[key]);
                }
            });
            url += `?${queryParams.toString()}`;
        }
        return this.http.get(url, { headers: this.getHeaders() });
    }

    getAdminOrder(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/admin/orders/${id}`, { headers: this.getHeaders() });
    }

    updateOrderStatus(id: number, status: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/admin/orders/${id}/status`, { status }, { headers: this.getHeaders() });
    }

    // Ambil profil user login
    getProfile(): Observable<any> {
        return this.http.get(`${this.apiUrl}/user`, { headers: this.getHeaders() });
    }

    // Chat Services
    getChat(): Observable<any> {
        return this.http.get(`${this.apiUrl}/chat`, { headers: this.getHeaders() });
    }
    getMessages(chatId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/chat/${chatId}/messages`, { headers: this.getHeaders() });
    }
    sendMessage(chatId: number, message: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/chat/${chatId}/messages`, { message }, { headers: this.getHeaders() });
    }

    // ================= CHAT ADMIN SERVICES =================
    getAdminChats(): Observable<any> {
        return this.http.get(`${this.apiUrl}/chats`, { headers: this.getHeaders() });
    }

    getAdminMessages(chatId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/chats/${chatId}/messages`, { headers: this.getHeaders() });
    }

    sendAdminMessage(chatId: number, message: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/chats/${chatId}/messages`, { message }, { headers: this.getHeaders() });
    }

    // Update status order untuk customer
    updateOrderStatusCustomer(id: number, status: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/orders/${id}/status`, { status }, { headers: this.getHeaders() });
    }

    // Inisiasi pembayaran Midtrans
    payWithMidtrans(orderId: number) {
        return this.http.post(`${this.apiUrl}/payments/midtrans`, { order_id: orderId }, { headers: this.getHeaders() });
    }
} 