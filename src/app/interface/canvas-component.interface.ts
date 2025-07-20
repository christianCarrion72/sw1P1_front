export interface CanvasComponent {
  id: string;
  type?: string; // 'div' | 'label' | 'input' | etc.
  style: {
    top?: string;
    left?: string;
    width?: string;
    height?: string;
    backgroundColor?: string;
    color?: string;
    border?: string;
    borderRadius?: string;
    position?: string;
    fontSize?: string;
    fontFamily?: string;
    fontWeight?: string;
    cursor?: string;
    textAlign?: string;
    lineHeight?: string;
    boxShadow?: string;
    transition?: string;
    display?: string;
    // Propiedades faltantes
    padding?: string;
    margin?: string;
    marginBottom?: string;
    marginRight?: string;
    marginTop?: string;
    marginLeft?: string;
    paddingLeft?: string;
    paddingRight?: string;
    paddingTop?: string;
    paddingBottom?: string;
    borderBottom?: string;
    borderTop?: string;
    borderLeft?: string;
    borderRight?: string;
    justifyContent?: string;
    alignItems?: string;
    flexDirection?: string;
    transform?: string;
    bottom?: string;
    right?: string;
    textDecoration?: string;
    zIndex?: string;
  };
  children?: CanvasComponent[];
  parentId?: string | null;
  content?: string; // contenido textual para tags como label
}