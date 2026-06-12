import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  success(message: string, title: string = 'Success') {
    return Swal.fire({
      icon: 'success',
      title,
      text: message,
      timer: 2000,
      showConfirmButton: false
    });
  }

  error(message: string, title: string = 'Error') {
    return Swal.fire({
      icon: 'error',
      title,
      text: message
    });
  }

  warning(message: string, title: string = 'Warning') {
    return Swal.fire({
      icon: 'warning',
      title,
      text: message
    });
  }

  confirm(
    title: string,
    message: string,
    confirmText: string = 'Yes',
    cancelText: string = 'No'
  ) {
    return Swal.fire({
      title,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#2563eb'
    });
  }
}