import React, { useRef, useCallback, memo } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { ZoomIn, ZoomOut } from 'lucide-react';
import type Konva from 'konva';
import { useWhiteboardStore } from '@/store/whiteboardStore';
import { makeRect, makeCircle, makeText, makeSticky, makeArrow } from '@/store/whiteboardStore';
import { RectElement } from './elements/RectElement';
import { CircleElement } from './elements/CircleElement';
import { TextElement } from './elements/TextElement';
import { StickyElement } from './elements/StickyElement';
import { ImageElement } from './elements/ImageElement';
import { ArrowElement } from './elements/ArrowElement';
import type { WhiteboardElement } from '@/types/whiteboard';

const DOT_SPACING = 32;
const WHEEL_SCALE_FACTOR = 1.08;
const MIN_SCALE = 0.1;
const MAX_SCALE = 5;

function buildDotGrid(stageX: number, stageY: number, scale: number, width: number, height: number) {
  const dots: { x: number; y: number }[] = [];
  const spacing = DOT_SPACING * scale;
  const startX = (-stageX / scale / DOT_SPACING) * DOT_SPACING * scale + (stageX % spacing);
  const startY = (-stageY / scale / DOT_SPACING) * DOT_SPACING * scale + (stageY % spacing);

  for (let x = startX; x < width; x += spacing) {
    for (let y = startY; y < height; y += spacing) {
      dots.push({ x, y });
    }
  }
  return dots;
}

interface Props {
  width: number;
  height: number;
  readOnly?: boolean;
  elements?: WhiteboardElement[];
  stage?: { x: number; y: number; scale: number };
}

