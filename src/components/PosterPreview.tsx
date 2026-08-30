import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, Smartphone, Image as ImageIcon } from "lucide-react";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

interface PosterPreviewProps {
  /** Object URL of the generated poster. */
  src: string;
  alt?: string;
  /** Optional caption shown in the phone mock (e.g. how the post looks). */
  caption?: string;
}

/**
 * Poster preview with wheel/pinch zoom, drag-to-pan and a phone mockup mode
 * so the user can see how the image will look on a mobile screen.
 */
export function PosterPreview({ src, alt = "Pré-visualização", caption }: PosterPreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [phoneMode, setPhoneMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const stateRef = useRef({ zoom, offset });
  stateRef.current = { zoom, offset };

  const reset = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    reset();
  }, [src, phoneMode, reset]);

  const zoomAt = useCallback((next: number, px: number, py: number) => {
    const { zoom: z, offset: o } = stateRef.current;
    const clamped = clamp(next, MIN_ZOOM, MAX_ZOOM);
    const k = clamped / z;
    setZoom(clamped);
    setOffset({ x: px - (px - o.x) * k, y: py - (py - o.y) * k });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const next = stateRef.current.zoom * Math.exp(-dy * 0.0018);
      zoomAt(next, e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const zoomByButton = (factor: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    zoomAt(stateRef.current.zoom * factor, rect.width / 2, rect.height / 2);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (stateRef.current.zoom <= 1) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    setOffset({ x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) });
  };
  const endDrag = () => {
    dragRef.current = null;
  };

  const image = (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className="max-h-full w-auto max-w-full select-none rounded-md shadow-md"
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
        transformOrigin: "0 0",
      }}
    />
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Diminuir zoom"
            onClick={() => zoomByButton(1 / 1.3)}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Aumentar zoom"
            onClick={() => zoomByButton(1.3)}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Redefinir zoom"
            onClick={reset}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <span className="ml-1 text-xs font-semibold text-muted-foreground tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
        </div>
        <Button
          type="button"
          variant={phoneMode ? "default" : "outline"}
          size="sm"
          className="gap-2"
          aria-pressed={phoneMode}
          onClick={() => setPhoneMode((v) => !v)}
        >
          {phoneMode ? <ImageIcon className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
          {phoneMode ? "Ver imagem" : "Ver no celular"}
        </Button>
      </div>

      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className="relative flex h-[52vh] items-center justify-center overflow-hidden rounded-lg bg-muted/40 p-3 touch-none"
        style={{ cursor: zoom > 1 ? "grab" : "default" }}
      >
        {phoneMode ? (
          <div className="flex h-full max-h-full w-[240px] flex-col overflow-hidden rounded-[2rem] border-[8px] border-foreground/80 bg-background shadow-xl">
            <div className="flex justify-center bg-foreground/80 pb-1">
              <div className="h-1.5 w-16 rounded-full bg-background/50" />
            </div>
            <div className="flex flex-1 items-center justify-center overflow-hidden p-2">
              {image}
            </div>
            {caption && (
              <p className="border-t border-border px-2 py-1.5 text-[11px] leading-snug text-muted-foreground line-clamp-2">
                {caption}
              </p>
            )}
          </div>
        ) : (
          image
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Use a roda do mouse ou os botões para dar zoom; arraste para mover.
      </p>
    </div>
  );
}
