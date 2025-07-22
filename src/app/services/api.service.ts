import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface LoginResponse {
  token: string;
}
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  apiUrl: string = environment.apiUrl;
  tokenKey = 'authToken';

  constructor(private http: HttpClient, private router: Router) {}
  // Método para registrar un nuevo usuario
  register(name: string, email: string, password: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/auth/register`, { name, email, password })
      .pipe(
        tap((response) => {
          console.log('Usuario registrado:', response);
        }),
        catchError((err) => {
          console.error('Error en el registro:', err);
          throw err;
        })
      );
  }
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password }) // Cambia 'username' por 'email'
      .pipe(
        tap((response) => {
          if (response.token) {
            console.log(response.token);
            this.setToken(response.token);
          }
        }),
        catchError((err) => {
          console.error('Error en el login:', err);
          throw err;
        })
      );
  }
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
    /* if (typeof localStorage !== 'undefined') {

    }
    return null; */
  }
  // Guardar el token en el localStorage
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }
  /* private setToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  } */

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() < exp;
  }

  // Crear una sala con el encabezado de autenticación
  createRoom(createRoomDto: any): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getToken()}`
    );
    return this.http.post<any>(`${this.apiUrl}/rooms`, createRoomDto, {
      headers,
    });
  }


  // Obtener salas del usuario autenticado
  getUserRooms(): Observable<any[]> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getToken()}`
    );
    return this.http.get<any[]>(`${this.apiUrl}/rooms/user-rooms`, { headers });
  }

  // Método para unirse a una sala por código (es probable que sea un POST)
  joinRoom(roomCode: string): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getToken()}`
    );

    return this.http.post<any>(
      `${this.apiUrl}/room-user/join`,
      { code: roomCode },
      { headers }
    );
  }
  // Método para obtener los detalles de la sala por código
  getRoomDetails(roomCode: string): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getToken()}`
    );

    return this.http.get<any>(`${this.apiUrl}/rooms/${roomCode}`, { headers });
  }

  // Función para cerrar sesión
  logout(): void {
    console.log('logout');
    localStorage.removeItem(this.tokenKey); // Elimina el token del almacenamiento local
    this.router.navigate(['']); // Redirige al usuario a la página de login
  }

  /**
   * Analiza una imagen y devuelve una descripción
   * @param imageOrFormData Archivo de imagen o FormData con la imagen y el prompt
   * @param prompt Instrucción para el análisis (opcional si se pasa FormData)
   */
  analyzeImageAngular(imageOrFormData: File | FormData, prompt?: string): Observable<any> {
    let formData: FormData;
    
    if (imageOrFormData instanceof FormData) {
      // Si ya es un FormData, lo usamos directamente
      formData = imageOrFormData;
    } else {
      // Si es un File, creamos un nuevo FormData
      formData = new FormData();
      formData.append('image', imageOrFormData);
      formData.append('prompt', prompt || 'Describe la imagen para una interfaz web en Angular');
    }
    
    return this.http.post(`http://localhost:5000/analyze-image-angular`, formData);
  }

  /**
   * Envía una consulta a la API de Angular para generar componentes
   * @param question Consulta o descripción para generar componentes
   */
  angularQuery(question: string): Observable<any> {
    return this.http.post(`http://localhost:5000/angular-query`, { question });
  }
}
