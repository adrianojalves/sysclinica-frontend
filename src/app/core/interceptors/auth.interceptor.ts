import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const isAuthRequest = req.url.includes('auth/login') || req.url.includes('auth/refresh');

  if (isAuthRequest) {
    return next(req);
  }

  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter((t) => t !== null),
      take(1),
      switchMap((newToken) => {
        const clonedReq = req.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` }
        });
        return next(clonedReq);
      })
    );
  }

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isAuthRequest
      ) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap((response) => {
              isRefreshing = false;
              refreshTokenSubject.next(response.accessToken);

              const retriedReq = req.clone({
                setHeaders: { Authorization: `Bearer ${response.accessToken}` }
              });
              return next(retriedReq);
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              refreshTokenSubject.next(null);
              authService.logout();
              location.reload(); // Redirects to login via AuthGuard
              return throwError(() => refreshError);
            })
          );
        } else {
          return refreshTokenSubject.pipe(
            filter((t) => t !== null),
            take(1),
            switchMap((newToken) => {
              const retriedReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              });
              return next(retriedReq);
            })
          );
        }
      }
      return throwError(() => error);
    })
  );
};