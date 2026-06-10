import React, { memo, useRef, useCallback } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import type { StickyElement as StickyEl } from '@/types/whiteboard';
import { useWhiteboardStore } from '@/store/whiteboardStore';
import type Konva from 'konva';

interface Props {
  element: StickyEl;
  isSelected: boolean;
  readOnly?: boolean;
}

export const StickyElement = memo(({ element, isSelected, readOnly }: Props) => {
  const groupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const { updateElement, setSelected, addToSelection, setEditingTextId, editingTextId } = useWhiteboardStore();

  const isEditing = editingTextId === element.id;

  React.useEffect(() => {
    if (isSelected && trRef.current && groupRef.current && !readOnly) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, readOnly]);

  const handleDblClick = useCallback(() => {
    if (readOnly) return;
    const group = groupRef.current;
    if (!group) return;
    setEditingTextId(element.id);

    const stage = group.getStage();
    const stageBox = stage?.container().getBoundingClientRect();
    if (!stageBox) return;

    const pos = group.getAbsolutePosition();
    const scale = group.getAbsoluteScale().x;

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.value = element.text;
    textarea.style.cssText = `
      position: fixed;
      top: ${stageBox.top + pos.y + 24 * scale}px;
      left: ${stageBox.left + pos.x + 8 * scale}px;
      width: ${(element.width - 16) * scale}px;
      height: ${(element.height - 32) * scale}px;
      font-size: ${element.fontSize * scale}px;
      font-family: Inter, sans-serif;
      color: ${element.textColor};
      background: transparent;
      border: none;
      outline: none;
      resize: none;
      padding: 0;
      z-index: 9999;
    `;
    textarea.focus();

    const finish = () => {
      updateElement(element.id, { text: textarea.value });
      setEditingTextId(null);
      document.body.removeChild(textarea);
      textarea.removeEventListener('blur', finish);
    };
    textarea.addEventListener('blur', finish);
  }, [element, readOnly, setEditingTextId, updateElement]);

  const content = (
    <>
      {/* Shadow (folded corner effect) */}
      <Rect
        x={0} y={0}
        width={element.width} height={element.height}
        fill={element.fill}
        cornerRadius={4}
        shadowColor="rgba(0,0,0,0.18)"
        shadowBlur={12}
        shadowOffset={{ x: 2, y: 4 }}
      />
      {/* Top bar */}
      <Rect
        x={0} y={0}
        width={element.width} height={22}
        fill="rgba(0,0,0,0.07)"
        cornerRadius={[4, 4, 0, 0]}
      />
      {/* Text */}
      <Text
        x={8} y={28}
        width={element.width - 16}
        height={element.height - 36}
        text={isEditing ? '' : element.text}
        fontSize={element.fontSize}
        fontFamily="Inter, sans-serif"
        fill={element.textColor}
        wrap="word"
        ellipsis
      />
    </>
  );

  if (readOnly) {
    return (
      <Group x={element.x} y={element.y} rotation={element.rotation} opacity={element.opacity} listening={false}>
        {content}
      </Group>
    );
  }

  return (
    <>
      <Group
        ref={groupRef}
        x={element.x} y={element.y}
        rotation={element.rotation} opacity={element.opacity}
        draggable
        onClick={(e) => {
          if (e.evt.shiftKey) { addToSelection(element.id); } else { setSelected([element.id]); }
        }}
        onTap={() => setSelected([element.id])}
        onDblClick={handleDblClick}
        onDblTap={handleDblClick}
        onDragEnd={(e) => updateElement(element.id, { x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = groupRef.current!;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1); node.scaleY(1);
          updateElement(element.id, {
            x: node.x(), y: node.y(),
            width: Math.max(100, element.width * scaleX),
            height: Math.max(80, element.height * scaleY),
            rotation: node.rotation(),
          });
        }}
      >
        {content}
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          nodes={groupRef.current ? [groupRef.current] : []}
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

StickyElement.displayName = 'StickyElement';
