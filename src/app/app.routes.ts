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
export const routes: Routes = [
  {
    path: '',
    component: WebsiteLayout,
    children: [
      {
        path: '',
        component: Home,
      },
       {
        path: 'products',
        component: ProductList,
      },
      {
  path: 'products/:id',
  component: ProductDetails,
},
{
  path: 'services',
  component: ServiceList,
},
{
  path: 'services/:id',
  component: ServiceDetails,
},
{
  path: 'login',
  component: Login,
},
{
  path: 'register',
  component: Register,
},
{
  path: 'service-booking/:id',
  component: ServiceBooking,
},
{
  path: 'booking-success',
  component: BookingSuccess,
},
{
  path: 'my-bookings',
  component: MyBookings,
},
{
  path: 'dashboard',
  component: UserDashboard,
},{
  path: 'about',
  component: About,
},{
  path: 'contact',
  component: Contact,
},
{
  path: 'cart',
  component: Cart,
},
{
  path: 'checkout',
  component: Checkout,
}
    ],
  },
];