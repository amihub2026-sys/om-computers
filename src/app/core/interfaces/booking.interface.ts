export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled';

export interface Booking {
  _id: string;
  userId?: string;
  customerName: string;
  phone: string;
  email?: string;
  serviceName: string;
  bookingDate: string;
  bookingTime?: string;
  address?: string;
  issueDescription?: string;
  status: BookingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  data: Booking[];
}

export interface SingleBookingResponse {
  success: boolean;
  message: string;
  data: Booking;
}

export interface BookingStatusUpdateResponse {
  success: boolean;
  message: string;
  data: Booking;
}