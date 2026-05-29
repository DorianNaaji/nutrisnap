import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { StorageService } from '../services/storage.service';

export const profileExistsGuard: CanActivateFn = async () => {
  const storage = inject(StorageService);
  const router = inject(Router);
  
  const profile = await storage.getProfile();
  
  if (profile?.apiKey) {
    router.navigate(['/dashboard']);
    return false;
  }
  
  return true;
};
