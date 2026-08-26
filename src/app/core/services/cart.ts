import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Cart {

  private storageKey = 'om_computers_cart';

  constructor() {}

  getCartItems(): Observable<any> {
    const items = this.getStoredCart();

    return of({
      success: true,
      message: 'Cart fetched successfully',
      data: items
    });
  }

  addToCart(data: any): Observable<any> {
    const items = this.getStoredCart();

    const existingItem = items.find(
      (item: any) => item.productId === data.productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.total =
        Number(existingItem.price) * Number(existingItem.quantity);
    } else {
      items.push({
        _id: this.generateId(),
        userId: '',
        customerName: '',
        phone: '',
        productId: data.productId,
        productName: data.productName,
        image: data.image || '',
        price: Number(data.price || 0),
        quantity: Number(data.quantity || 1),
        total: Number(data.price || 0) * Number(data.quantity || 1)
      });
    }

    this.saveCart(items);

    return of({
      success: true,
      message: 'Product added to cart',
      data: items
    });
  }

  updateCartItem(id: string, data: any): Observable<any> {
    const items = this.getStoredCart();

    const item = items.find(
      (cartItem: any) => cartItem._id === id
    );

    if (item) {
      item.quantity = Number(data.quantity || 1);
      item.total = Number(item.price) * Number(item.quantity);

      this.saveCart(items);
    }

    return of({
      success: true,
      message: 'Cart updated',
      data: items
    });
  }

  deleteCartItem(id: string): Observable<any> {
    const items = this.getStoredCart().filter(
      (item: any) => item._id !== id
    );

    this.saveCart(items);

    return of({
      success: true,
      message: 'Cart item removed',
      data: items
    });
  }

  clearCart(): void {
    localStorage.removeItem(this.storageKey);
  }

  private getStoredCart(): any[] {
    const cart = localStorage.getItem(this.storageKey);

    if (!cart) {
      return [];
    }

    try {
      return JSON.parse(cart);
    } catch {
      return [];
    }
  }

  private saveCart(items: any[]): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(items)
    );
  }

  private generateId(): string {
    return Date.now().toString() +
      Math.random().toString(36).substring(2, 8);
  }
}