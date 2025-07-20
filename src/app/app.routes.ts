import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
/* import { BoardComponent } from './pages/board/board.component'; */
import { WelcomeComponent } from './pages/client/welcome/welcome.component';
import { RoomsComponent } from './pages/client/rooms/rooms.component';

import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard } from './auth.guard';


export const routes: Routes = [
  {
    path: 'register', // Nueva ruta para el registro
    component: RegisterComponent,

  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',

  },
  {
    path: '',
    component: LoginComponent,
    pathMatch: 'full',
  },
  {
    path: 'client',
    component: WelcomeComponent,
    canActivate: [AuthGuard], // Protege esta ruta
  },
  {
    path: 'room/:code',
    component: RoomsComponent,
    canActivate: [AuthGuard],
  }, // Ruta dinámica para la sala
];
