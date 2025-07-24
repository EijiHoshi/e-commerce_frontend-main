isi dari app/Http/Kernel.php

<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * The application's global HTTP middleware stack.
     *
     * These middleware are run during every request to your application.
     *
     * @var array<int, class-string|string>
     */
    protected $middleware = [
        // \App\Http\Middleware\TrustHosts::class,
        \App\Http\Middleware\TrustProxies::class,
        \Illuminate\Http\Middleware\HandleCors::class,
        \App\Http\Middleware\PreventRequestsDuringMaintenance::class,
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,
        \App\Http\Middleware\TrimStrings::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ];

    /**
     * The application's route middleware groups.
     *
     * @var array<string, array<int, class-string|string>>
     */
    protected $middlewareGroups = [
        'web' => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],

        'api' => [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],

    ];

    /**
     * The application's middleware aliases.
     *
     * Aliases may be used instead of class names to conveniently assign middleware to routes and groups.
     *
     * @var array<string, class-string|string>
     */
    protected $middlewareAliases = [
        'auth' => \App\Http\Middleware\Authenticate::class,
        'admin' => \App\Http\Middleware\IsAdmin::class,
        'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'auth.session' => \Illuminate\Session\Middleware\AuthenticateSession::class,
        'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
        'can' => \Illuminate\Auth\Middleware\Authorize::class,
        'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
        'password.confirm' => \Illuminate\Auth\Middleware\RequirePassword::class,
        'precognitive' => \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
        'signed' => \App\Http\Middleware\ValidateSignature::class,
        'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
    ];
}


isi dari routes/api.php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\RecommendationController;
use App\Http\Controllers\Public\PublicController;
use App\Http\Controllers\API\ProductReviewController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\StockController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\WishlistController;
use App\Http\Controllers\API\OrderTrackingController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\API\ProfileController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/ping', function () {
    return response()->json(['message' => 'pong']);
});


// 🔐 AUTH
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [PasswordResetLinkController::class, 'store']);
Route::post('/reset-password', [NewPasswordController::class, 'store']);

// Email Verification Routes
Route::post('/email/verify', [VerifyEmailController::class, 'verify']);
Route::post('/email/resend', [VerifyEmailController::class, 'resend']);
Route::post('/send-verification-email', [AuthController::class, 'sendVerificationEmail']);

Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->get('/user/profile', function (Request $request) {
    $user = $request->user();
    return response()->json([
        'name' => $user->name,
        'photo' => $user->photo ?? '', // pastikan field photo ada di tabel users
        // tambahkan field lain jika perlu
    ]);
});

// 🌐 PUBLIC ROUTES (Homepage / User tidak login)
Route::get('/homepage', [PublicController::class, 'homepage']); // berisi banner, kategori, rekomendasi, popular, dan produk
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

