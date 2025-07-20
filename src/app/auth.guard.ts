import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ApiService } from './services/api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private apiService: ApiService, private router: Router) {}

  canActivate(): boolean {
    if (this.apiService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['']); // Redirige al login si no está autenticado
      return false;
    }
  }
}
