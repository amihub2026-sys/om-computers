import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Category
} from '../../core/interfaces/category.interface';

import {
  CategoryService
} from '../../core/services/category.service';

@Component({
  selector: 'app-manage-categories',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './manage-categories.html',
  styleUrls: ['./manage-categories.css']
})
export class ManageCategoriesComponent implements OnInit {

  categories: Category[] = [];

  showForm = false;
  isEditing = false;
  isLoading = false;

  selectedCategory: Category | null = null;

  categoryName = '';

  specifications: string[] = [
    ''
  ];

  editingSpecificationIndex: number | null = null;


  constructor(
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    this.loadCategories();

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

          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error(
            'Category load error:',
            err
          );

        }

      });

  }


  // ==========================================
  // OPEN ADD CATEGORY
  // ==========================================

  openAddCategory(): void {

    this.showForm = true;

    this.isEditing = false;

    this.selectedCategory = null;

    this.categoryName = '';

    this.specifications = [
      ''
    ];

    this.editingSpecificationIndex = 0;

    this.cdr.detectChanges();

  }


  // ==========================================
  // OPEN EDIT CATEGORY
  // ==========================================

  openEditCategory(
    category: Category
  ): void {

    this.showForm = true;

    this.isEditing = true;

    this.selectedCategory =
      category;

    this.categoryName =
      category.name || '';

    this.specifications =
      category.specifications?.length
        ? category.specifications.map(
            item => item.name
          )
        : [''];

    this.editingSpecificationIndex =
      null;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    this.cdr.detectChanges();

  }


  // ==========================================
  // TRACK SPECIFICATION ROW
  // ==========================================

  trackByIndex(
    index: number
  ): number {

    return index;

  }


  // ==========================================
  // ADD SPECIFICATION
  // ==========================================

  addSpecification(): void {

    this.specifications.push('');

    this.editingSpecificationIndex =
      this.specifications.length - 1;

    this.cdr.detectChanges();

  }


  // ==========================================
  // EDIT SPECIFICATION
  // ==========================================

  editSpecification(
    index: number
  ): void {

    this.editingSpecificationIndex =
      index;

    this.cdr.detectChanges();

  }


  // ==========================================
  // SAVE INDIVIDUAL SPECIFICATION
  // ==========================================

  saveSpecification(
    index: number
  ): void {

    const value =
      this.specifications[index]
        ?.trim();

    if (!value) {

      alert(
        'Specification name is required'
      );

      return;

    }


    const duplicate =
      this.specifications.some(
        (item, i) =>
          i !== index &&
          item.trim().toLowerCase() ===
          value.toLowerCase()
      );


    if (duplicate) {

      alert(
        'Specification already exists'
      );

      return;

    }


    this.specifications[index] =
      value;

    this.editingSpecificationIndex =
      null;

    this.cdr.detectChanges();

  }


  // ==========================================
  // CANCEL SPECIFICATION EDIT
  // ==========================================

  cancelSpecificationEdit(
    index: number
  ): void {

    if (
      !this.specifications[index]
        ?.trim()
    ) {

      if (
        this.specifications.length > 1
      ) {

        this.specifications.splice(
          index,
          1
        );

      }

    }

    this.editingSpecificationIndex =
      null;

    this.cdr.detectChanges();

  }


  // ==========================================
  // REMOVE SPECIFICATION
  // ==========================================

  removeSpecification(
    index: number
  ): void {

    const value =
      this.specifications[index];

    if (
      value &&
      value.trim()
    ) {

      const confirmed =
        confirm(
          `Delete specification "${value}"?`
        );

      if (!confirmed) {

        return;

      }

    }


    if (
      this.specifications.length === 1
    ) {

      this.specifications[0] = '';

      this.editingSpecificationIndex =
        0;

      return;

    }


    this.specifications.splice(
      index,
      1
    );


    if (
      this.editingSpecificationIndex ===
      index
    ) {

      this.editingSpecificationIndex =
        null;

    }


    if (
      this.editingSpecificationIndex !==
        null &&
      this.editingSpecificationIndex >
        index
    ) {

      this.editingSpecificationIndex--;

    }


    this.cdr.detectChanges();

  }


  // ==========================================
  // CANCEL CATEGORY FORM
  // ==========================================

  cancelForm(): void {

    this.showForm = false;

    this.isEditing = false;

    this.selectedCategory = null;

    this.categoryName = '';

    this.specifications = [
      ''
    ];

    this.editingSpecificationIndex =
      null;

    this.cdr.detectChanges();

  }


  // ==========================================
  // SAVE CATEGORY
  // ==========================================

  saveCategory(): void {

    if (
      !this.categoryName.trim()
    ) {

      alert(
        'Category name is required'
      );

      return;

    }


    const cleanSpecifications =
      this.specifications
        .map(item =>
          item.trim()
        )
        .filter(item =>
          item !== ''
        );


    if (
      cleanSpecifications.length === 0
    ) {

      alert(
        'Please add at least one specification'
      );

      return;

    }


    const normalized =
      cleanSpecifications.map(
        item =>
          item.toLowerCase()
      );


    const unique =
      new Set(normalized);


    if (
      unique.size !==
      normalized.length
    ) {

      alert(
        'Duplicate specifications are not allowed'
      );

      return;

    }


    this.isLoading = true;


    const data = {

      name:
        this.categoryName.trim(),

      specifications:
        cleanSpecifications

    };


    // ========================================
    // UPDATE CATEGORY
    // ========================================

    if (
      this.isEditing &&
      this.selectedCategory
    ) {

      this.categoryService
        .updateCategory(
          this.selectedCategory._id,
          data
        )
        .subscribe({

          next: () => {

            this.isLoading = false;

            alert(
              'Category updated successfully'
            );

            this.cancelForm();

            this.loadCategories();

          },

          error: (err) => {

            this.isLoading = false;

            alert(
              err.error?.message ||
              'Category update failed'
            );

            console.error(
              'Category update error:',
              err
            );

            this.cdr.detectChanges();

          }

        });


      return;

    }


    // ========================================
    // CREATE CATEGORY
    // ========================================

    this.categoryService
      .createCategory(data)
      .subscribe({

        next: () => {

          this.isLoading = false;

          alert(
            'Category created successfully'
          );

          this.cancelForm();

          this.loadCategories();

        },

        error: (err) => {

          this.isLoading = false;

          alert(
            err.error?.message ||
            'Category create failed'
          );

          console.error(
            'Category create error:',
            err
          );

          this.cdr.detectChanges();

        }

      });

  }


  // ==========================================
  // DELETE CATEGORY
  // ==========================================

  deleteCategory(
    category: Category
  ): void {

    const confirmed =
      confirm(
        `Delete category "${category.name}"?`
      );


    if (!confirmed) {

      return;

    }


    this.categoryService
      .deleteCategory(
        category._id
      )
      .subscribe({

        next: () => {

          alert(
            'Category deleted successfully'
          );

          this.loadCategories();

        },

        error: (err) => {

          alert(
            err.error?.message ||
            'Category delete failed'
          );

          console.error(
            'Category delete error:',
            err
          );

        }

      });

  }

}