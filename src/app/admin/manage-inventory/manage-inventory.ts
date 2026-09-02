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
  InventoryService
} from '../../core/services/inventory.service';

import {
  Inventory
} from '../../core/interfaces/inventory.interface';


@Component({
  selector: 'app-manage-inventory',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './manage-inventory.html',

  styleUrl: './manage-inventory.css'
})
export class ManageInventoryComponent
  implements OnInit {

  inventoryList: Inventory[] = [];

  showForm = false;

  isEditMode = false;

  selectedInventoryId: string | null = null;

  searchText = '';

  inventoryForm = {
    itemName: '',
    category: '',
    brand: '',
    model: '',
    sku: '',
    openingStock: 0,
    currentStock: 0,
    purchasePrice: 0,
    sellingPrice: 0,
    minimumStock: 5,
    supplier: '',
    location: '',
    notes: '',
    isActive: true
  };


  constructor(
    private inventoryService:
      InventoryService,

    private cdr:
      ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    this.loadInventory();
  }


  // ==========================================
  // LOAD INVENTORY
  // ==========================================

  loadInventory(): void {

    this.inventoryService
      .getInventory()
      .subscribe({

        next: (res) => {

          this.inventoryList =
            res.data || [];

          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error(
            'Failed to load inventory',
            err
          );

          alert(
            err.error?.message ||
            'Failed to load inventory'
          );

        }

      });

  }


  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  openAddForm(): void {

    this.isEditMode = false;

    this.selectedInventoryId = null;

    this.resetForm();

    this.showForm = true;

  }


  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  openEditForm(
    item: Inventory
  ): void {

    this.isEditMode = true;

    this.selectedInventoryId =
      item._id;

    this.inventoryForm = {

      itemName:
        item.itemName || '',

      category:
        item.category || '',

      brand:
        item.brand || '',

      model:
        item.model || '',

      sku:
        item.sku || '',

      openingStock:
        item.openingStock || 0,

      currentStock:
        item.currentStock || 0,

      purchasePrice:
        item.purchasePrice || 0,

      sellingPrice:
        item.sellingPrice || 0,

      minimumStock:
        item.minimumStock ?? 5,

      supplier:
        item.supplier || '',

      location:
        item.location || '',

      notes:
        item.notes || '',

      isActive:
        item.isActive ?? true
    };

    this.showForm = true;

  }


  // ==========================================
  // SAVE INVENTORY
  // ==========================================

  saveInventory(): void {

    if (
      !this.inventoryForm
        .itemName
        .trim()
    ) {

      alert(
        'Item name is required'
      );

      return;

    }


    if (
      !this.inventoryForm
        .sku
        .trim()
    ) {

      alert(
        'SKU / Item Code is required'
      );

      return;

    }


    if (
      this.inventoryForm.openingStock < 0 ||
      this.inventoryForm.currentStock < 0 ||
      this.inventoryForm.purchasePrice < 0 ||
      this.inventoryForm.sellingPrice < 0 ||
      this.inventoryForm.minimumStock < 0
    ) {

      alert(
        'Stock and price values cannot be negative'
      );

      return;

    }


    const data = {
      ...this.inventoryForm
    };


    // ========================================
    // UPDATE
    // ========================================

    if (
      this.isEditMode &&
      this.selectedInventoryId
    ) {

      this.inventoryService
        .updateInventory(
          this.selectedInventoryId,
          data
        )
        .subscribe({

          next: () => {

            alert(
              'Inventory updated successfully'
            );

            this.closeForm();

            this.loadInventory();

          },

          error: (err) => {

            console.error(err);

            alert(
              err.error?.message ||
              'Inventory update failed'
            );

          }

        });

      return;

    }


    // ========================================
    // CREATE
    // ========================================

    this.inventoryService
      .createInventory(data)
      .subscribe({

        next: () => {

          alert(
            'Inventory added successfully'
          );

          this.closeForm();

          this.loadInventory();

        },

        error: (err) => {

          console.error(err);

          alert(
            err.error?.message ||
            'Inventory creation failed'
          );

        }

      });

  }


  // ==========================================
  // DELETE INVENTORY
  // ==========================================

  deleteInventory(
    item: Inventory
  ): void {

    const confirmed =
      confirm(
        `Delete "${item.itemName}" from inventory?`
      );

    if (!confirmed) {
      return;
    }


    this.inventoryService
      .deleteInventory(
        item._id
      )
      .subscribe({

        next: () => {

          alert(
            'Inventory deleted successfully'
          );

          this.loadInventory();

        },

        error: (err) => {

          console.error(err);

          alert(
            err.error?.message ||
            'Inventory deletion failed'
          );

        }

      });

  }


  // ==========================================
  // FILTER INVENTORY
  // ==========================================

  get filteredInventory(): Inventory[] {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    if (!search) {

      return this.inventoryList;

    }


    return this.inventoryList
      .filter(item => {

        return (

          item.itemName
            ?.toLowerCase()
            .includes(search) ||

          item.category
            ?.toLowerCase()
            .includes(search) ||

          item.brand
            ?.toLowerCase()
            .includes(search) ||

          item.model
            ?.toLowerCase()
            .includes(search) ||

          item.sku
            ?.toLowerCase()
            .includes(search) ||

          item.supplier
            ?.toLowerCase()
            .includes(search)

        );

      });

  }


  // ==========================================
  // STATUS CLASS
  // ==========================================

  getStatusClass(
    status: string
  ): string {

    if (
      status === 'In Stock'
    ) {
      return 'status-in-stock';
    }

    if (
      status === 'Low Stock'
    ) {
      return 'status-low-stock';
    }

    return 'status-out-stock';

  }


  // ==========================================
  // CLOSE FORM
  // ==========================================

  closeForm(): void {

    this.showForm = false;

    this.isEditMode = false;

    this.selectedInventoryId = null;

    this.resetForm();

  }


  // ==========================================
  // RESET FORM
  // ==========================================

  resetForm(): void {

    this.inventoryForm = {

      itemName: '',

      category: '',

      brand: '',

      model: '',

      sku: '',

      openingStock: 0,

      currentStock: 0,

      purchasePrice: 0,

      sellingPrice: 0,

      minimumStock: 5,

      supplier: '',

      location: '',

      notes: '',

      isActive: true

    };

  }

}