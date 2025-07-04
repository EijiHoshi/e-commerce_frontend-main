import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss']
})
export class CartPage implements OnInit, OnDestroy {
  cartItems: any[] = [];
  loading = true;
  total = 0;

  showDeleteModal = false;
  itemToDelete: any = null;

  constructor(
    public apiService: ApiService,
    private toastController: ToastController,
    private router: Router,
    private location: Location,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    this.fetchCart();
    this.renderer.addClass(document.body, 'cart-page');
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'cart-page');
  }

  fetchCart() {
    this.loading = true;
    this.apiService.getCart().subscribe({
      next: (res) => {
        this.cartItems = Array.isArray(res) ? res : (res.items || res.cart || []);
        this.calculateTotal();
        this.loading = false;
      },
      error: () => {
        this.cartItems = [];
        this.total = 0;
        this.loading = false;
      }
    });
  }

  calculateTotal() {
    this.total = this.cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1), 0);
  }

  async updateQty(item: any, qty: number) {
    if (qty < 1) return;
    const oldQty = item.quantity;
    item.quantity = qty;
    this.calculateTotal();
    this.apiService.updateCartQty(item.id, qty).subscribe({
      next: () => { },
      error: async () => {
        item.quantity = oldQty;
        this.calculateTotal();
        const toast = await this.toastController.create({
          message: 'Gagal update jumlah produk',
          duration: 1500,
          color: 'danger',
          position: 'top'
        });
        toast.present();
      }
    });
  }

  removeItem(item: any) {
    this.showDeleteModal = true;
    this.itemToDelete = item;
  }

  confirmDelete() {
    if (!this.itemToDelete) return;
    this.loading = true;
    this.apiService.removeCartItem(this.itemToDelete.id).subscribe({
      next: () => {
        this.fetchCart();
        this.showDeleteModal = false;
        this.itemToDelete = null;
      },
      error: () => {
        this.loading = false;
        this.showDeleteModal = false;
        this.itemToDelete = null;
      }
    });
  }

  checkout() {
    if (this.cartItems.length === 0) {
      this.toastController.create({
        message: 'Keranjang kosong!',
        duration: 1500,
        color: 'danger',
        position: 'top'
      }).then(toast => toast.present());
      return;
    }
    this.router.navigate(['/checkout']);
  }

  decrementQty(item: any) {
    if (item.quantity > 1) {
      this.updateQty(item, item.quantity - 1);
    }
  }

  incrementQty(item: any) {
    this.updateQty(item, item.quantity + 1);
  }

  openDeleteModal(item: any) {
    this.itemToDelete = item;
    this.showDeleteModal = true;
  }

  goBack() {
    this.location.back();
  }
} 