export interface Service {
  _id?: string;
  name: string;
  category: string;
  price: number;
  duration?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceResponse {
  success: boolean;
  message: string;
  data: Service[];
}

export interface SingleServiceResponse {
  success: boolean;
  message: string;
  data: Service;
}

export interface ServiceBookingForm {
  customerName: string;
  phone: string;
  email: string;
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
  address: string;
  issueDescription: string;
}