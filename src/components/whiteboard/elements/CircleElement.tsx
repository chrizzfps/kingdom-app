import React, { memo, useRef } from 'react';
import { Ellipse, Transformer } from 'react-konva';
import type { CircleElement as CircleEl } from '@/types/whiteboard';
import { useWhiteboardStore } from '@/store/whiteboardStore';
import type Konva from 'konva';

interface Props {
  element: CircleEl;
  isSelected: boolean;
  readOnly?: boolean;
}

export const CircleElement = memo(({ element, isSelected, readOnly }: Props) => {
  const shapeRef = useRef<Konva.Ellipse>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const { updateElement, setSelected, addToSelection } = useWhiteboardStore();

  React.useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current && !readOnly) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, readOnly]);

  const commonProps = {
    x: element.x, y: element.y,
    radiusX: element.radiusX, radiusY: element.radiusY,
    fill: element.fill, stroke: isSelected ? '#6366f1' : element.stroke,
    strokeWidth: isSelected ? 1.5 : element.strokeWidth,
    rotation: element.rotation, opacity: element.opacity,
  };

  if (readOnly) {
    return <Ellipse {...commonProps} listening={false} />;
  }

  return (
    <>
      <Ellipse
        ref={shapeRef}
        {...commonProps}
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
            radiusX: Math.max(10, node.radiusX() * scaleX),
            radiusY: Math.max(10, node.radiusY() * scaleY),
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

CircleElement.displayName = 'CircleElement';