//Harus butuh login
Route::middleware('auth:sanctum')->group(function () {

    //🛒 USER CART 
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'addItem']);
    Route::put('/cart/update/{id}', [CartController::class, 'update']);
    Route::delete('/cart/remove/{id}', [CartController::class, 'destroy']);

    //📍 ADDRESSES
    Route::get('/addresses', [\App\Http\Controllers\API\AddressController::class, 'index']);
    Route::post('/addresses', [\App\Http\Controllers\API\AddressController::class, 'store']);
    Route::put('/addresses/{id}', [\App\Http\Controllers\API\AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [\App\Http\Controllers\API\AddressController::class, 'destroy']);

    //Checkout Produk
    Route::post('/checkout', [\App\Http\Controllers\API\OrderController::class, 'checkout']);
    Route::get('/orders', [\App\Http\Controllers\API\OrderController::class, 'index']);
    Route::get('/orders/{id}', [\App\Http\Controllers\API\OrderController::class, 'show']);
    Route::put('/orders/{id}/status', [\App\Http\Controllers\API\OrderController::class, 'updateStatus']);
    Route::post('/orders/{id}/cancel', [\App\Http\Controllers\API\OrderController::class, 'cancel']);

    // Product Review Routes
    Route::post('/products/{product}/reviews', [ProductReviewController::class, 'store']);
    Route::get('/products/{product}/reviews', [ProductReviewController::class, 'index']);

    // Notification Routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);

    // Stock Management Routes
    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        Route::post('/products/{product}/stock', [StockController::class, 'updateStock']);
        Route::get('/products/low-stock', [StockController::class, 'getLowStockProducts']);
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/products/{product}/check-stock', [StockController::class, 'checkStock']);
    });

    // Payment Routes
    Route::get('/payment-methods', [PaymentController::class, 'getPaymentMethods']);
    Route::post('/orders/{order}/payment', [PaymentController::class, 'createPayment']);

    // Upload bukti transfer pembayaran manual
    Route::post('payments/{payment}/upload-proof', [\App\Http\Controllers\API\PaymentController::class, 'uploadProofOfPayment']);

    // 🔐 ADMIN ROUTES
    Route::middleware('admin')->group(function () {
        // Produk & Kategori
        Route::apiResource('products', ProductController::class)->except(['index', 'show']);
        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);

        // Banner
        Route::prefix('admin')->group(function () {
            Route::get('banner', [BannerController::class, 'index']);
            Route::post('banner', [BannerController::class, 'store']);
            Route::get('banner/{id}', [BannerController::class, 'show']);
            Route::put('banner/{id}', [BannerController::class, 'update']);
            Route::delete('banner/{id}', [BannerController::class, 'destroy']);

            // Rekomendasi Produk
            Route::get('recommendations', [RecommendationController::class, 'index']);
            Route::post('recommendations', [RecommendationController::class, 'store']);
            Route::delete('recommendations/{product}', [RecommendationController::class, 'destroy']);
        });

        // Chat Admin
        Route::get('/chats', [\App\Http\Controllers\Admin\ChatController::class, 'index']);
        Route::get('/chats/{chat}/messages', [\App\Http\Controllers\Admin\ChatController::class, 'messages']);
        Route::post('/chats/{chat}/messages', [\App\Http\Controllers\Admin\ChatController::class, 'storeMessage']);
    });

    // Wishlist Routes
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{id}', [WishlistController::class, 'destroy']);
    Route::get('/wishlist/check-availability', [WishlistController::class, 'checkProductAvailability']);

    // Order Tracking Routes
    Route::get('/orders/{order}/tracking', [OrderTrackingController::class, 'getTracking']);
    Route::post('/orders/{order}/tracking', [OrderTrackingController::class, 'updateTracking']);
    Route::post('/orders/{order}/tracking/sync', [OrderTrackingController::class, 'syncWithShippingProvider']);

    Route::post('/user/fcm-token', [ProfileController::class, 'updateFcmToken']);
});

// Payment Webhook Route (tidak perlu auth karena dipanggil oleh payment gateway)
Route::post('/payment/webhook', [PaymentController::class, 'handleWebhook']);

// Route untuk mengecek data gambar
Route::get('/check-images', function () {
    return response()->json([
        'products' => DB::table('products')->select('id', 'name', 'image')->get(),
        'categories' => DB::table('categories')->select('id', 'name', 'image')->get(),
        'banners' => DB::table('banners')->select('id', 'title', 'image')->get()
    ]);
});

// Route untuk mengecek ketersediaan gambar
Route::get('/check-image/{type}/{filename}', function ($type, $filename) {
    $path = public_path("images/{$type}/{$filename}");
    if (file_exists($path)) {
        return response()->json([
            'status' => 'success',
            'message' => 'File ditemukan',
            'path' => "images/{$type}/{$filename}",
            'size' => filesize($path),
            'url' => url("images/{$type}/{$filename}")
        ]);
    }
    return response()->json([
        'status' => 'error',
        'message' => 'File tidak ditemukan',
        'path' => "images/{$type}/{$filename}"
    ], 404);
});

