export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'New' | 'Read' | 'Replied';
  createdAt: string;
  updatedAt?: string;
}