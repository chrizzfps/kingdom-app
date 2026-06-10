export type WhiteboardElementType = 'rect' | 'circle' | 'text' | 'image' | 'arrow' | 'sticky';

export interface WhiteboardElementBase {
  id: string;
  type: WhiteboardElementType;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  zIndex: number;
}

export interface RectElement extends WhiteboardElementBase {
  type: 'rect';
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
}

export interface CircleElement extends WhiteboardElementBase {
  type: 'circle';
  radiusX: number;
  radiusY: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface TextElement extends WhiteboardElementBase {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontStyle: string; // 'normal' | 'bold' | 'italic' | 'bold italic'
  fill: string;
  align: 'left' | 'center' | 'right';
  width: number;
}

export interface StickyElement extends WhiteboardElementBase {
  type: 'sticky';
  text: string;
  width: number;
  height: number;
  fill: string; // background color
  textColor: string;
  fontSize: number;
}

export interface ImageElement extends WhiteboardElementBase {
  type: 'image';
  src: string;
  width: number;
  height: number;
}

export interface ArrowElement extends WhiteboardElementBase {
  type: 'arrow';
  points: number[]; // [x1, y1, x2, y2]
  stroke: string;
  strokeWidth: number;
  fill: string;
}

export type WhiteboardElement =
  | RectElement
  | CircleElement
  | TextElement
  | StickyElement
  | ImageElement
  | ArrowElement;

export interface WhiteboardStageState {
  x: number;
  y: number;
  scale: number;
}

export interface WhiteboardData {
  elements: WhiteboardElement[];
  title?: string;
}
