// sidebar-izq.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { SokectSevice } from '../../services/socket.service';
import { CanvasComponent } from '../../interface/canvas-component.interface';
import { ActivatedRoute, Router } from '@angular/router';

interface Page {
  id: string;
  name: string;
  components: CanvasComponent[];
}

@Component({
  selector: 'app-sidebar-izq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-izq.component.html'
})
export class SidebarIzqComponent implements OnInit {
  roomName: string = '';
  errorMessage: string = '';
  usersInRoom: any[] = [];

  @Input() pages: Page[] = [];
  @Input() selectedPageId: string | null = null;
  @Input() components: CanvasComponent[] = [];  // MANTIENE COMPONENTES EN EL CANVAS ACTUAL
  @Input() roomCode: string = '';
  @Input() contextMenu: any;
  @Input() isModalOpen: boolean = false;
  @Input() isPreview: boolean = false;

  @Output() selectPage = new EventEmitter<string>();
  @Output() addPage = new EventEmitter<void>();
  @Output() togglePreview = new EventEmitter<void>();

  constructor(
    private route: ActivatedRoute,
    public SokectSevice: SokectSevice,
    private router: Router
  ) { }

  showParticipants: boolean = false;

  ngOnInit(): void {
    this.roomCode = this.route.snapshot.paramMap.get('code') || '';
    this.SokectSevice.onJoinedRoom().subscribe((room) => {
      this.roomName = room.name;
    });
    this.SokectSevice.onUsersListUpdate().subscribe((users) => {
      this.usersInRoom = users;
    });
  }
  dropdownOpen: boolean = false;

  onSelectPage(pageId: string) {
    this.selectPage.emit(pageId);
  }

  onAddPage() {
    this.addPage.emit();
  }

  get currentComponents(): CanvasComponent[] {
    return this.components;
  }

  addComponent() {
    const newComponent: CanvasComponent = {
      id: uuidv4(),
      type: 'div',
      style: {
        top: '50px',
        left: '50px',
        width: '200px',
        height: '100px',
        backgroundColor: '#f0f0f0',
        color: '#000000',
        border: '1px solid #cccccc',
        borderRadius: '4px',
        position: 'absolute',
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: '40px',
      },
      content: 'Nuevo Div',
      children: [],
      parentId: null,
    };
    this.SokectSevice.addCanvasComponent(this.roomCode, this.selectedPageId!, newComponent);

    this.contextMenu.visible = false;
  }

  addLabelComponent() {
    const labelComponent: CanvasComponent = {
      id: uuidv4(),
      type: 'label',
      style: {
        top: '60px',
        left: '60px',
        width: '100px',
        height: '20px',
        backgroundColor: 'transparent',
        color: '#000000',
        position: 'absolute',
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: '40px',
      },
      content: 'Etiqueta:',
      children: [],
      parentId: null,
    };
    this.SokectSevice.addCanvasComponent(this.roomCode, this.selectedPageId!, labelComponent);


    this.contextMenu.visible = false;
  }

  addButtonComponent() {
    const buttonComponent: CanvasComponent = {
      id: uuidv4(),
      type: 'button',
      style: {
        top: '50px',
        left: '50px',
        width: '120px',
        height: '40px',
        backgroundColor: '#4f46e5',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        position: 'absolute',
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        cursor: 'pointer',
        textAlign: 'center',
        lineHeight: '40px',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
        display: 'inline-block',
      },
      content: 'Click me',
      children: [],
      parentId: null,
    };
    this.SokectSevice.addCanvasComponent(this.roomCode, this.selectedPageId!, buttonComponent);


    this.contextMenu.visible = false;
  }
  addSelectComponent() {
    const selectComponent: CanvasComponent = {
      id: uuidv4(),
      type: 'select',
      style: {
        top: '80px',
        left: '80px',
        width: '160px',
        height: '40px',
        backgroundColor: '#ffffff',
        color: '#000000',
        border: '1px solid #cccccc',
        borderRadius: '4px',
        position: 'absolute',
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
      },
      content: '',  // Vacío, ya que tendrá hijos tipo <option>
      children: [
        {
          id: uuidv4(),
          type: 'option',
          style: {},
          content: 'Opción 1',
          children: [],
          parentId: null,
        },
        {
          id: uuidv4(),
          type: 'option',
          style: {},
          content: 'Opción 2',
          children: [],
          parentId: null,
        }
      ],
      parentId: null,
    };

    this.SokectSevice.addCanvasComponent(this.roomCode, this.selectedPageId!, selectComponent);
    this.contextMenu.visible = false;
  }
  addTableComponent() {
    const tableComponent: CanvasComponent = {
      id: uuidv4(),
      type: 'table',
      style: {
        top: '100px',
        left: '100px',
        width: '400px',
        height: 'auto',
        border: '1px solid #000',
        position: 'absolute',
        backgroundColor: '#ffffff',
      },
      children: [
        {
          id: uuidv4(),
          type: 'tr',
          children: Array.from({ length: 3 }, (_, i) => ({
            id: uuidv4(),
            type: 'td',
            content: `Col ${i + 1}`,
            style: { border: '1px solid #ccc' },
            children: [],
            parentId: null,
          })),
          style: {},
          parentId: null
        },
        {
          id: uuidv4(),
          type: 'tr',
          children: Array.from({ length: 3 }, (_, i) => ({
            id: uuidv4(),
            type: 'td',
            content: `Dato ${i + 1}`,
            style: { border: '1px solid #ccc' },
            children: [],
            parentId: null,
          })),
          style: {},
          parentId: null
        }
      ],
      content: '',
      parentId: null,
    };
  
    this.SokectSevice.addCanvasComponent(this.roomCode, this.selectedPageId!, tableComponent);
    this.contextMenu.visible = false;
  }