export const WhiteboardCanvas = memo(({ width, height, readOnly = false, elements: propElements, stage: propStage }: Props) => {
  const stageRef = useRef<Konva.Stage>(null);
  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const spaceDown = useRef(false);

  const {
    elements: storeElements, selectedIds, stage: storeStage, tool,
    setStage: setStoreStage, clearSelection, addElement,
  } = useWhiteboardStore();

  const elements = propElements ?? storeElements;

  // Local stage override for read-only / public views (don't mutate global store)
  const [localStage, setLocalStage] = React.useState(propStage || { x: 0, y: 0, scale: 1 });
  
  React.useEffect(() => {
    if (propStage) setLocalStage(propStage);
  }, [propStage]);

  const stage = propStage ? localStage : storeStage;

  const setStage = useCallback((newStage: any) => {
    if (propStage) {
      setLocalStage((prev) => ({ ...prev, ...newStage }));
    } else {
      setStoreStage(newStage);
    }
  }, [propStage, setStoreStage]);

  // ── Keyboard listeners ────────────────────────
  React.useEffect(() => {
    if (readOnly) return;

    const onKeyDown = (e: KeyboardEvent) => {
      // More robust check: if any input/textarea is active, don't intercept Space
      const activeEl = document.activeElement?.tagName;
      if (activeEl === 'TEXTAREA' || activeEl === 'INPUT') return;
      
      if (e.code === 'Space') { 
        spaceDown.current = true; 
        if (e.target === document.body || e.target === stageRef.current?.container()) {
          e.preventDefault(); 
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') { spaceDown.current = false; }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, [readOnly]);

  // ── Wheel zoom ────────────────────────────────
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    if (readOnly) return; // Natural page scroll for public view
    e.evt.preventDefault();
    const s = stageRef.current;
    if (!s) return;

    const oldScale = stage.scale;
    const pointer = s.getPointerPosition()!;
    const mousePointTo = { x: (pointer.x - stage.x) / oldScale, y: (pointer.y - stage.y) / oldScale };

    const direction = e.evt.deltaY < 0 ? 1 : -1;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, oldScale * (direction > 0 ? WHEEL_SCALE_FACTOR : 1 / WHEEL_SCALE_FACTOR)));

    setStage({
      scale: newScale,
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  }, [stage, setStage]);

  // ── Mouse down ────────────────────────────────
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // Panning with Space, middle mouse, or ANY drag if readOnly
    if (readOnly || spaceDown.current || e.evt.button === 1) {
      isPanning.current = true;
      lastPos.current = { x: e.evt.clientX, y: e.evt.clientY };
      e.evt.preventDefault();
      return;
    }

    if (readOnly) return;

    // Click on empty stage → deselect / add element
    if (e.target === e.target.getStage()) {
      if (tool === 'select') {
        clearSelection();
        return;
      }

      const s = stageRef.current!;
      const pos = s.getPointerPosition()!;
      const worldX = (pos.x - stage.x) / stage.scale;
      const worldY = (pos.y - stage.y) / stage.scale;

      switch (tool) {
        case 'rect': addElement(makeRect(worldX - 100, worldY - 60)); break;
        case 'circle': addElement(makeCircle(worldX, worldY)); break;
        case 'text': addElement(makeText(worldX - 100, worldY - 12)); break;
        case 'sticky': addElement(makeSticky(worldX - 100, worldY - 80)); break;
        case 'arrow': addElement(makeArrow(worldX - 80, worldY)); break;
        default: break;
      }
    }
  }, [readOnly, tool, stage, clearSelection, addElement]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isPanning.current) return;
    const dx = e.evt.clientX - lastPos.current.x;
    const dy = e.evt.clientY - lastPos.current.y;
    lastPos.current = { x: e.evt.clientX, y: e.evt.clientY };
    setStage({ x: stage.x + dx, y: stage.y + dy });
  }, [stage, setStage]);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  // ── Button Zoom (ReadOnly) ────────────────────
  const zoomIn = useCallback(() => {
    const s = stageRef.current;
    if (!s) return;
    const oldScale = stage.scale;
    const newScale = Math.min(MAX_SCALE, oldScale * 1.3);
    const center = { x: width / 2, y: height / 2 };
    const mousePointTo = { x: (center.x - stage.x) / oldScale, y: (center.y - stage.y) / oldScale };
    setStage({
      scale: newScale,
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    });
  }, [stage, width, height, setStage]);

  const zoomOut = useCallback(() => {
    const s = stageRef.current;
    if (!s) return;
    const oldScale = stage.scale;
    const newScale = Math.max(MIN_SCALE, oldScale / 1.3);
    const center = { x: width / 2, y: height / 2 };
    const mousePointTo = { x: (center.x - stage.x) / oldScale, y: (center.y - stage.y) / oldScale };
    setStage({
      scale: newScale,
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    });
  }, [stage, width, height, setStage]);

  // ── Dot grid overlay ──────────────────────────
  const dots = readOnly ? [] : buildDotGrid(stage.x, stage.y, stage.scale, width, height);

  const renderElement = (el: WhiteboardElement) => {
    const isSelected = selectedIds.includes(el.id);
    const props = { key: el.id, element: el as any, isSelected, readOnly };
    switch (el.type) {
      case 'rect': return <RectElement {...props} />;
      case 'circle': return <CircleElement {...props} />;
      case 'text': return <TextElement {...props} />;
      case 'sticky': return <StickyElement {...props} />;
      case 'image': return <ImageElement {...props} />;
      case 'arrow': return <ArrowElement {...props} />;
      default: return null;
    }
  };

  return (
    <>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        x={stage.x}
        y={stage.y}
        scaleX={stage.scale}
        scaleY={stage.scale}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: readOnly || spaceDown.current ? 'grab' : tool === 'select' ? 'default' : 'crosshair' }}
        listening={true}
      >
        {/* Dot grid layer (static, no transforms needed — rendered in screen space) */}
        {!readOnly && (
          <Layer listening={false}>
            {dots.map((d, i) => (
              <Line
                key={i}
                points={[d.x, d.y, d.x + 0.5, d.y + 0.5]}
                stroke="rgba(113,113,122,0.35)"
                strokeWidth={2}
                lineCap="round"
              />
            ))}
          </Layer>
        )}
        {/* Elements layer */}
        <Layer>
          {[...elements].sort((a, b) => a.zIndex - b.zIndex).map(renderElement)}
        </Layer>
      </Stage>

      {/* Floating ReadOnly Controls */}
      {readOnly && (
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-50">
          <button
            onClick={zoomIn}
            className="w-10 h-10 flex items-center justify-center bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full shadow-lg backdrop-blur border border-white/10 transition-colors"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={zoomOut}
            className="w-10 h-10 flex items-center justify-center bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full shadow-lg backdrop-blur border border-white/10 transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  );
});

WhiteboardCanvas.displayName = 'WhiteboardCanvas';
