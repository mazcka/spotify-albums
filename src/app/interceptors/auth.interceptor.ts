import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, from } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  // Only intercept Spotify API requests
  if (!req.url.includes('api.spotify.com')) {
    return next(req);
  }

  // Check if token is expired or missing
  const token = authService.getAccessToken();
  const expiry = authService.getTokenExpiry();
  const isExpired = !expiry || Date.now() >= expiry;

  // If token is missing or expired, try to refresh
  if (!token || isExpired) {
    return from(authService.refreshAccessToken()).pipe(
      switchMap(newToken => {
        if (!newToken) {
          return throwError(() => new Error('Authentication required'));
        }

        // Retry request with new token
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`
          }
        });

        return next(clonedReq).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              authService.logout();
            }
            return throwError(() => error);
          })
        );
      }),
      catchError(error => {
        authService.logout();
        return throwError(() => error);
      })
    );
  }

  // Add token to request
  const clonedReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401, token might be invalid, try refresh
      if (error.status === 401) {
        return from(authService.refreshAccessToken()).pipe(
          switchMap(newToken => {
            if (!newToken) {
              authService.logout();
              return throwError(() => new Error('Authentication required'));
            }

            // Retry with new token
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });

            return next(retryReq);
          }),
          catchError(refreshError => {
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};

