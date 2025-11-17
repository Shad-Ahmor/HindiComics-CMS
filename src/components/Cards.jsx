import React, { useRef } from "react";

function useTilt() {
  const ref = useRef(null);

  if (typeof window !== 'undefined' && window.matchMedia("(pointer: coarse)").matches) {
    return { ref, handleMove: () => {}, resetTilt: () => {} };
  }

  function handleMove(e) {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const tiltX = (y / rect.height) * -8;
    const tiltY = (x / rect.width) * 8;

    el.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.03)`;
  }

  function resetTilt() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  }

  return { ref, handleMove, resetTilt };
}

function GlassCard({ children, className }) {
  const { ref, handleMove, resetTilt } = useTilt();

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={resetTilt}
      className={`glass-card rounded-2xl p-6 transition-all duration-300 ${className}`}
      style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
    >
      {children}
    </div>
  );
}

export function StatCard({ title, value, icon: Icon, accent }) {
  return (
    <GlassCard className="flex items-center gap-5 cursor-pointer" style={{ borderLeft: `5px solid ${accent}`, boxShadow: `inset 0 0 30px ${accent}33` }}>
      <div className="p-4 rounded-xl" style={{ background: `${accent}22`, boxShadow: `0 0 20px ${accent}55` }}>
        <Icon size={28} color={accent} />
      </div>
      <div>
        <p className="text-sm opacity-70">{title}</p>
        <h2 className="text-3xl font-bold">{value}</h2>
      </div>
    </GlassCard>
  );
}

export function ActionCard({ label, icon: Icon, onClick }) {
  return (
    <GlassCard className="flex items-center gap-4 cursor-pointer" onClick={onClick}>
      <Icon size={24} className="opacity-90" />
      <span className="text-lg font-medium">{label}</span>
    </GlassCard>
  );
}
