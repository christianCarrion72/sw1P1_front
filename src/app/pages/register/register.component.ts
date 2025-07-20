import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service'; // Ajusta la ruta si es necesario
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private apiService: ApiService, private router: Router) {}

  onRegister(): void {
    // Verifica que los campos no estén vacíos
    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'Por favor, ingrese su nombre, correo electrónico y contraseña';
      return;
    }

    // Llama al servicio de registro
    this.apiService.register(this.name, this.email, this.password).subscribe({
      next: () => {
        // En caso de éxito, redirige al login o a la vista principal
        this.router.navigate(['']);
      },
      error: (err) => {
        // En caso de error, muestra un mensaje
        console.error('Error en el registro:', err);
        this.errorMessage = 'Error en el registro, por favor verifique sus datos';
      }
    });
  }
}
