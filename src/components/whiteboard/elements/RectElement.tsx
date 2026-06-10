import React, { memo, useRef } from 'react';
import { Rect, Transformer } from 'react-konva';
import type { RectElement as RectEl } from '@/types/whiteboard';
import { useWhiteboardStore } from '@/store/whiteboardStore';
import type Konva from 'konva';

interface Props {
  element: RectEl;
  isSelected: boolean;
  readOnly?: boolean;
}

export const RectElement = memo(({ element, isSelected, readOnly }: Props) => {
  const shapeRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const { updateElement, setSelected, addToSelection } = useWhiteboardStore();

  React.useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current && !readOnly) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, readOnly]);

  if (readOnly) {
    return (
      <Rect
        x={element.x} y={element.y}
        width={element.width} height={element.height}
        fill={element.fill} stroke={element.stroke}
        strokeWidth={element.strokeWidth}
        cornerRadius={element.cornerRadius}
        rotation={element.rotation} opacity={element.opacity}
        listening={false}
      />
    );
  }

  return (
    <>
      <Rect
        ref={shapeRef}
        x={element.x} y={element.y}
        width={element.width} height={element.height}
        fill={element.fill} stroke={isSelected ? '#6366f1' : element.stroke}
        strokeWidth={isSelected ? 1.5 : element.strokeWidth}
        cornerRadius={element.cornerRadius}
        rotation={element.rotation} opacity={element.opacity}
        draggable
        onClick={(e) => {
          if (e.evt.shiftKey) { addToSelection(element.id); } else { setSelected([element.id]); }
        }}
        onTap={() => setSelected([element.id])}
        onDragEnd={(e) => updateElement(element.id, { x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current!;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1); node.scaleY(1);
          updateElement(element.id, {
            x: node.x(), y: node.y(),
            width: Math.max(20, node.width() * scaleX),
            height: Math.max(20, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          borderStroke="#6366f1"
          borderStrokeWidth={1.5}
          anchorFill="#fff"
          anchorStroke="#6366f1"
          anchorSize={8}
          anchorCornerRadius={2}
        />
      )}
    </>
  );
});

RectElement.displayName = 'RectElement';
