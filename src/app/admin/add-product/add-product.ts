import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  ProductService
} from '../../core/services/product.service';

import {
  CategoryService
} from '../../core/services/category.service';

import {
  Product
} from '../../core/interfaces/product.interface';

import {
  Category
} from '../../core/interfaces/category.interface';


@Component({
  selector: 'app-add-product',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct implements OnInit {

  selectedImage: File | null = null;

  productId: string | null = null;

  isEditMode = false;


  categories: Category[] = [];

  selectedCategoryId = '';

  selectedCategory: Category | null = null;


  specificationValues: {
    specificationId: string;
    name: string;
    value: string;
  }[] = [];


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
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    this.loadCategories();

    this.productId =
      this.route.snapshot.paramMap.get('id');


    if (this.productId) {

      this.isEditMode = true;

      this.loadProduct(
        this.productId
      );

    }

  }


  // ==========================================
  // LOAD CATEGORIES
  // ==========================================

  loadCategories(): void {

    this.categoryService
      .getCategories()
      .subscribe({

        next: (res) => {

          this.categories =
            res.data || [];


          if (
            this.isEditMode &&
            this.product.category
          ) {

            this.setCategoryFromProduct();

          }


          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error(
            'Failed to load categories',
            err
          );

          alert(
            'Failed to load categories'
          );

        }

      });

  }


  // ==========================================
  // CATEGORY CHANGE
  // ==========================================

  onCategoryChange(): void {

    this.selectedCategory =
      this.categories.find(
        category =>
          category._id ===
          this.selectedCategoryId
      ) || null;


    if (!this.selectedCategory) {

      this.product.category = '';

      this.specificationValues = [];

      return;

    }


    this.product.category =
      this.selectedCategory.name;


    this.specificationValues =
      (
        this.selectedCategory
          .specifications || []
      ).map(specification => ({

        specificationId:
          specification._id || '',

        name:
          specification.name,

        value: ''

      }));


    this.cdr.detectChanges();

  }


  // ==========================================
  // LOAD PRODUCT
  // ==========================================

  loadProduct(
    id: string
  ): void {

    this.productService
      .getProductById(id)
      .subscribe({

        next: (res: any) => {

          this.product =
            res.data || res;


          if (
            this.categories.length > 0
          ) {

            this.setCategoryFromProduct();

          }


          if (
            Array.isArray(
              (this.product as any)
                .specifications
            )
          ) {

            this.specificationValues =
              (this.product as any)
                .specifications
                .map(
                  (item: any) => ({

                    specificationId:
                      item.specificationId ||
                      item._id ||
                      '',

                    name:
                      item.name || '',

                    value:
                      item.value || ''

                  })
                );

          }


          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error(err);

          alert(
            'Failed to load product'
          );

          this.router.navigate([
            '/admin/products'
          ]);

          this.cdr.detectChanges();

        }

      });

  }


  // ==========================================
  // SET CATEGORY WHILE EDITING PRODUCT
  // ==========================================

  setCategoryFromProduct(): void {

    if (
      !this.product.category
    ) {

      return;

    }


    const category =
      this.categories.find(
        item =>
          item.name
            .toLowerCase() ===
          this.product.category
            .toLowerCase()
      );


    if (!category) {

      return;

    }


    this.selectedCategory =
      category;

    this.selectedCategoryId =
      category._id;


    const existingSpecifications =
      Array.isArray(
        (this.product as any)
          .specifications
      )
        ? (this.product as any)
            .specifications
        : [];


    this.specificationValues =
      (
        category.specifications || []
      ).map(specification => {

        const existing =
          existingSpecifications.find(
            (item: any) =>
              (
                item.specificationId ===
                specification._id
              ) ||
              (
                item.name
                  ?.toLowerCase() ===
                specification.name
                  .toLowerCase()
              )
          );


        return {

          specificationId:
            specification._id || '',

          name:
            specification.name,

          value:
            existing?.value || ''

        };

      });


    this.cdr.detectChanges();

  }


  // ==========================================
  // IMAGE
  // ==========================================

  onImageSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (
      input.files &&
      input.files.length > 0
    ) {

      this.selectedImage =
        input.files[0];

    }

  }


  // ==========================================
  // SAVE PRODUCT
  // ==========================================

  saveProduct(): void {

    if (
      !this.product.name.trim()
    ) {

      alert(
        'Product name is required'
      );

      return;

    }


    if (
      !this.selectedCategoryId ||
      !this.product.category
    ) {

      alert(
        'Please select a category'
      );

      return;

    }


    const formData =
      new FormData();


    formData.append(
      'name',
      this.product.name
    );


    formData.append(
      'category',
      this.product.category
    );


    formData.append(
      'categoryId',
      this.selectedCategoryId
    );


    formData.append(
      'brand',
      this.product.brand || ''
    );


    formData.append(
      'model',
      this.product.model || ''
    );


    formData.append(
      'price',
      String(
        this.product.price
      )
    );


    formData.append(
      'discountPrice',
      String(
        this.product.discountPrice || 0
      )
    );


    formData.append(
      'stock',
      String(
        this.product.stock
      )
    );


    formData.append(
      'warranty',
      this.product.warranty || ''
    );


    formData.append(
      'description',
      this.product.description || ''
    );


    // ========================================
    // DYNAMIC SPECIFICATIONS
    // ========================================

    formData.append(
      'specifications',
      JSON.stringify(
        this.specificationValues
      )
    );


    if (
      this.selectedImage
    ) {

      formData.append(
        'image',
        this.selectedImage
      );

    }


    // ========================================
    // EDIT PRODUCT
    // ========================================

    if (
      this.isEditMode &&
      this.productId
    ) {

      this.productService
        .updateProduct(
          this.productId,
          formData
        )
        .subscribe({

          next: () => {

            alert(
              'Product updated successfully'
            );

            this.router.navigate([
              '/admin/products'
            ]);

          },

          error: (err) => {

            console.error(err);

            alert(
              err.error?.message ||
              'Product update failed'
            );

          }

        });


      return;

    }


    // ========================================
    // ADD PRODUCT
    // ========================================

    this.productService
      .addProduct(
        formData
      )
      .subscribe({

        next: () => {

          alert(
            'Product saved successfully'
          );

          this.router.navigate([
            '/admin/products'
          ]);

        },

        error: (err) => {

          console.error(err);

          alert(
            err.error?.message ||
            'Product save failed'
          );

        }

      });

  }


  // ==========================================
  // CANCEL
  // ==========================================

  cancel(): void {

    this.router.navigate([
      '/admin/products'
    ]);

  }

}