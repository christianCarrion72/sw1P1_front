import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SokectSevice } from '../../../services/socket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavegationComponent } from '../../../components/navegation/navegation.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { v4 as uuidv4 } from 'uuid';
import { SidebarIzqComponent } from '../../../components/sidebar-izq/sidebar-izq.component';
import { SidebarDerComponent } from '../../../components/sidebar-der/sidebar-der.component';

import { CanvasComponent } from '../../../interface/canvas-component.interface';
import { DragState } from '../../../interface/dragstate.interface';

interface Page {
  id: string;
  name: string;
  components: CanvasComponent[];
}

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DragDropModule,
    NavegationComponent,
    SidebarIzqComponent,
    SidebarDerComponent,
  ],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css'],
})
export class RoomsComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLDivElement>;
  @ViewChild(SidebarIzqComponent) sidebarIzq!: SidebarIzqComponent;

  roomCode: string = '';
  roomName: string = '';
  roomId: number = 0;
  errorMessage: string = '';
  usersInRoom: any[] = [];
  showParticipants: boolean = false;
  //zoom
  zoomLevel: number = 0.5;  // Empezamos con el mismo scale que definimos
  minZoom: number = 0.5;    // No puede hacer menos que esto
  maxZoom: number = 2;      // Zoom máximo permitido
  zoomStep: number = 0.05;  // Cuánto aumenta o disminuye el zoom