Route::middleware('auth:sanctum')->post('/user/change-password', [App\Http\Controllers\AuthController::class, 'changePassword']);

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index']);
    Route::get('/customers', [\App\Http\Controllers\Admin\CustomerController::class, 'index']);
    Route::get('/customers/{id}', [\App\Http\Controllers\Admin\CustomerController::class, 'show']);
    Route::get('/reports/sales', [\App\Http\Controllers\Admin\ReportController::class, 'sales']);
    Route::get('/reports/products', [\App\Http\Controllers\Admin\ReportController::class, 'products']);
    Route::get('/reports/customers', [\App\Http\Controllers\Admin\ReportController::class, 'customers']);
    Route::get('/reports/finance', [\App\Http\Controllers\Admin\ReportController::class, 'finance']);
    
    // Admin Products Routes
    Route::get('/products', [\App\Http\Controllers\Admin\ProductController::class, 'index']);
    Route::post('/products', [\App\Http\Controllers\Admin\ProductController::class, 'store']);
    Route::get('/products/{id}', [\App\Http\Controllers\Admin\ProductController::class, 'show']);
    Route::put('/products/{id}', [\App\Http\Controllers\Admin\ProductController::class, 'update']);
    Route::post('/products/{id}', [\App\Http\Controllers\Admin\ProductController::class, 'update']);
    Route::delete('/products/{id}', [\App\Http\Controllers\Admin\ProductController::class, 'destroy']);
    Route::post('/products/bulk-delete', [\App\Http\Controllers\Admin\ProductController::class, 'bulkDelete']);
    
    // Admin Orders Routes
    Route::get('/orders', [\App\Http\Controllers\Admin\OrderController::class, 'index']);
    Route::get('/orders/{id}', [\App\Http\Controllers\Admin\OrderController::class, 'show']);
    Route::put('/orders/{id}/status', [\App\Http\Controllers\Admin\OrderController::class, 'updateStatus']);
    Route::post('/orders/{id}/confirm', [\App\Http\Controllers\Admin\OrderController::class, 'confirm']);
    Route::post('/orders/{id}/cancel', [\App\Http\Controllers\Admin\OrderController::class, 'cancel']);
    
    // Admin Payment Methods Routes
    Route::get('/payment-methods', [\App\Http\Controllers\Admin\PaymentMethodController::class, 'index']);
    Route::get('/payment-methods/{id}', [\App\Http\Controllers\Admin\PaymentMethodController::class, 'show']);
    Route::post('/payment-methods', [\App\Http\Controllers\Admin\PaymentMethodController::class, 'store']);
    Route::put('/payment-methods/{id}', [\App\Http\Controllers\Admin\PaymentMethodController::class, 'update']);
    Route::delete('/payment-methods/{id}', [\App\Http\Controllers\Admin\PaymentMethodController::class, 'destroy']);
    Route::post('/payment-methods/{id}/toggle', [\App\Http\Controllers\Admin\PaymentMethodController::class, 'toggleActive']);
});

Route::middleware('auth:sanctum')->get('/debug/me', function (Request $request) {
    return response()->json($request->user());
});

Route::get('/reports/products', [\App\Http\Controllers\Admin\ReportController::class, 'products']);
Route::get('/reports/customers', [\App\Http\Controllers\Admin\ReportController::class, 'customers']);

Route::middleware('auth:api')->group(function () {
    Route::get('/chat', [\App\Http\Controllers\API\ChatController::class, 'index']);
    Route::get('/chat/{chat}/messages', [\App\Http\Controllers\API\ChatController::class, 'messages']);
    Route::post('/chat/{chat}/messages', [\App\Http\Controllers\API\ChatController::class, 'storeMessage']);
});

// Payment Gateway (Midtrans)
Route::middleware('auth:sanctum')->post('/payments/midtrans', [\App\Http\Controllers\API\PaymentController::class, 'payWithMidtrans']);
Route::post('/payments/midtrans/callback', [\App\Http\Controllers\API\PaymentController::class, 'handleMidtransCallback']);

// Upload foto review produk
Route::post('reviews/upload-image', [\App\Http\Controllers\API\ProductReviewController::class, 'uploadReviewImage']);

isi dari routes/web.php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\AuthController;

// HOME
//Route::get('/', [HomeController::class, 'index'])->name('users.home');

// CART (hanya bisa diakses jika login)
//Route::resource('cart', CartController::class)->only([
    //'index', 'store', 'destroy'
//])->middleware('auth');

// AUTH: Web-based Login/Register
Route::get('/register', [AuthController::class, 'showRegisterForm'])->name('register.form');
Route::post('/register', [AuthController::class, 'registerWeb'])->name('register');

Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login.form');
Route::post('/login', [AuthController::class, 'loginWeb'])->name('login');

Route::post('/logout', [AuthController::class, 'logoutWeb'])->middleware('auth')->name('logout');

Route::get('/profile', [AuthController::class, 'profile'])->middleware('auth');

// Dashboard setelah login
Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware('auth');


isi dari config/cors.php
<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:8100', // Ionic development server
        'http://localhost:4200', // Angular development server
        'http://localhost:3000', // Alternative development port
        'https://your-frontend-domain.com', // Production frontend domain
        'https://www.your-frontend-domain.com', // Production with www
        'capacitor://localhost', // Capacitor local
        'ionic://localhost', // Ionic local
        'http://localhost', // Local development
        'https://localhost', // Local development HTTPS
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];


