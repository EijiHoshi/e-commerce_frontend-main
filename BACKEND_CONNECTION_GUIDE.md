# Panduan Menghubungkan Backend Laravel dengan Frontend Angular

## Konfigurasi Backend Laravel

### 1. File .env Backend (Sudah Benar)
```env
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:shl1EpOIsUyRv+ocXvUFgu1QGl0ili0qJZogwArTv9c=
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=efablisi_e-commerce
DB_USERNAME=efablisi_efablisi
DB_PASSWORD=efabliaplikasi.

FRONTEND_URL=http://localhost:8100
```

### 2. Jalankan Backend Laravel
```bash
# Di direktori backend Laravel
php artisan serve
```

Backend akan berjalan di: `http://localhost:8000`

### 3. Test Database Connection
```bash
# Test koneksi database
php artisan tinker
DB::connection()->getPdo();

# Atau test dengan command
php artisan db:show
```

## Konfigurasi Frontend Angular

### 1. Environment Configuration (Sudah Diperbarui)
- **Development**: `http://localhost:8000/api`
- **Production**: `https://efabli.site/api`

### 2. Jalankan Frontend Angular
```bash
# Di direktori frontend Angular
ng serve
```

Frontend akan berjalan di: `http://localhost:4200`

## Test Koneksi

### 1. Akses Halaman Test
Buka browser dan akses: `http://localhost:4200/backend-test`

### 2. Test Endpoints
1. **Test Koneksi Backend** - Test apakah backend berjalan
2. **Test Login Endpoint** - Test endpoint login Laravel
3. **Test Database Connection** - Test koneksi database
4. **Test Products API** - Test API products
5. **Test Categories API** - Test API categories

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

3. **Periksa CORS di Laravel:**
   File: `config/cors.php`
   ```php
   'paths' => ['api/*', 'sanctum/csrf-cookie'],
   'allowed_methods' => ['*'],
   'allowed_origins' => ['http://localhost:4200', 'http://localhost:8100'],
   'allowed_origins_patterns' => [],
   'allowed_headers' => ['*'],
   'exposed_headers' => [],
   'max_age' => 0,
   'supports_credentials' => false,
   ```

### Jika Database Error:

1. **Periksa kredensial database:**
   - Username: `efablisi_efablisi`
   - Password: `efabliaplikasi.`
   - Database: `efablisi_e-commerce`

2. **Test koneksi database:**
   ```bash
   mysql -u efablisi_efablisi -p efablisi_e-commerce
   ```

3. **Clear cache Laravel:**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan route:clear
   ```

### Jika Frontend Tidak Bisa Akses Backend:

1. **Periksa URL API:**
   - Development: `http://localhost:8000/api`
   - Production: `https://efabli.site/api`

2. **Periksa CORS:**
   - Pastikan backend mengizinkan request dari frontend
   - Update `config/cors.php` di Laravel

3. **Test dengan Postman:**
   - Test endpoint: `GET http://localhost:8000/api/products`
   - Test endpoint: `GET http://localhost:8000/api/categories`

## Langkah-langkah Lengkap

### 1. Start Backend Laravel
```bash
cd /path/to/backend/laravel
php artisan serve
```

### 2. Start Frontend Angular
```bash
cd /path/to/frontend/angular
ng serve
```

### 3. Test Koneksi
1. Buka: `http://localhost:4200/backend-test`
2. Klik semua tombol test
3. Periksa hasil di console browser (F12)

### 4. Test Login
1. Buka: `http://localhost:4200/auth/login`
2. Coba login dengan user yang ada di database
3. Periksa response di console browser

## File yang Sudah Diperbarui

✅ `src/environments/environment.ts` - Konfigurasi development
✅ `src/environments/environment.prod.ts` - Konfigurasi production
✅ `src/app/services/backend-test.service.ts` - Service test koneksi
✅ `src/app/components/backend-test/backend-test.component.ts` - Component test
✅ `src/app/app-routing.module.ts` - Route test backend
✅ `src/app/services/api.service.ts` - Logging API calls
✅ `src/app/services/auth.service.ts` - Logging auth calls

## Catatan Penting

- **Backend Laravel** harus berjalan di `http://localhost:8000`
- **Frontend Angular** berjalan di `http://localhost:4200`
- **Database MySQL** harus berjalan dan bisa diakses
- **CORS** harus dikonfigurasi dengan benar di Laravel
- **API endpoints** harus tersedia di backend Laravel

## Support

Jika masih mengalami masalah:

1. Periksa log error di browser console (F12)
2. Periksa log error di terminal Laravel
3. Test endpoint secara langsung dengan Postman
4. Pastikan semua service berjalan dengan benar

---

**Status:** Frontend sudah dikonfigurasi untuk terhubung dengan backend Laravel Anda. 