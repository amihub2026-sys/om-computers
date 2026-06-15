import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/interfaces/product.interface';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct {
  selectedImage: File | null = null;

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

  constructor(private productService: ProductService) {}

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

    this.productService.addProduct(formData).subscribe({
      next: () => {
        alert('Product saved successfully');

        this.product = {
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

        this.selectedImage = null;
      },
      error: (err) => {
        console.error(err);
        alert('Product save failed');
      }
    });
  }
}