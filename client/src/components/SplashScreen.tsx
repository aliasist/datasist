import { useEffect, useState } from "react";

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "scan" | "out">("in");
  const [scanLine, setScanLine] = useState(0);
  const [statusLines, setStatusLines] = useState<string[]>([]);

  const BOOT_LINES = [
    "// initializing datasist v2.0.0",
    "// connecting to D1 database...",
    "// loading 48 facilities across 13 countries",
    "// fetching EIA grid data...",
    "// calibrating AI analysis engine",
    "// signal acquired. launching.",
  ];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 300);
    const t2 = setTimeout(() => setPhase("scan"), 800);
    const t3 = setTimeout(() => setPhase("out"), 2800);
    const t4 = setTimeout(() => onDone(), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onDone]);

  // Boot lines stagger in
  useEffect(() => {
    if (phase !== "scan") return;
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => {
        setStatusLines(prev => [...prev, line]);
      }, i * 280);
    });
  }, [phase]);

  // Scan line animation
  useEffect(() => {
    if (phase !== "scan") return;
    const interval = setInterval(() => {
      setScanLine(prev => (prev + 1) % 100);
    }, 16);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "hsl(220, 18%, 6%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.6s ease",
        opacity: phase === "out" ? 0 : 1,
        pointerEvents: phase === "out" ? "none" : "all",
        overflow: "hidden",
      }}
    >
      {/* Grid background */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `
          linear-gradient(hsl(165 90% 42% / 0.04) 1px, transparent 1px),
          linear-gradient(90deg, hsl(165 90% 42% / 0.04) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }} />

      {/* Scan line effect */}
      {phase === "scan" && (
        <div style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 2,
          top: `${scanLine}%`,
          background: "linear-gradient(90deg, transparent, hsl(165 90% 42% / 0.4), transparent)",
          boxShadow: "0 0 12px hsl(165 90% 42% / 0.3)",
          transition: "top 0.016s linear",
          pointerEvents: "none",
        }} />
      )}

      {/* Central glow */}
      <div style={{
        position: "absolute",
        width: 400,
        height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, hsl(165 90% 42% / 0.08) 0%, transparent 70%)",
        animation: "pulse 3s ease-in-out infinite",
      }} />

      {/* Globe/data icon — circuit globe */}
      <div style={{
        position: "relative",
        zIndex: 1,
        transform: phase === "in" ? "scale(0.8) translateY(10px)" : "scale(1) translateY(0)",
        transition: "transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        opacity: phase === "in" ? 0 : 1,
      }}>
        <svg
          viewBox="0 0 120 120"
          width={140}
          style={{
            filter: "drop-shadow(0 0 24px hsl(165, 90%, 42%))",
            animation: "float 4s ease-in-out infinite",
          }}
        >
          {/* Outer circle */}
          <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(165, 90%, 42%)" strokeWidth="1" strokeOpacity="0.6" />
          <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(165, 90%, 42%)" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="4 4" />

          {/* Globe lines — latitude */}
          <ellipse cx="60" cy="60" rx="50" ry="20" fill="none" stroke="hsl(165, 90%, 42%)" strokeWidth="0.6" strokeOpacity="0.4" />
          <ellipse cx="60" cy="60" rx="50" ry="38" fill="none" stroke="hsl(165, 90%, 42%)" strokeWidth="0.4" strokeOpacity="0.25" />

          {/* Globe lines — longitude */}
          <line x1="60" y1="10" x2="60" y2="110" stroke="hsl(165, 90%, 42%)" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="10" y1="60" x2="110" y2="60" stroke="hsl(165, 90%, 42%)" strokeWidth="0.5" strokeOpacity="0.3" />

          {/* Data center nodes */}
          <circle cx="38" cy="45" r="3.5" fill="hsl(165, 90%, 42%)" opacity="0.9">
            <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="72" cy="35" r="3" fill="hsl(165, 90%, 42%)" opacity="0.7">
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.2s" repeatCount="indefinite" begin="0.4s" />
          </circle>
          <circle cx="85" cy="58" r="4" fill="hsl(165, 90%, 42%)" opacity="0.95">
            <animate attributeName="opacity" values="0.95;0.4;0.95" dur="1.5s" repeatCount="indefinite" begin="0.2s" />
          </circle>
          <circle cx="45" cy="72" r="2.5" fill="hsl(165, 90%, 42%)" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.15;0.6" dur="2.6s" repeatCount="indefinite" begin="0.6s" />
          </circle>
          <circle cx="65" cy="75" r="3" fill="hsl(165, 90%, 42%)" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" begin="0.9s" />
          </circle>
          <circle cx="25" cy="62" r="2" fill="hsl(165, 90%, 42%)" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.1;0.5" dur="3s" repeatCount="indefinite" begin="1.1s" />
          </circle>

          {/* Connection lines between nodes */}
          <line x1="38" y1="45" x2="72" y2="35" stroke="hsl(165, 90%, 42%)" strokeWidth="0.6" strokeOpacity="0.3" strokeDasharray="3 3" />
          <line x1="72" y1="35" x2="85" y2="58" stroke="hsl(165, 90%, 42%)" strokeWidth="0.6" strokeOpacity="0.3" strokeDasharray="3 3" />
          <line x1="85" y1="58" x2="65" y2="75" stroke="hsl(165, 90%, 42%)" strokeWidth="0.6" strokeOpacity="0.3" strokeDasharray="3 3" />
          <line x1="38" y1="45" x2="45" y2="72" stroke="hsl(165, 90%, 42%)" strokeWidth="0.6" strokeOpacity="0.25" strokeDasharray="3 3" />
          <line x1="45" y1="72" x2="65" y2="75" stroke="hsl(165, 90%, 42%)" strokeWidth="0.6" strokeOpacity="0.25" strokeDasharray="3 3" />

          {/* Center eye / target */}
          <circle cx="60" cy="60" r="8" fill="none" stroke="hsl(165, 90%, 42%)" strokeWidth="1.2" strokeOpacity="0.8" />
          <circle cx="60" cy="60" r="3" fill="hsl(165, 90%, 42%)" opacity="0.95">
            <animate attributeName="r" values="3;4;3" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <line x1="52" y1="60" x2="56" y2="60" stroke="hsl(165, 90%, 42%)" strokeWidth="1" strokeOpacity="0.8" />
          <line x1="64" y1="60" x2="68" y2="60" stroke="hsl(165, 90%, 42%)" strokeWidth="1" strokeOpacity="0.8" />
          <line x1="60" y1="52" x2="60" y2="56" stroke="hsl(165, 90%, 42%)" strokeWidth="1" strokeOpacity="0.8" />
          <line x1="60" y1="64" x2="60" y2="68" stroke="hsl(165, 90%, 42%)" strokeWidth="1" strokeOpacity="0.8" />
        </svg>
      </div>

      {/* Brand name */}
      <div style={{
        marginTop: 24,
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 30,
        fontWeight: 700,
        color: "#eef1ef",
        letterSpacing: "0.06em",
        position: "relative",
        zIndex: 1,
        opacity: phase === "in" ? 0 : 1,
        transform: phase === "in" ? "translateY(8px)" : "translateY(0)",
        transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
      }}>
        DATA<span style={{ color: "hsl(165, 90%, 42%)" }}>SIST</span>
      </div>

      {/* Tagline */}
      <div style={{
        marginTop: 6,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        color: "hsl(165, 90%, 42%)",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        position: "relative",
        zIndex: 1,
        opacity: phase === "in" ? 0 : 0.7,
        transition: "opacity 0.5s ease 0.4s",
      }}>
        // ai infrastructure intelligence · online
      </div>

      {/* Boot terminal */}
      {phase === "scan" && (
        <div style={{
          marginTop: 28,
          width: 260,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          color: "hsl(165, 90%, 42%)",
          letterSpacing: "0.08em",
          position: "relative",
          zIndex: 1,
          opacity: 0.6,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}>
          {statusLines.map((line, i) => (
            <div
              key={i}
              style={{
                animation: "fadeIn 0.2s ease forwards",
                opacity: 0,
              }}
            >
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Loading bar */}
      <div style={{
        marginTop: 28,
        width: 200,
        height: 2,
        background: "hsl(220 15% 17%)",
        borderRadius: 999,
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
        opacity: phase === "in" ? 0 : 1,
        transition: "opacity 0.3s ease 0.5s",
      }}>
        <div style={{
          height: "100%",
          background: "hsl(165, 90%, 42%)",
          borderRadius: 999,
          animation: "loadBar 2.4s ease forwards",
          boxShadow: "0 0 8px hsl(165, 90%, 42%)",
        }} />
      </div>

      {/* Facility count */}
      <div style={{
        marginTop: 14,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9,
        color: "hsl(220, 10%, 45%)",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        position: "relative",
        zIndex: 1,
        opacity: phase === "scan" ? 0.5 : 0,
        transition: "opacity 0.4s ease 0.8s",
      }}>
        48 facilities · 13 countries · live eia data
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(1deg); }
        }
        @keyframes loadBar {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
