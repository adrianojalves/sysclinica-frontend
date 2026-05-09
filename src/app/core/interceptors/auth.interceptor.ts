import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      // If we get a 401 and it's NOT a login attempt, we try to refresh
      if (error instanceof HttpErrorResponse && 
          error.status === 401 && 
          !authReq.url.includes('auth/login') &&
          !authReq.url.includes('auth/refresh')) {
        return authService.refreshToken().pipe(
          switchMap((response) => {
            // Success! We have a new token, now we retry the original request
            const newAuthReq = req.clone({
              setHeaders: { Authorization: `Bearer ${response.accessToken}` }
            });
            return next(newAuthReq);
          }),
          catchError((refreshError) => {
            // Refresh failed (token expired or invalid), logout the user
            authService.logout();
            location.reload(); // Redirects to login via AuthGuard
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};