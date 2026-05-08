import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If the signal says authenticated, allow access
  if (authService.isAuthenticated()) {
    return true;
  }

  // Otherwise, redirect to login
  router.navigate(['/login']);
  return false;
};