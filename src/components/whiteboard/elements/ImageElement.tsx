import { memo, useRef, useEffect, useState } from 'react';
import { Image as KonvaImage, Transformer } from 'react-konva';
import type { ImageElement as ImageEl } from '@/types/whiteboard';
import { useWhiteboardStore } from '@/store/whiteboardStore';
import type Konva from 'konva';

interface Props {
  element: ImageEl;
  isSelected: boolean;
  readOnly?: boolean;
}

export const ImageElement = memo(({ element, isSelected, readOnly }: Props) => {
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  const { updateElement, setSelected, addToSelection } = useWhiteboardStore();

  useEffect(() => {
    if (!element.src) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImage(img);
    img.src = element.src;
  }, [element.src]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current && !readOnly) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, readOnly, image]);

  if (!image) return null;

  if (readOnly) {
    return (
      <KonvaImage
        x={element.x} y={element.y}
        image={image}
        width={element.width} height={element.height}
        rotation={element.rotation} opacity={element.opacity}
        listening={false}
      />
    );
  }

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        x={element.x} y={element.y}
        image={image}
        width={element.width} height={element.height}
        rotation={element.rotation} opacity={element.opacity}
        stroke={isSelected ? '#6366f1' : undefined}
        strokeWidth={isSelected ? 1.5 : 0}
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

ImageElement.displayName = 'ImageElement';
