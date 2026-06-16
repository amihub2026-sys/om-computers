export interface CartItem {
  _id: string;
  userId: string;
  customerName: string;
  phone: string;
  productId?: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartResponse {
  success: boolean;
  message: string;
  data: CartItem[];
}

export interface SingleCartResponse {
  success: boolean;
  message: string;
  data: CartItem;
}

export interface AddCartRequest {
  customerName: string;
  phone: string;
  productId?: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

export interface UpdateCartRequest {
  quantity: number;
  total: number;
}