import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AdminAuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage)
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.page').then(m => m.RegisterPage)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/auth/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./pages/auth/reset-password/reset-password.page').then(m => m.ResetPasswordPage)
      },
      {
        path: 'verify-email',
        loadComponent: () => import('./pages/auth/verify-email/verify-email.page').then(m => m.VerifyEmailPage)
      }
    ]
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'category/:name',
    loadComponent: () => import('./pages/category/category.page').then(m => m.CategoryPage)
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.page').then(m => m.CartPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./pages/product-detail/product-detail.page').then(m => m.ProductDetailPage)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.page').then(m => m.CheckoutPage)
  },
  {
    path: 'order-history',
    loadComponent: () => import('./pages/order-history/order-history.page').then(m => m.OrderHistoryPage)
  },
  {
    path: 'order-detail/:id',
    loadComponent: () => import('./pages/order-detail/order-detail.page').then(m => m.OrderDetailPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage)
  },
  {
    path: 'password-manager',
    loadComponent: () => import('./pages/password-manager/password-manager.page').then(m => m.PasswordManagerPage)
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./pages/wishlist/wishlist.page').then(m => m.WishlistPage)
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notifications.page').then(m => m.NotificationsPage)
  },
  {
    path: 'leave-review/:orderId',
    loadComponent: () => import('./pages/leave-review/leave-review.page').then(m => m.LeaveReviewPage)
  },
  // Admin Routes
  {
    path: 'admin',
    canActivate: [AdminAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/dashboard.page').then(m => m.DashboardPage)
      },
      {
        path: 'produk',
        loadComponent: () => import('./pages/admin/produk/produk.page').then(m => m.ProdukPage)
      },
      {
        path: 'stok',
        loadComponent: () => import('./pages/admin/stok/stok.page').then(m => m.StokPage)
      },
      {
        path: 'penjualan',
        loadComponent: () => import('./pages/admin/penjualan/penjualan.page').then(m => m.PenjualanPage)
      },
      {
        path: 'pelanggan',
        loadComponent: () => import('./pages/admin/pelanggan/pelanggan.page').then(m => m.PelangganPage)
      },
      {
        path: 'laporan',
        children: [
          { path: '', redirectTo: 'penjualan', pathMatch: 'full' },
          { path: 'penjualan', loadComponent: () => import('./pages/admin/laporan/laporan.page').then(m => m.LaporanPage) },
          { path: 'produk', loadComponent: () => import('./pages/admin/laporan/laporan-produk.page').then(m => m.LaporanProdukPage) },
          { path: 'pelanggan', loadComponent: () => import('./pages/admin/laporan/laporan-pelanggan.page').then(m => m.LaporanPelangganPage) },
          { path: 'keuangan', loadComponent: () => import('./pages/admin/laporan/laporan-keuangan.page').then(m => m.LaporanKeuanganPage) },
        ]
      },
      {
        path: 'tambah-produk',
        loadComponent: () => import('./pages/admin/tambah-produk/tambah-produk.page').then(m => m.TambahProdukPage)
      },
      {
        path: 'metode-pembayaran',
        loadComponent: () => import('./pages/admin/metode-pembayaran/metode-pembayaran.page').then(m => m.MetodePembayaranPage)
      },
      {
        path: 'chat-support',
        loadComponent: () => import('./pages/admin/chat-admin/chat-admin.page').then(m => m.ChatAdminPage)
      }
    ]
  },
  {
    path: 'chat',
    loadComponent: () => import('./pages/chat/chat.page').then(m => m.ChatPage)
  },
  {
    path: 'backend-test',
    loadComponent: () => import('./components/backend-test/backend-test.component').then(m => m.BackendTestComponent)
  },
  {
    path: 'login-debug',
    loadComponent: () => import('./components/login-debug/login-debug.component').then(m => m.LoginDebugComponent)
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