selectedPageId: string = '';

  dragState: DragState = {
    isDragging: false,
    component: null,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,
  };

  contextMenu = {
    visible: false,
    x: 0,
    y: 0,
    targetId: '',
  };

  clipboardComponent: CanvasComponent | null = null;
  cutMode: boolean = false;
  isModalOpen: boolean = false;

  pages: Page[] = [];
 

  selectedComponent: CanvasComponent | null = null;

  constructor(
    private route: ActivatedRoute,
    private SokectSevice: SokectSevice,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.roomCode = this.route.snapshot.paramMap.get('code') || '';

    if (this.roomCode) {
      this.SokectSevice.joinRoom(this.roomCode);
    }

    // Crear página 0 desde el principio


    this.SokectSevice.onInitialCanvasLoad().subscribe(pages => {
      this.pages = pages;
    
      if (pages.length === 0) {
        // Si no hay páginas, el usuario es el primero en entrar: crear Página 1
        this.addPage();
      } else {
        // Seleccionar la primera página si ya existe
        this.selectedPageId = pages[0].id;
      }
    
      this.cdr.detectChanges();
    });
    
    
    


    this.SokectSevice.onComponentAdded().subscribe(({ pageId, component }) => {
      const page = this.pages.find(p => p.id === pageId);
      if (page) {
        page.components.push(component);
        this.cdr.detectChanges();
      }
    });


    this.SokectSevice.onChildComponentAdded().subscribe(({ parentId, childComponent }) => {
      const parent = this.findComponentById(parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(childComponent);
        this.cdr.detectChanges();
      }
    });

    this.SokectSevice.onComponentRemoved().subscribe(({ pageId, componentId }) => {
      const page = this.pages.find(p => p.id === pageId);
      if (page) {
        this.removeRecursive(page.components, componentId);
      }
    
      if (this.selectedComponent?.id === componentId) {
        this.selectedComponent = null;
      }
      this.cdr.detectChanges();
    });
    

    this.SokectSevice.onComponentMoved().subscribe(({ componentId, newPosition }) => {
      const component = this.findComponentById(componentId);
      if (component) {
        component.style.left = newPosition.left;
        component.style.top = newPosition.top;
        this.cdr.detectChanges();
      }
    });

    this.SokectSevice.onComponentTransformed().subscribe(({ componentId, newSize }) => {
      const component = this.findComponentById(componentId);
      if (component) {
        component.style.width = newSize.width;
        component.style.height = newSize.height;
        this.cdr.detectChanges();
      }
    });

    this.SokectSevice.onComponentPropertiesUpdated().subscribe(({ pageId, componentId, updates }) => {
      const page = this.pages.find(p => p.id === pageId);
      if (!page) return;
    
      const component = this.findComponentByIdInPage(page, componentId);
      if (component) {
        if (updates.content !== undefined) {
          component.content = updates.content;
        }
        const { content, ...styleUpdates } = updates;
        Object.assign(component.style, styleUpdates);
        this.cdr.detectChanges();
      }
    });
    
    this.SokectSevice.onPageAdded().subscribe((page) => {
      this.pages.push(page);
      if (!this.selectedPageId) {
        this.selectedPageId = page.id; // Seleccionamos automáticamente si es la primera
      }
      this.cdr.detectChanges();
    });
    
    this.SokectSevice.onPageRemoved().subscribe((pageId) => {
      console.log('❌ Página eliminada:', pageId);
      this.pages = this.pages.filter(page => page.id !== pageId);
      if (this.selectedPageId === pageId && this.pages.length > 0) {
        this.selectPage(this.pages[0].id);
      }
      this.cdr.detectChanges();
    });
    //tabla
    this.SokectSevice.onTableStructureUpdated().subscribe(({ pageId, tableId, children }) => {
      const page = this.pages.find(p => p.id === pageId);
      if (!page) return;
    
      const table = this.findComponentByIdInPage(page, tableId);
      if (table && table.type === 'table') {
        table.children = children;
        this.cdr.detectChanges();
      }
    });
    
  }
  findComponentByIdInPage(page: Page, id: string): CanvasComponent | null {
    const search = (list: CanvasComponent[]): CanvasComponent | null => {
      for (const comp of list) {
        if (comp.id === id) return comp;
        if (comp.children) {
          const found = search(comp.children);
          if (found) return found;
        }
      }
      return null;
    };
    return search(page.components || []);
  }
  
  ngAfterViewInit(): void {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isPreviewMode) {
        this.togglePreviewMode();
      }
    });
  }

  getCurrentPage(): Page | null {
    return this.pages.find(p => p.id === this.selectedPageId) || null;
  }

  selectPage(pageId: string) {
    this.selectedPageId = pageId;
    this.selectedComponent = null;
  
    // Pedimos al servidor la página actualizada
    this.SokectSevice.requestPage(this.roomCode, pageId);
  
    this.SokectSevice.onPageData().subscribe((page) => {
      if (page) {
        const index = this.pages.findIndex(p => p.id === page.id);
        if (index !== -1) {
          this.pages[index] = page; // Reemplazamos la página en local
        }
        this.cdr.detectChanges();
      }
    });

    //tabla
    
  }
  

  addPage() {
    const newPage: Page = {
      id: uuidv4(),
      name: `Página ${this.pages.length + 1}`,
      components: [],
    };
    this.pages.push(newPage);
    this.selectPage(newPage.id);

    this.SokectSevice.addPage(this.roomCode, newPage);
  }

  selectComponent(comp: CanvasComponent, event: MouseEvent) {
    event.stopPropagation();
    this.selectedComponent = comp;
    this.contextMenu.visible = false;
  }

  onComponentContextMenu(event: MouseEvent, id: string) {
    if (this.isPreviewMode) return;
    event.preventDefault();
    event.stopPropagation();
    this.contextMenu.visible = true;
    this.contextMenu.x = event.clientX;
    this.contextMenu.y = event.clientY;
    this.contextMenu.targetId = id;
  }

  onCanvasContextMenu(event: MouseEvent) {
    if (this.isPreviewMode) return;
    event.preventDefault();
    this.contextMenu.visible = false;
  }

  onMouseDown(event: MouseEvent, component: CanvasComponent) {
    if (this.isPreviewMode) return;
    event.preventDefault();
    event.stopPropagation();

    if (event.button === 0) {
      this.dragState = {
        isDragging: true,
        component,
        startX: event.clientX,
        startY: event.clientY,
        initialLeft: parseInt(component.style.left || '0', 10),
        initialTop: parseInt(component.style.top || '0', 10),
      };
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.isPreviewMode) return;
    if (!this.dragState.isDragging || !this.dragState.component) return;

    const deltaX = event.clientX - this.dragState.startX;
    const deltaY = event.clientY - this.dragState.startY;

    const component = this.dragState.component;
    component.style.left = `${this.dragState.initialLeft + deltaX}px`;
    component.style.top = `${this.dragState.initialTop + deltaY}px`;

    this.SokectSevice.moveComponent(this.roomCode, this.selectedPageId!, component.id, {
      left: component.style.left,
      top: component.style.top,
    });
  }

 
  onMouseUp(event: MouseEvent) {
    if (this.isPreviewMode) return;
  
    if (this.dragState.isDragging && this.dragState.component) {
      // Asegurar que left y top sean strings válidos
      const left = this.dragState.component.style.left ?? '0px';
      const top = this.dragState.component.style.top ?? '0px';
  
      this.SokectSevice.moveComponent(this.roomCode, this.selectedPageId!, this.dragState.component.id, {
        left,
        top,
      });
    }
  
    this.dragState.isDragging = false;
  }
  


  addChild(parentId: string) {
    const parent = this.findComponentById(parentId);
    if (!parent) return;

    const child: CanvasComponent = {
      id: uuidv4(),
      type: 'div',
      style: {
        top: '10px',
        left: '10px',
        width: '100px',
        height: '60px',
        backgroundColor: '#d0d0ff',
        color: '#004040',
        border: '2px solid #004040',
        borderRadius: '10px',
        position: 'absolute',
      },
      content: 'div hijo',
      children: [],
      parentId: parent.id,
    };

    this.SokectSevice.addChildComponent(this.roomCode, parentId, child, this.selectedPageId!);

    if (!parent.children) parent.children = [];
    parent.children.push(child);
    this.contextMenu.visible = false;
  }

  removeComponent(id: string) {
    const pageId = this.selectedPageId!;
    this.SokectSevice.removeCanvasComponent(this.roomCode, pageId, id);
    this.removeRecursive(this.getCurrentPage()?.components || [], id);
    if (this.selectedComponent?.id === id) {
      this.selectedComponent = null;
    }
    this.contextMenu.visible = false;
  }
  

  copyComponent(component: CanvasComponent) {
    this.clipboardComponent = structuredClone(component);
    this.cutMode = false;
  }

  cutComponent(component: CanvasComponent) {
    this.clipboardComponent = structuredClone(component);
    this.cutMode = true;
  }

  pasteComponent(targetParentId: string | null = null) {
    if (!this.clipboardComponent || !this.getCurrentPage()) return;

    const newComponent = structuredClone(this.clipboardComponent);
    newComponent.id = uuidv4();
    newComponent.parentId = targetParentId;
    newComponent.style.top = '20px';
    newComponent.style.left = '20px';

    if (targetParentId) {
      const parent = this.findComponentById(targetParentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(newComponent);
      }
      this.SokectSevice.addChildComponent(this.roomCode, targetParentId, newComponent, this.selectedPageId!);

    } else {
      this.getCurrentPage()!.components.push(newComponent);
      this.SokectSevice.addCanvasComponent(this.roomCode, this.selectedPageId!, newComponent);

    }

    if (this.cutMode && this.clipboardComponent?.id) {
      this.removeComponent(this.clipboardComponent.id);
    }

    this.cutMode = false;
    this.contextMenu.visible = false;
  }

  findComponentById(id: string): CanvasComponent | null {
    const search = (list: CanvasComponent[]): CanvasComponent | null => {
      for (const comp of list) {
        if (comp.id === id) return comp;
        if (comp.children) {
          const found = search(comp.children);
          if (found) return found;
        }
      }
      return null;
    };

    return search(this.getCurrentPage()?.components || []);
  }

  removeRecursive(list: CanvasComponent[], id: string): boolean {
    const index = list.findIndex(c => c.id === id);
    if (index !== -1) {
      list.splice(index, 1);
      return true;
    }
    for (const comp of list) {
      if (comp.children && this.removeRecursive(comp.children, id)) {
        return true;
      }
    }
    return false;
  }

  triggerAddComponentFromOutside() {
    this.sidebarIzq.addComponent();
  }

  triggerAddLabel() {
    this.sidebarIzq.addLabelComponent();
  }

  triggerHtmlModal() {
    this.sidebarIzq.openHtmlModal();
  }

  triggerSampleJson() {
    this.sidebarIzq.loadSampleJson();
  }
  AddCombo() {
    this.sidebarIzq.addSelectComponent();
  }
  AddTable() {
    this.sidebarIzq.addTableComponent();
  }
  onWheel(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault(); // Sólo bloqueamos scroll si presiona Ctrl
      if (event.deltaY < 0) {
        // Acercar (scroll arriba + ctrl)
        this.zoomLevel = Math.min(this.zoomLevel + this.zoomStep, this.maxZoom);
      } else {
        // Alejar (scroll abajo + ctrl)
        this.zoomLevel = Math.max(this.zoomLevel - this.zoomStep, this.minZoom);
      }
    }
  }
  resetZoom() {
    this.zoomLevel = 0.5;
  }

  isPreviewMode: boolean = false;
  togglePreviewMode() {
    this.isPreviewMode = !this.isPreviewMode;
    const body = document.body;

    if (this.isPreviewMode) {
      body.style.overflow = 'hidden';
      this.zoomLevel = 1.0; // <-- Escala 100% al previsualizar
    } else {
      body.style.overflow = 'auto';
      this.zoomLevel = 0.5; // <-- Regresa al zoom normal de trabajo
    }
  }



}
