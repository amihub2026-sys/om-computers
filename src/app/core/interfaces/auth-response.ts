export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  data?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}