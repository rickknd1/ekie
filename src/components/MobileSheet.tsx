"use client";
import { useRef } from "react";
import { ChevronUp } from "lucide-react";

export type Snap = "collapsed" | "half" | "full";
// hauteur de la sheet = 86dvh ; on la descend pour ne laisser qu'une barre fine quand "collapsed"
const TRANSLATE: Record<Snap, string> = {
  collapsed: "calc(86dvh - 54px)", // ne laisse que la poignée + le titre → carte quasi plein écran
  half: "46dvh",
  full: "0dvh",
};

export default function MobileSheet({
  snap,
  onSnap,
  title,
  badge,
  children,
}: {
  snap: Snap;
  onSnap: (s: Snap) => void;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  const startY = useRef<number | null>(null);

  function cycle() {
    onSnap(snap === "collapsed" ? "half" : snap === "half" ? "full" : "collapsed");
  }
  function onTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0].clientY;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const sy = startY.current;
    startY.current = null;
    if (sy == null) return;
    const dy = e.changedTouches[0].clientY - sy;
    if (dy > 40) onSnap(snap === "full" ? "half" : "collapsed"); // vers le bas
    else if (dy < -40) onSnap(snap === "collapsed" ? "half" : "full"); // vers le haut
  }

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-[615] h-[86dvh] rounded-t-[20px] border-t border-[var(--line)] bg-[var(--surface)] px-5 transition-transform duration-300 md:hidden"
      style={{ transform: `translateY(${TRANSLATE[snap]})` }}
    >
      <div
        onClick={cycle}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="cursor-pointer select-none pb-2 pt-2"
      >
        <div className="mx-auto mb-2 h-1 w-9 rounded-full bg-[var(--line-strong)]" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold tracking-tight">{title}</span>
            <ChevronUp
              size={16}
              className={`text-[var(--txt-3)] transition-transform ${snap === "full" ? "rotate-180" : ""}`}
            />
          </div>
          {badge}
        </div>
      </div>
      <div className="h-[calc(86dvh-92px)] overflow-y-auto no-sb">{children}</div>
    </div>
  );
}
