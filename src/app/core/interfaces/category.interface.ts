export interface Specification {
  _id?: string;
  categoryId?: string;
  name: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  isActive: boolean;
  specifications: Specification[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category[];
}

export interface SingleCategoryResponse {
  success: boolean;
  message: string;
  data: Category;
}