  addCheckboxComponent() {
    const checkboxComponent: CanvasComponent = {
      id: uuidv4(),
      type: 'checkbox',
      style: {
        top: '120px',
        left: '120px',
        position: 'absolute',
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
      },
      content: 'Opción de checkbox',
      checked: false,
      parentId: null,
    };

    this.SokectSevice.addCanvasComponent(this.roomCode, this.selectedPageId!, checkboxComponent);
    this.contextMenu.visible = false;
  }

  addRadioComponent() {
    const radioComponent: CanvasComponent = {
      id: uuidv4(),
      type: 'radio',
      style: {
        top: '150px',
        left: '150px',
        position: 'absolute',
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
      },
      content: 'Opción de radio',
      checked: false,
      groupName: 'radioGroup1', // Permite agrupar radios relacionados
      parentId: null,
    };

    this.SokectSevice.addCanvasComponent(this.roomCode, this.selectedPageId!, radioComponent);
    this.contextMenu.visible = false;
  }
  

  openHtmlModal() {
    this.isModalOpen = true;
  }

  exportHtml(): { html: string, css: string } {
    let counter = 0;
    const cssMap = new Map<string, string>();
  
    const toKebabCase = (str: string): string =>
      str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  
    const renderComponent = (comp: CanvasComponent): string => {
      const className = `c${++counter}`;
      const styleString = Object.entries(comp.style || {})
        .map(([key, val]) => `${toKebabCase(key)}: ${val};`)
        .join(' ');
  
      cssMap.set(className, styleString);

      // Manejo especial para checkbox
      if (comp.type === 'checkbox') {
        return `<div class="${className}">
          <input type="checkbox" id="${comp.id}" ${comp.checked ? 'checked' : ''}>
          <label for="${comp.id}">${comp.content}</label>
        </div>`;
      }

      // Manejo especial para radio
      if (comp.type === 'radio') {
        return `<div class="${className}">
          <input type="radio" name="${comp.groupName}" id="${comp.id}" ${comp.checked ? 'checked' : ''}>
          <label for="${comp.id}">${comp.content}</label>
        </div>`;
      }
  
      const tag = comp.type || 'div';
      const childrenHtml = (comp.children?.map(renderComponent).join('') || '');
      const inner = (comp.content || '') + childrenHtml;
  
      return `<${tag} class="${className}">${inner}</${tag}>`;
    };
  
    const html = `<body>\n${this.currentComponents.map(renderComponent).join('\n')}\n</body>`;
    const css = Array.from(cssMap.entries())
      .map(([cls, styles]) => `.${cls} {\n  ${styles}\n}`)
      .join('\n\n');
  
    return { html, css };
  }
  
  
  

  loadSampleJson() {
    // Puedes copiar aquí tu JSON de ejemplo si quieres también...
  }
  pageContextMenu = {
    visible: false,
    x: 0,
    y: 0,
    targetPageId: ''
  };
  onPageContextMenu(event: MouseEvent, page: Page) {
    event.preventDefault();
    event.stopPropagation();

    // Solo permitir eliminar si NO es la primera página
    if (this.pages.indexOf(page) > 0) {
      this.pageContextMenu.visible = true;
      this.pageContextMenu.x = event.clientX;
      this.pageContextMenu.y = event.clientY;
      this.pageContextMenu.targetPageId = page.id;
    }
  }
  deletePage(pageId: string) {
    const index = this.pages.findIndex(p => p.id === pageId);
    if (index > 0) {
      this.pages.splice(index, 1);

      // Socket para notificar a todos los usuarios
      this.SokectSevice.removePage(this.roomCode, pageId);

      if (this.selectedPageId === pageId && this.pages.length > 0) {
        const newSelected = this.pages[Math.max(0, index - 1)];
        this.onSelectPage(newSelected.id);
      }
    }

    this.pageContextMenu.visible = false;
  }

  exportHtmlOnly(): string {
    const renderComponent = (comp: CanvasComponent): string => {
      const childrenHtml = comp.children?.map(renderComponent).join('') || '';
      const tag = comp.type || 'div';
      const content = comp.content || '';
      if (tag === 'label') {
        return `<label class="${comp.id}">${content}</label>`;
      }
      return `<${tag} class="${comp.id}">${childrenHtml}</${tag}>`;
    };
  
    return this.currentComponents.map(renderComponent).join('\n');
  }
  
  exportCssOnly(): string {
    const collectStyles = (comp: CanvasComponent): string => {
      const styleString = Object.entries(comp.style)
        .map(([key, val]) => `${key}: ${val};`)
        .join(' ');
      
      let css = `.${comp.id} {\n  ${styleString}\n}\n`;
      
      // Estilos adicionales para checkbox y radio
      if (comp.type === 'checkbox' || comp.type === 'radio') {
        css += `.${comp.id} { display: flex; align-items: center; gap: 0.5rem; }\n`;
        css += `.${comp.id} input { width: 16px; height: 16px; }\n`;
        css += `.${comp.id} label { margin-left: 4px; }\n`;
      }
      
      const childrenCss = comp.children?.map(collectStyles).join('') || '';
      return css + childrenCss;
    };
  
    return this.currentComponents.map(collectStyles).join('\n');
  }
  
}
