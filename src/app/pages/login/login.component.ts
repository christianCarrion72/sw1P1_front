import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.component.html',

})
export class LoginComponent {
  email: string = '';  // Cambia 'username' por 'email'
  password: string = '';
  errorMessage: string = '';

  constructor(private apiService: ApiService, private router: Router) {}

    onLogin(): void {
      // Verifica que el email y el password no estén vacíos
      if (!this.email || !this.password) {
        this.errorMessage = 'Por favor, ingrese su correo electrónico y contraseña';
        return;
      }

      // Llama al servicio de autenticación para iniciar sesión
      this.apiService.login(this.email, this.password).subscribe({
        next: () => {
          // En caso de éxito, redirige al cliente
          this.router.navigate(['/client']);
        },
        error: (err) => {
          // En caso de error, muestra un mensaje
          console.error('Error en el login:', err);
          this.errorMessage = 'Email o contraseña incorrectos';
        }
      });
    }
}
