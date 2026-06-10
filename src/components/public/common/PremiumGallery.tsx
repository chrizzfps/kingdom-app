import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export function PremiumGallery({
  images,
  className = '',
}: {
  images: { src: string; alt?: string }[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  const onOpen = (idx: number) => {
    setActive(idx);
    setOpen(true);
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {images.map((img, idx) => (
        <button
          key={idx}
          onClick={() => onOpen(idx)}
          className="group relative rounded-xl overflow-hidden border border-white/10 bg-white/5"
        >
          {!failed[idx] ? (
            <img
              src={img.src}
              alt={img.alt || 'Imagen'}
              loading="lazy"
              className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              onError={() => setFailed((p) => ({ ...p, [idx]: true }))}
            />
          ) : (
            <div
              className="h-44 w-full transition-transform duration-500 group-hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(51,204,255,0.25), rgba(0,84,223,0.25))',
              }}
              aria-label="Imagen no disponible"
            />
          )}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        </button>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 bg-black/80 border-white/10">
          {active !== null && (
            !failed[active] ? (
              <img
                src={images[active].src}
                alt={images[active].alt || 'Imagen ampliada'}
                className="w-full h-full object-contain"
                onError={() => setFailed((p) => ({ ...p, [active!]: true }))}
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(51,204,255,0.25), rgba(0,84,223,0.25))',
                }}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
