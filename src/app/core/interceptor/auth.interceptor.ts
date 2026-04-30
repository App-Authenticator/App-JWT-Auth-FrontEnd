import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  
  // Solo buscar el token si estamos en el navegador
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('jwt');
    
    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(authReq);
    }
  }

  return next(req);
};
