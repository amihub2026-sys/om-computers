export interface Inventory {
  _id: string;

  itemName: string;

  category: string;

  brand: string;

  model: string;

  sku: string;

  openingStock: number;

  currentStock: number;

  purchasePrice: number;

  sellingPrice: number;

  minimumStock: number;

  supplier: string;

  location: string;

  status:
    | 'In Stock'
    | 'Low Stock'
    | 'Out of Stock';

  notes: string;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;
}


export interface InventoryResponse {
  success: boolean;
  message: string;
  data: Inventory[];
}


export interface SingleInventoryResponse {
  success: boolean;
  message: string;
  data: Inventory;
}