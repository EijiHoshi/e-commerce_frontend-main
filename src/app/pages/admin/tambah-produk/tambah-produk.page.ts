import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { HeaderComponent } from '../header.component';
import { SidebarComponent } from '../sidebar.component';

@Component({
  selector: 'app-tambah-produk',
  templateUrl: './tambah-produk.page.html',
  styleUrls: ['./tambah-produk.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    SidebarComponent,
  ]
})
export class TambahProdukPage implements OnInit {
  productForm: FormGroup;
  categories: any[] = [];
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  loading = false;
  submitting = false;
  isEditMode = false;
  productId: number | null = null;
  existingImagePath: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController
  ) {
    this.productForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category_id: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      description: [''],
      status: ['active', Validators.required]
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.checkEditMode();
  }

  checkEditMode() {
    // Cek apakah ada parameter edit di URL
    this.route.queryParams.subscribe(params => {
      if (params['edit']) {
        this.isEditMode = true;
        this.productId = parseInt(params['edit']);
        this.loadProductForEdit(this.productId);
      }
    });
  }

  loadProductForEdit(productId: number) {
    this.loading = true;
    this.apiService.getProduct(productId).subscribe({
      next: (response) => {
        const product = response;

        // Isi form dengan data produk
        this.productForm.patchValue({
          name: product.name,
          category_id: product.category_id,
          price: product.price,
          stock: product.stock,
          description: product.description || '',
          status: product.status || 'active'
        });

        // Set image preview jika ada
        if (product.image) {
          this.existingImagePath = product.image;
          this.imagePreview = this.apiService.getImageUrl(product.image);
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product for edit:', error);
        this.loading = false;
        this.showToast('Gagal memuat data produk untuk diedit', 'danger');
        this.router.navigate(['/admin/produk']);
      }
    });
  }

  loadCategories() {
    this.loading = true;
    this.apiService.getCategories().subscribe({
      next: (response) => {
        this.categories = Array.isArray(response) ? response : (response.data || []);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
        this.showToast('Gagal memuat kategori', 'danger');
      }
    });
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onImageDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedImage = files[0];

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview = null;
    this.existingImagePath = null;
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.submitting = true;

      const formData = new FormData();
      formData.append('name', this.productForm.get('name')?.value);
      formData.append('category_id', this.productForm.get('category_id')?.value);
      formData.append('price', this.productForm.get('price')?.value);
      formData.append('stock', this.productForm.get('stock')?.value);
      formData.append('description', this.productForm.get('description')?.value);
      formData.append('status', this.productForm.get('status')?.value);

      if (this.selectedImage) {
        formData.append('image', this.selectedImage);
      }

      if (this.isEditMode && this.productId) {
        // Update existing product
        console.log('Sending update request with data:', {
          productId: this.productId,
          formValues: this.productForm.value,
          isEditMode: this.isEditMode
        });

        this.apiService.updateProduct(this.productId, formData).subscribe({
          next: (response) => {
            console.log('Product updated successfully:', response);
            this.showToast('Produk berhasil diperbarui!');
            this.router.navigate(['/admin/produk']);
          },
          error: (error) => {
            console.error('Error updating product:', error);
            console.error('Error details:', error.error);
            console.error('Error status:', error.status);
            console.error('Error message:', error.message);
            this.submitting = false;

            // Tampilkan error yang lebih detail
            let errorMessage = 'Gagal memperbarui produk';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.error && typeof error.error === 'object') {
              const errors = Object.values(error.error).reduce((acc: string[], val: any) => {
                if (Array.isArray(val)) {
                  acc.push(...val);
                } else {
                  acc.push(val);
                }
                return acc;
              }, []);
              errorMessage = errors.length > 0 ? errors.join(', ') : errorMessage;
            }

            this.showToast(errorMessage, 'danger');
          }
        });
      } else {
        // Create new product
        this.apiService.createProduct(formData).subscribe({
          next: (response) => {
            console.log('Product created successfully:', response);
            this.showToast('Produk berhasil ditambahkan!');
            this.router.navigate(['/admin/produk']);
          },
          error: (error) => {
            console.error('Error creating product:', error);
            this.submitting = false;
            let errorMessage = 'Gagal menambahkan produk';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.error && typeof error.error === 'object') {
              const errors = Object.values(error.error).reduce((acc: string[], val: any) => {
                if (Array.isArray(val)) {
                  acc.push(...val);
                } else {
                  acc.push(val);
                }
                return acc;
              }, []);
              errorMessage = errors.length > 0 ? errors.join(', ') : errorMessage;
            }
            this.showToast(errorMessage, 'danger');
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/admin/produk']);
  }

  private markFormGroupTouched() {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} wajib diisi`;
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} minimal ${field.errors['minlength'].requiredLength} karakter`;
      }
      if (field.errors['min']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} minimal ${field.errors['min'].min}`;
      }
    }
    return '';
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top',
      buttons: [
        {
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}
