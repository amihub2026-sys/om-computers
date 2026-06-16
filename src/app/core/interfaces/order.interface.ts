export interface OrderProduct {
  productName: string;
  quantity: number;
  price: number;
}

export interface OrderItem {
  _id: string;
  userId: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  products: OrderProduct[];
  totalAmount: number;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: OrderItem[];
}

export interface SingleOrderResponse {
  success: boolean;
  message: string;
  data: OrderItem;
}

export interface PlaceOrderRequest {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  paymentMethod?: string;
}