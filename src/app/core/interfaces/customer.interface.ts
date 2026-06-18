export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerResponse {
  success: boolean;
  message: string;
  data: Customer[];
}