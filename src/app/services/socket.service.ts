import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SokectSevice {
  private socket: Socket;


  constructor() {
    this.socket = io(environment.SERVER_URL, {
      auth: {
        token: localStorage.getItem('authToken'),
      },
    });
  }
  // Escuchar mensaje de conexión
  onConnectionMessage(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('connectionMessage', (message: string) => {
        observer.next(message);
      });
    });
  }
  // Emitir evento para crear sala
  createRoom(createRoomDto: any) {
    this.socket.emit('createRoom', createRoomDto);
  }

  // Escuchar cuando se crea la sala
  onRoomCreated(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('roomCreated', (room) => {
        observer.next(room);
      });
    });
  }

  // Emitir evento para unirse a una sala
  joinRoom(roomCode: string) {
    this.socket.emit('joinRoom', { roomCode });
  }
  //salir de la sala
  leaveRoom(roomCode: string) {
    this.socket.emit('leaveRoom', { roomCode });
  }

  onLeftRoom(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('leftRoom', () => {
        observer.next();
      });
    });
  }

  // Escuchar cuando el usuario se une a la sala
  onJoinedRoom(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('joinedRoom', (room) => {
        observer.next(room);
      });
    });
  }

  onUsersListUpdate(): Observable<any[]> {
    return new Observable((observer) => {
      this.socket.on('updateUsersList', (users) => {
        observer.next(users);
      });
    });
  }

  //----------------objetos---------------
  onInitialCanvasLoad(): Observable<any[]> {
    return new Observable(observer => {
      this.socket.on('initialCanvasLoad', (components) => {
        observer.next(components);
      });
    });
  }
  //agrega componente
  addCanvasComponent(roomCode: string, pageId: string, component: any) {
    this.socket.emit('addComponent', { roomCode, pageId, component });
  }
  

  onComponentAdded(): Observable<{ pageId: string, component: any }>{
    return new Observable((observer) => {
      this.socket.on('componentAdded', (component) => {
        observer.next(component);
      });
    });
  }
  //agrega hijo
  addChildComponent(roomCode: string, parentId: string, childComponent: any, pageId: string) {
    this.socket.emit('addChildComponent', { roomCode, parentId, childComponent, pageId });
  }
  
  onChildComponentAdded(): Observable<{ parentId: string, childComponent: any }> {
    return new Observable((observer) => {
      this.socket.on('childComponentAdded', ({ parentId, childComponent }) => {
        observer.next({ parentId, childComponent });
      });
    });
  }
  
  //remover
  removeCanvasComponent(roomCode: string, pageId: string, componentId: string) {
    this.socket.emit('removeComponent', { roomCode, pageId, componentId });
  }
  

  onComponentRemoved(): Observable<{ pageId: string, componentId: string }> {
    return new Observable((observer) => {
      this.socket.on('componentRemoved', (data) => {
        observer.next(data);
      });
    });
  }
  
  //movimiento
  // Agrega estos métodos al SokectSevice

  // Para mover componentes
  moveComponent(roomCode: string, pageId: string, componentId: string, newPosition: { left: string, top: string }) {
    this.socket.emit('moveComponent', { roomCode, pageId, componentId, newPosition });
  }
  

  onComponentMoved(): Observable<{ componentId: string, newPosition: { left: string, top: string } }> {
    return new Observable((observer) => {
      this.socket.on('componentMoved', (data) => {
        observer.next(data);
      });
    });
  }

  // Para transformar componentes (cambiar tamaño)
  transformComponent(roomCode: string, componentId: string, newSize: { width: string, height: string }) {
    this.socket.emit('transformComponent', { roomCode, componentId, newSize });
  }

  onComponentTransformed(): Observable<{ componentId: string, newSize: { width: string, height: string } }> {
    return new Observable((observer) => {
      this.socket.on('componentTransformed', (data) => {
        observer.next(data);
      });
    });
  }
  // Agrega o reemplaza estos métodos en tu SokectSevice

  // Método unificado para actualizar cualquier propiedad
  updateComponentProperties(roomCode: string, pageId: string, componentId: string, updates: any) {
    this.socket.emit('updateComponentProperties', { roomCode, pageId, componentId, updates });
  }
  

  // Escucha cambios en las propiedades
  onComponentPropertiesUpdated(): Observable<{ pageId: string, componentId: string, updates: any }> {

    return new Observable((observer) => {
      this.socket.on('componentPropertiesUpdated', (data) => {
        observer.next(data);
      });
    });
  }
  //------------
  // Añade estos métodos en tu SokectSevice

  updateComponentAttributes(roomCode: string, componentId: string, attributeUpdates: { [key: string]: string }) {
    this.socket.emit('updateComponentAttributes', { roomCode, componentId, attributeUpdates });
  }

  updateComponentContent(roomCode: string, componentId: string, content: string) {
    this.socket.emit('updateComponentContent', { roomCode, componentId, content });
  }

  // Y los observables correspondientes
  onComponentAttributesUpdated() {
    return new Observable<{ componentId: string, attributeUpdates: { [key: string]: string } }>(observer => {
      this.socket.on('componentAttributesUpdated', data => {
        observer.next(data);
      });
    });
  }

  onComponentContentUpdated() {
    return new Observable<{ componentId: string, content: string }>(observer => {
      this.socket.on('componentContentUpdated', data => {
        observer.next(data);
      });
    });
  }
  // server.service.ts (agregar estas funciones)

  // Emitir para agregar nueva página
  addPage(roomCode: string, page: any) {
    this.socket.emit('addPage', { roomCode, page });
  }

  // Escuchar cuando se agrega una página
  onPageAdded(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('pageAdded', (page) => {
        observer.next(page);
      });
    });
  }

  // Emitir para eliminar una página (opcional si quieres también)
  removePage(roomCode: string, pageId: string) {
    this.socket.emit('removePage', { roomCode, pageId });
  }

  // Escuchar cuando se elimina una página (opcional)
  onPageRemoved(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('pageRemoved', (pageId: string) => {
        observer.next(pageId);
      });
    });
  }
  requestPage(roomCode: string, pageId: string) {
    this.socket.emit('requestPage', { roomCode, pageId });
  }
  
  onPageData(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('pageData', (page) => {
        observer.next(page);
      });
    });
  }
  //tabla
  updateTableStructure(roomCode: string, pageId: string, tableId: string, children: any[]) {
    this.socket.emit('updateTableStructure', { roomCode, pageId, tableId, children });
  }
  
  onTableStructureUpdated(): Observable<{ pageId: string; tableId: string; children: any[] }> {
    return new Observable((observer) => {
      this.socket.on('tableStructureUpdated', (data) => {
        observer.next(data);
      });
    });
  }
  
  // Variable para almacenar la página actual
  private currentPageData: any = null;
  
  // Método para obtener la página actual
  getCurrentPage(): any {
    return this.currentPageData;
  }
  
  // Método para establecer la página actual
  setCurrentPage(page: any): void {
    this.currentPageData = page;
  }
}
