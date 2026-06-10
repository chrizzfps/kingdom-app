import { useEffect, useRef, useState, memo } from 'react';
import type { ProposalModule } from '@/types/proposal';
import type { WhiteboardElement } from '@/types/whiteboard';
import { WhiteboardCanvas } from '@/components/whiteboard/WhiteboardCanvas';
import { MotionSection } from '../common/MotionSection';

interface Props {
  module: ProposalModule;
}

function WhiteboardSectionInner({ module }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 }); // start 0 to wait for mount
  const [localStage, setLocalStage] = useState({ x: 0, y: 0, scale: 1 });

  const rawElements: WhiteboardElement[] = Array.isArray(module.data?.elements)
    ? module.data.elements
    : [];

  useEffect(() => {
    // Auto-center the canvas on the bounding box of all elements
    if (rawElements.length > 0 && dimensions.width > 0 && dimensions.height > 0) {
      const xs = rawElements.map((e) => e.x);
      const ys = rawElements.map((e) => e.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      const contentWidth = maxX - minX + 200; // Extra padding
      const contentHeight = maxY - minY + 200;

      // Calculate scale to fit all elements in viewport, max scale 1
      const scaleX = dimensions.width / contentWidth;
      const scaleY = dimensions.height / contentHeight;
      const scale = Math.min(scaleX, scaleY, 1);

      // Center exactly
      const x = (dimensions.width / scale - contentWidth) / 2 - minX + 100;
      const y = (dimensions.height / scale - contentHeight) / 2 - minY + 100;

      setLocalStage({ x: x * scale, y: y * scale, scale });
    } else {
      setLocalStage({ x: 0, y: 0, scale: 1 });
    }
  }, [module.id, rawElements, dimensions.width, dimensions.height]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    observer.observe(container);
    setDimensions({ width: container.clientWidth, height: container.clientHeight });
    return () => observer.disconnect();
  }, []);

  if (rawElements.length === 0) {
    return (
      <MotionSection minH="min-h-[100dvh]" className="bg-zinc-950">
        <div className="flex flex-col items-center justify-center p-20 opacity-50">
          <div className="text-4xl text-zinc-700 mb-3">✦</div>
          <p className="text-zinc-500 text-sm">Canvas vacío</p>
        </div>
      </MotionSection>
    );
  }

  return (
    <MotionSection minH="min-h-[100dvh]" className="w-full bg-zinc-950 overflow-hidden relative">
      {module.data?.title && (
        <div className="absolute top-8 left-10 z-20 pointer-events-none mix-blend-difference">
          <h2 className="text-xl font-medium text-white tracking-tight opacity-80">
            {module.data.title}
          </h2>
        </div>
      )}

      {/* The container takes full bounds of the slide for Konva to render full-bleed */}
      <div className="z-10 w-full h-[100dvh]" ref={containerRef}>
        {dimensions.width > 0 && dimensions.height > 0 && (
          <WhiteboardCanvas
            width={dimensions.width}
            height={dimensions.height}
            readOnly
            elements={rawElements}
            stage={localStage}
          />
        )}
      </div>

      {/* Subtle border around the slide screen to match premium look if we want, or just full bleed */}
      <div className="absolute inset-0 pointer-events-none border border-white/5 z-20 rounded-[2rem] m-2 md:m-4" />
    </MotionSection>
  );
}

export const WhiteboardSection = memo(WhiteboardSectionInner);
