import React, { memo, useRef, useCallback } from 'react';
import { Text, Transformer, Rect } from 'react-konva';
import type { TextElement as TextEl } from '@/types/whiteboard';
import { useWhiteboardStore } from '@/store/whiteboardStore';
import type Konva from 'konva';

interface Props {
  element: TextEl;
  isSelected: boolean;
  readOnly?: boolean;
}

export const TextElement = memo(({ element, isSelected, readOnly }: Props) => {
  const shapeRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const { updateElement, setSelected, addToSelection, setEditingTextId, editingTextId } = useWhiteboardStore();

  const isEditing = editingTextId === element.id;

  React.useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current && !readOnly && !isEditing) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, readOnly, isEditing]);

  // Position the HTML textarea overlay on double-click
  const handleDblClick = useCallback(() => {
    if (readOnly) return;
    const node = shapeRef.current;
    if (!node) return;
    setEditingTextId(element.id);

    const stage = node.getStage();
    const stageBox = stage?.container().getBoundingClientRect();
    if (!stageBox) return;

    const areaPosition = {
      x: stageBox.left + node.getAbsolutePosition().x,
      y: stageBox.top + node.getAbsolutePosition().y,
    };

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    const scale = node.getAbsoluteScale().x;
    textarea.value = element.text;
    textarea.style.cssText = `
      position: fixed;
      top: ${areaPosition.y}px;
      left: ${areaPosition.x}px;
      width: ${element.width * scale}px;
      min-height: 40px;
      font-size: ${element.fontSize * scale}px;
      font-family: ${element.fontFamily};
      font-style: ${element.fontStyle.includes('italic') ? 'italic' : 'normal'};
      font-weight: ${element.fontStyle.includes('bold') ? 'bold' : 'normal'};
      text-align: ${element.align || 'left'};
      color: ${element.fill};
      border: 1.5px solid #6366f1;
      border-radius: 4px;
      padding: 2px 4px;
      margin: 0;
      overflow: hidden;
      resize: none;
      line-height: 1.4;
      background: transparent;
      outline: none;
      z-index: 9999;
    `;

    textarea.focus();
    textarea.selectionStart = textarea.value.length;

    const updateTextareaSize = () => {
      textarea.style.width = 'auto'; // Reset to calculate
      textarea.style.width = Math.max(element.width * scale, textarea.scrollWidth) + 'px';
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    };

    updateTextareaSize();

    const onKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation(); // VERY IMPORTANT: stop the event from reaching window listeners
      if (e.key === 'Escape') {
        finish();
      }
      // Enter now allows multiline IF we want, but the user wants auto-expansion.
      // Usually Enter finishes unless Shift+Enter. 
      if (e.key === 'Enter' && !e.shiftKey) {
        finish();
      }
    };

    const onInput = () => {
      updateTextareaSize();
    };

    const finish = () => {
      const node = shapeRef.current;
      // If the user hasn't manually resized (width was default or they didn't touch handles), 
      // we might want to update the element width to the new measured width.
      // For now, let's update text and recalculate width based on node.
      if (node) {
        // We update text first, then measure
        updateElement(element.id, { 
          text: textarea.value,
          width: node.width(), // Konva Text with width=undefined/default would give us content width
        });
      }
      setEditingTextId(null);
      document.body.removeChild(textarea);
      textarea.removeEventListener('keydown', onKeyDown);
      textarea.removeEventListener('input', onInput);
      textarea.removeEventListener('blur', finish);
    };

    textarea.addEventListener('keydown', onKeyDown);
    textarea.addEventListener('input', onInput);
    textarea.addEventListener('blur', finish);
  }, [element, readOnly, setEditingTextId, updateElement]);

  if (readOnly) {
    return (
      <Text
        x={element.x} y={element.y}
        text={element.text}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fontStyle={element.fontStyle}
        fill={element.fill}
        align={element.align}
        width={element.width}
        rotation={element.rotation}
        opacity={element.opacity}
        listening={false}
      />
    );
  }

  return (
    <>
      {isEditing && (
        <Rect
          x={element.x - 4} y={element.y - 4}
          width={(element.width || 100) + 8} height={element.fontSize * 2 + 8}
          fill="transparent"
        />
      )}
      <Text
        ref={shapeRef}
        x={element.x} y={element.y}
        text={isEditing ? '' : element.text}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fontStyle={element.fontStyle}
        fill={element.fill}
        align={element.align}
        width={element.width === 0 ? undefined : element.width}
        rotation={element.rotation}
        opacity={element.opacity}
        draggable
        onClick={(e) => {
          if (e.evt.shiftKey) { addToSelection(element.id); } else { setSelected([element.id]); }
        }}
        onTap={() => setSelected([element.id])}
        onDblClick={handleDblClick}
        onDblTap={handleDblClick}
        onDragEnd={(e) => updateElement(element.id, { x: e.target.x(), y: e.target.y() })}
        onTransform={() => {
          // Snap bounding box purely to width during transform and reset scaling
          const node = shapeRef.current;
          if (node) {
            node.setAttrs({
              width: Math.max(node.width() * node.scaleX(), 50),
              scaleX: 1,
              scaleY: 1,
            });
          }
        }}
        onTransformEnd={() => {
          const node = shapeRef.current!;
          node.scaleX(1); node.scaleY(1);
          updateElement(element.id, {
            x: node.x(), y: node.y(),
            width: Math.max(50, node.width()),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && !isEditing && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          enabledAnchors={['middle-left', 'middle-right']}
          borderStroke="#6366f1"
          borderStrokeWidth={1.5}
          anchorFill="#fff"
          anchorStroke="#6366f1"
          anchorSize={8}
          anchorCornerRadius={2}
          boundBoxFunc={(_, newBox) => {
            newBox.width = Math.max(30, newBox.width);
            return newBox;
          }}
        />
      )}
    </>
  );
});

TextElement.displayName = 'TextElement';
