import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SokectSevice } from '../../services/socket.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-navegation',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './navegation.component.html',
  styleUrl: './navegation.component.css'
})
export class NavegationComponent implements OnInit {
  roomCode: string = ''; // Código de la sala que obtenemos de la URL
  roomName: string = ''; // Nombre de la sala que obtenemos del backend
  errorMessage: string = ''; // Para manejar errores
  usersInRoom: any[] = []; // Almacena los usuarios que se unen
  
  // Propiedades para el escaneo de imágenes
  isProcessingImage: boolean = false;
  selectedImage: File | null = null;
  imagePrompt: string = 'Describe detalladamente esta imagen de un boceto de interfaz de usuario y enumera todos los elementos visibles.';

  constructor(
    private route: ActivatedRoute,
    private SokectSevice: SokectSevice,
    private router: Router,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.roomCode = this.route.snapshot.paramMap.get('code') || '';
  }
  // Método para salir de la sala
  leaveRoom() {
    this.SokectSevice.leaveRoom(this.roomCode);

    // Escuchar el evento cuando el usuario ha salido correctamente
    this.SokectSevice.onLeftRoom().subscribe({
      next: () => {
        console.log(`Saliste de la sala ${this.roomCode}`);
        this.router.navigate(['/client']); // Redirigir
      },
      error: (err) => {
        console.error('Error al salir de la sala:', err);
        this.errorMessage = 'No se pudo salir de la sala.';
      },
    });
  }

  downloadAngularProject() {
    const url = `http://localhost:3000/api/export/angular/${this.roomCode}`;
    window.open(url, '_blank'); // Abre la descarga del zip en otra pestaña
  }
  
  /**
   * Abre el selector de archivos para escanear una imagen
   */
  scanImage() {
    this.errorMessage = ''; // Limpiamos cualquier mensaje de error previo
    
    // Crear un input de tipo file invisible
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    
    // Cuando se seleccione un archivo
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        // Verificamos que sea una imagen
        if (!file.type.startsWith('image/')) {
          this.errorMessage = 'Por favor, selecciona un archivo de imagen válido.';
          return;
        }
        
        // Verificamos el tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.errorMessage = 'La imagen es demasiado grande. El tamaño máximo es 5MB.';
          return;
        }
        
        this.selectedImage = file;
        this.processSelectedImage();
      }
    };
    
    // Simular clic en el input
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  }
  
  /**
   * Procesa la imagen seleccionada
   */
  processSelectedImage() {
    if (!this.selectedImage) {
      this.errorMessage = 'No se ha seleccionado ninguna imagen.';
      return;
    }
    
    this.isProcessingImage = true;
    
    // Creamos un FormData para enviar la imagen
    const formData = new FormData();
    formData.append('image', this.selectedImage);
    formData.append('prompt', this.imagePrompt);
    
    // Primero analizar la imagen
    this.apiService.analyzeImageAngular(formData)
      .subscribe({
        next: (response) => {
          console.log('Análisis de imagen:', response);
          
          if (response && response.response) {
            // Enviar la descripción a la API de Angular para generar componentes
            this.generateComponentsFromDescription(response.response);
          } else {
            this.errorMessage = 'La respuesta del servidor no tiene el formato esperado.';
            this.isProcessingImage = false;
          }
        },
        error: (error) => {
          console.error('Error al analizar la imagen:', error);
          this.isProcessingImage = false;
          this.errorMessage = 'Error al analizar la imagen: ' + (error.message || 'Intente nuevamente más tarde');
        }
      });
  }
  
  /**
   * Genera componentes a partir de la descripción
   */
  generateComponentsFromDescription(description: string) {
    if (!description) {
      this.errorMessage = 'No se recibió una descripción válida de la imagen.';
      this.isProcessingImage = false;
      return;
    }
    
    this.apiService.angularQuery(description)
      .subscribe({
        next: (response) => {
          console.log('Componentes generados:', response);
          
          try {
            // Parsear la respuesta JSON
            if (response && response.response) {
              const components = JSON.parse(response.response);
              
              if (Array.isArray(components) && components.length > 0) {
                // Agregar los componentes al canvas
                this.addComponentsToCanvas(components);
                this.isProcessingImage = false;
              } else {
                this.errorMessage = 'No se pudieron generar componentes a partir de la imagen.';
                this.isProcessingImage = false;
              }
            } else {
              this.errorMessage = 'La respuesta del servidor no tiene el formato esperado.';
              this.isProcessingImage = false;
            }
          } catch (error) {
            console.error('Error al parsear la respuesta:', error);
            this.isProcessingImage = false;
            this.errorMessage = 'Error al procesar la respuesta del servidor.';
          }
        },
        error: (error) => {
          console.error('Error al generar componentes:', error);
          this.isProcessingImage = false;
          this.errorMessage = 'Error al generar componentes: ' + (error.message || 'Intente nuevamente más tarde');
        }
      });
  }
  
  /**
   * Agrega los componentes generados al canvas
   */
  addComponentsToCanvas(components: any[]) {
    if (!components || !Array.isArray(components) || components.length === 0) {
      this.errorMessage = 'No hay componentes para agregar al canvas.';
      return;
    }
    
    if (!this.roomCode) {
      this.errorMessage = 'No se ha especificado un código de sala.';
      return;
    }
    
    // Obtener el ID de la página actual
    // Asumimos que el servicio de socket tiene acceso a la página actual
    const currentPage = this.SokectSevice.getCurrentPage();
    if (!currentPage) {
      this.errorMessage = 'No hay una página seleccionada para agregar los componentes. Por favor, seleccione una página primero.';
      return;
    }
    
    try {
      // Agregar cada componente al canvas
      components.forEach(component => {
        // Asignamos un ID único para el componente si no tiene uno
        if (!component.id) {
          component.id = Date.now() + Math.random().toString(36).substring(2, 9);
        }
        
        this.SokectSevice.addCanvasComponent(this.roomCode, currentPage.id, component);
      });
      
      // Mostramos un mensaje de éxito
      this.errorMessage = `Se han agregado ${components.length} componentes al canvas correctamente.`;
      
      // Limpiamos el mensaje después de 3 segundos
      setTimeout(() => {
        if (this.errorMessage === `Se han agregado ${components.length} componentes al canvas correctamente.`) {
          this.errorMessage = '';
        }
      }, 3000);
    } catch (error) {
      console.error('Error al agregar componentes al canvas:', error);
      this.errorMessage = 'Error al agregar componentes al canvas: ' + (error instanceof Error ? error.message : 'Intente nuevamente más tarde');
    }
  }
}
