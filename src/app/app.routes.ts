import { Routes } from '@angular/router';

import { WebsiteLayout } from './layouts/website-layout/website-layout/website-layout';

import { Home } from './features/home/home/home';
import { ProductList } from './features/products/product-list/product-list';
import { ProductDetails } from './features/products/product-details/product-details';
import { ServiceList } from './features/services/service-list/service-list';
import { ServiceDetails } from './features/services/service-details/service-details';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { ServiceBooking } from './features/services/service-booking/service-booking';
import { BookingSuccess } from './features/services/booking-success/booking-success';
import { MyBookings } from './features/services/my-bookings/my-bookings';
import { UserDashboard } from './features/user/user-dashboard/user-dashboard';
import { About } from './features/about/about/about';
import { Contact } from './features/contact/contact/contact';
import { Cart } from './features/cart/cart/cart';
import { Checkout } from './features/checkout/checkout/checkout';
import { OrderSuccess } from './features/orders/order-success/order-success';
import { MyOrders } from './features/orders/my-orders/my-orders';

import { AdminLogin } from './admin/admin-login/admin-login';
import { AdminLayout } from './admin/admin-layout/admin-layout';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard';
import { ManageProducts } from './admin/manage-products/manage-products';
import { ManageServices } from './admin/manage-services/manage-services';
import { ManageOrders } from './admin/manage-orders/manage-orders';
import { ManageBookings } from './admin/manage-bookings/manage-bookings';
import { AddProduct } from './admin/add-product/add-product';
import { AddService } from './admin/add-service/add-service';
import { ManageCustomers } from './admin/manage-customers/manage-customers';

export const routes: Routes = [
  {
    path: '',
    component: WebsiteLayout,
    children: [
      { path: '', component: Home },
      { path: 'products', component: ProductList },
      { path: 'products/:id', component: ProductDetails },
      { path: 'services', component: ServiceList },
      { path: 'services/:id', component: ServiceDetails },
      { path: 'login', component: Login },
      { path: 'register', component: Register },
      { path: 'service-booking/:id', component: ServiceBooking },
      { path: 'booking-success', component: BookingSuccess },
      { path: 'my-bookings', component: MyBookings },
      { path: 'dashboard', component: UserDashboard },
      { path: 'about', component: About },
      { path: 'contact', component: Contact },
      { path: 'cart', component: Cart },
      { path: 'checkout', component: Checkout },
      { path: 'order-success', component: OrderSuccess },
      { path: 'my-orders', component: MyOrders },
    ],
  },

  {
    path: 'admin/login',
    component: AdminLogin,
  },

  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'products', component: ManageProducts },
      { path: 'products/add', component: AddProduct },
      { path: 'services', component: ManageServices },
      { path: 'services/add', component: AddService },
      { path: 'orders', component: ManageOrders },
      { path: 'bookings', component: ManageBookings },
      { path: 'customers', component: ManageCustomers },
    ],
  },
];