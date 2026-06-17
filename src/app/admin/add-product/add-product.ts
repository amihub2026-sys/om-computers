import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/interfaces/product.interface';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct implements OnInit {
  selectedImage: File | null = null;
  productId: string | null = null;
  isEditMode = false;

  product: Product = {
    name: '',
    category: '',
    brand: '',
    model: '',
    price: 0,
    discountPrice: 0,
    stock: 0,
    warranty: '',
    description: '',
    image: ''
  };

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');

    if (this.productId) {
      this.isEditMode = true;
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: string) {
    this.productService.getProductById(id).subscribe({
      next: (res: any) => {
        this.product = res.data || res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to load product');
        this.router.navigate(['/admin/products']);
        this.cdr.detectChanges();
      }
    });
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
    }
  }

  saveProduct() {
    const formData = new FormData();

    formData.append('name', this.product.name);
    formData.append('category', this.product.category);
    formData.append('brand', this.product.brand);
    formData.append('model', this.product.model || '');
    formData.append('price', String(this.product.price));
    formData.append('discountPrice', String(this.product.discountPrice || 0));
    formData.append('stock', String(this.product.stock));
    formData.append('warranty', this.product.warranty || '');
    formData.append('description', this.product.description || '');

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    if (this.isEditMode && this.productId) {
      this.productService.updateProduct(this.productId, formData).subscribe({
        next: () => {
          alert('Product updated successfully');
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          console.error(err);
          alert('Product update failed');
        }
      });
    } else {
      this.productService.addProduct(formData).subscribe({
        next: () => {
          alert('Product saved successfully');
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          console.error(err);
          alert('Product save failed');
        }
      });
    }
  }
}