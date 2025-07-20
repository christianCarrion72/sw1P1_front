import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanvasComponent } from '../../interface/canvas-component.interface';
import { SokectSevice } from '../../services/socket.service';

@Component({
  selector: 'app-sidebar-der',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar-der.component.html'
})
export class SidebarDerComponent {
  @Input() selectedComponent: CanvasComponent | null = null;
  @Input() roomCode: string = '';
  @Input() selectedPageId: string = '';

  constructor(private SokectSevice: SokectSevice) { }

  parsePxValue(value: string | undefined): number {
    if (!value) return 0;
    return parseInt(value.replace('px', ''), 10);
  }

  Propiedades(value: any, property: keyof CanvasComponent['style']) {
    if (!this.selectedComponent) return;

    let formattedValue = value;
    if (['top', 'left', 'width', 'height', 'borderRadius', 'fontSize', 'lineHeight'].includes(property)) {
      formattedValue = `${value}px`;
    }

    this.selectedComponent.style[property] = formattedValue;

    this.SokectSevice.updateComponentProperties(
      this.roomCode,
      this.selectedPageId!,
      this.selectedComponent.id,
      { [property]: formattedValue }
    );


  }
  // sidebar-der.component.ts
  webSafeFonts = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Helvetica', value: "'Helvetica Neue', Helvetica, sans-serif" },
    { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { name: 'Times New Roman', value: "'Times New Roman', Times, serif" },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Courier New', value: "'Courier New', Courier, monospace" },
    { name: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
    { name: 'Impact', value: 'Impact, Haettenschweiler, sans-serif' },
    { name: 'Comic Sans MS', value: "'Comic Sans MS', cursive" },
    { name: 'Palatino', value: "'Palatino Linotype', 'Book Antiqua', serif" },
    { name: 'Lucida', value: "'Lucida Sans Unicode', 'Lucida Grande', sans-serif" }
  ];
  getBorderProperty(prop: 'width' | 'style' | 'color'): string | number {
    if (!this.selectedComponent?.style.border) {
      return prop === 'width' ? 0 : prop === 'color' ? '#000000' : 'solid';
    }

    const parts = this.selectedComponent.style.border.split(' ');
    switch (prop) {
      case 'width': return parseInt(parts[0]) || 0;
      case 'color': return parts[2] || '#000000';
      default: return parts[1] || 'solid';
    }
  }

  setBorderProperty(prop: 'width' | 'style' | 'color', value: string | number) {
    if (!this.selectedComponent) return;

    const current = this.selectedComponent.style.border || '0 solid #000000';
    let [width, style, color] = current.split(' ');

    switch (prop) {
      case 'width': width = `${value}px`; break;
      case 'color': color = value as string; break;
      case 'style': style = value as string; break;
    }

    const newBorder = `${width || '0'} ${style || 'solid'} ${color || '#000000'}`;
    this.Propiedades(newBorder, 'border');
  }
  //------
  onContentChange(newContent: string) {
    if (!this.selectedComponent) return;

    this.selectedComponent.content = newContent;

    this.SokectSevice.updateComponentProperties(
      this.roomCode,
      this.selectedPageId!,
      this.selectedComponent.id,
      { content: newContent }
    );
  }
  addOption() {
    if (!this.selectedComponent || this.selectedComponent.type !== 'select') return;
  
    const newOption: CanvasComponent = {
      id: crypto.randomUUID(),
      type: 'option',
      content: 'Nueva opción',
      style: {},
      children: [],
      parentId: this.selectedComponent.id
    };
  
    // ⚠️ ACTUALIZAR LOCALMENTE
    if (!this.selectedComponent.children) {
      this.selectedComponent.children = [];
    }
    this.selectedComponent.children.push(newOption);
  
    // Emitir por socket
    this.SokectSevice.addChildComponent(
      this.roomCode,
      this.selectedComponent.id,
      newOption,
      this.selectedPageId!
    );
    
  }
  


  removeOption(index: number) {
    if (!this.selectedComponent?.children || !this.selectedComponent.children[index]) return;
  
    const optionToRemove = this.selectedComponent.children[index];
  
    // ⚠️ ACTUALIZAR LOCALMENTE
    this.selectedComponent.children.splice(index, 1);
  
    // Emitir por socket
    this.SokectSevice.removeCanvasComponent(
      this.roomCode,
      this.selectedPageId!,
      optionToRemove.id
    );
  }
  

  onOptionContentChange(index: number, newContent: string) {
    if (!this.selectedComponent?.children || !this.selectedComponent.children[index]) return;

    const option = this.selectedComponent.children[index];
    option.content = newContent;

    this.SokectSevice.updateComponentProperties(
      this.roomCode,
      this.selectedPageId!,
      option.id,
      { content: newContent }
    );
  }

  updateTableStructure() {
    if (!this.selectedComponent || this.selectedComponent.type !== 'table') return;
    this.SokectSevice.updateTableStructure(
      this.roomCode,
      this.selectedPageId!,
      this.selectedComponent.id,
      this.selectedComponent.children!
    );
  }

  addTableRow() {
    if (!this.selectedComponent || this.selectedComponent.type !== 'table') return;
    if (!this.selectedComponent.children) this.selectedComponent.children = [];

    const columnCount = this.selectedComponent.children[0]?.children?.length || 1;

    const newRow = {
      id: crypto.randomUUID(),
      type: 'tr',
      style: {},
      children: Array.from({ length: columnCount }, () => ({
        id: crypto.randomUUID(),
        type: 'td',
        content: 'Nueva celda',
        style: { border: '1px solid #ccc' },
        children: [],
        parentId: null
      })),
      parentId: null
    };

    this.selectedComponent.children.push(newRow);
    this.updateTableStructure();
  }

  addTableColumn() {
    if (!this.selectedComponent?.children) return;

    for (const row of this.selectedComponent.children) {
      if (!row.children) row.children = [];
      row.children.push({
        id: crypto.randomUUID(),
        type: 'td',
        content: 'Nueva celda',
        style: { border: '1px solid #ccc' },
        children: [],
        parentId: null
      });
    }
    this.updateTableStructure();
  }

  removeTableRow() {
    if (!this.selectedComponent?.children?.length) return;
    this.selectedComponent.children.pop();
    this.updateTableStructure();
  }

  removeTableColumn() {
    if (!this.selectedComponent?.children?.length) return;

    for (const row of this.selectedComponent.children) {
      row.children?.pop();
    }
    this.updateTableStructure();
  }



}
