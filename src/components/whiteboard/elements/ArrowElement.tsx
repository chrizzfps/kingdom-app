import React, { memo, useRef } from 'react';
import { Arrow, Circle, Transformer } from 'react-konva';
import type { ArrowElement as ArrowEl } from '@/types/whiteboard';
import { useWhiteboardStore } from '@/store/whiteboardStore';
import type Konva from 'konva';

interface Props {
  element: ArrowEl;
  isSelected: boolean;
  readOnly?: boolean;
}

export const ArrowElement = memo(({ element, isSelected, readOnly }: Props) => {
  const shapeRef = useRef<Konva.Arrow>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const { updateElement, setSelected, addToSelection } = useWhiteboardStore();

  React.useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current && !readOnly) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, readOnly]);

  // Absolute endpoint positions based on element origin + points offset
  const [x1, y1, x2, y2] = element.points;

  if (readOnly) {
    return (
      <Arrow
        x={element.x} y={element.y}
        points={element.points}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth}
        fill={element.fill}
        rotation={element.rotation}
        opacity={element.opacity}
        pointerLength={10}
        pointerWidth={8}
        listening={false}
      />
    );
  }

  return (
    <>
      <Arrow
        ref={shapeRef}
        x={element.x} y={element.y}
        points={element.points}
        stroke={isSelected ? '#6366f1' : element.stroke}
        strokeWidth={element.strokeWidth}
        fill={isSelected ? '#6366f1' : element.fill}
        rotation={element.rotation}
        opacity={element.opacity}
        pointerLength={10}
        pointerWidth={8}
        draggable
        onClick={(e) => {
          if (e.evt.shiftKey) { addToSelection(element.id); } else { setSelected([element.id]); }
        }}
        onTap={() => setSelected([element.id])}
        onDragEnd={(e) => updateElement(element.id, { x: e.target.x(), y: e.target.y() })}
      />
      {/* Drag handles for endpoints */}
      {isSelected && (
        <>
          <Circle
            x={element.x + x1} y={element.y + y1}
            radius={6} fill="#fff" stroke="#6366f1" strokeWidth={2}
            draggable
            onDragMove={(e) => {
              updateElement(element.id, {
                points: [e.target.x() - element.x, e.target.y() - element.y, x2, y2],
              });
            }}
          />
          <Circle
            x={element.x + x2} y={element.y + y2}
            radius={6} fill="#6366f1" stroke="#fff" strokeWidth={2}
            draggable
            onDragMove={(e) => {
              updateElement(element.id, {
                points: [x1, y1, e.target.x() - element.x, e.target.y() - element.y],
              });
            }}
          />
          <Transformer
            ref={trRef}
            resizeEnabled={false}
            rotateEnabled={true}
            borderStroke="#6366f1"
            borderStrokeWidth={1}
          />
        </>
      )}
    </>
  );
});

ArrowElement.displayName = 'ArrowElement';
