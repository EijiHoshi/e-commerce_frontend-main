# Panduan Menjalankan Aplikasi E-commerce

## Status Aplikasi
✅ **Frontend Angular** - Sudah dikonfigurasi dan siap dijalankan
✅ **Backend Laravel** - Konfigurasi database sudah benar
✅ **Koneksi** - Frontend sudah terhubung dengan backend

## Langkah-langkah Menjalankan Aplikasi

### 1. Jalankan Backend Laravel

```bash
# Buka terminal baru
# Masuk ke direktori backend Laravel
cd /path/to/backend/laravel

# Jalankan server Laravel
php artisan serve
```

**Backend akan berjalan di:** `http://localhost:8000`

### 2. Jalankan Frontend Angular

```bash
# Buka terminal baru
# Masuk ke direktori frontend Angular
cd /path/to/frontend/angular

# Jalankan server Angular
ng serve
# Atau untuk Ionic
ionic serve
```

**Frontend akan berjalan di:** `http://localhost:4200` atau `http://localhost:8100`

### 3. Test Koneksi

1. **Buka browser** dan akses: `http://localhost:4200/backend-test`
2. **Klik semua tombol test** untuk memastikan koneksi berfungsi:
   - Test Koneksi Backend
   - Test Login Endpoint
   - Test Database Connection
   - Test Products API
   - Test Categories API

### 4. Test Login

1. **Buka browser** dan akses: `http://localhost:4200/auth/login`
2. **Coba login** dengan user yang ada di database
3. **Periksa console browser** (F12) untuk melihat log

## Troubleshooting

### Jika Backend Tidak Merespons:

1. **Pastikan Laravel berjalan:**
   ```bash
   php artisan serve
   ```

2. **Test backend langsung:**
   ```bash
   curl http://localhost:8000/api/test-connection
   ```

3. **Periksa port 8000 tidak digunakan:**
   ```bash
   netstat -an | findstr :8000
   ```

### Jika Frontend Tidak Bisa Akses Backend:

1. **Periksa URL API di environment:**
   - Development: `http://localhost:8000/api`
   - Production: `https://efabli.site/api`

2. **Test dengan Postman:**
   - `GET http://localhost:8000/api/products`
   - `GET http://localhost:8000/api/categories`

3. **Periksa CORS di Laravel:**
   File: `config/cors.php`
   ```php
   'allowed_origins' => ['http://localhost:4200', 'http://localhost:8100'],
   ```

### Jika Database Error:

1. **Test koneksi database:**
   ```bash
   mysql -u efablisi_efablisi -p efablisi_e-commerce
   ```

2. **Clear cache Laravel:**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan route:clear
   ```

3. **Periksa file .env:**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_DATABASE=efablisi_e-commerce
   DB_USERNAME=efablisi_efablisi
   DB_PASSWORD=efabliaplikasi.
   ```

## Konfigurasi yang Sudah Diperbarui

### Frontend Angular:
- ✅ Environment development: `http://localhost:8000/api`
- ✅ Environment production: `https://efabli.site/api`
- ✅ Service test koneksi: `BackendTestService`
- ✅ Component test: `BackendTestComponent`
- ✅ Route test: `/backend-test`
- ✅ Logging API calls

### Backend Laravel:
- ✅ Database configuration di `.env`
- ✅ CORS configuration untuk frontend
- ✅ API endpoints untuk test

## File yang Sudah Diperbarui

✅ `src/environments/environment.ts` - Konfigurasi development
✅ `src/environments/environment.prod.ts` - Konfigurasi production
✅ `src/app/services/backend-test.service.ts` - Service test koneksi
✅ `src/app/components/backend-test/backend-test.component.ts` - Component test
✅ `src/app/app-routing.module.ts` - Route test backend
✅ `src/app/services/api.service.ts` - Logging API calls
✅ `src/app/services/auth.service.ts` - Logging auth calls
✅ `BACKEND_CONNECTION_GUIDE.md` - Panduan koneksi
✅ `RUNNING_APPLICATION.md` - Panduan ini

## Langkah Selanjutnya

1. **Jalankan backend Laravel** di terminal pertama
2. **Jalankan frontend Angular** di terminal kedua
3. **Test koneksi** menggunakan halaman `/backend-test`
4. **Test login** menggunakan halaman `/auth/login`
5. **Periksa log** di console browser dan terminal

## Catatan Penting

- **Backend Laravel** harus berjalan di `http://localhost:8000`
- **Frontend Angular** berjalan di `http://localhost:4200` atau `http://localhost:8100`
- **Database MySQL** harus berjalan dan bisa diakses
- **CORS** harus dikonfigurasi dengan benar di Laravel
- **API endpoints** harus tersedia di backend Laravel

---

**Status:** Aplikasi siap dijalankan! 🚀 