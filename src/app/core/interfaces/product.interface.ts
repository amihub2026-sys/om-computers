export interface Product {
  name: string;
  category: string;
  brand: string;
  model?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  warranty?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}