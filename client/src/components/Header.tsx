import { Map, BarChart3, Globe, Zap, Shield } from "lucide-react";
import type { ActiveView } from "../App";

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (v: ActiveView) => void;
}

export default function Header({ activeView, setActiveView }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
        height: "52px",
      }}
    >
      {/* Logo + Brand */}
      <div className="flex items-center gap-3">
        {/* UFO SVG Logo */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          aria-label="DataSist Logo"
          className="flex-shrink-0"
        >
          <circle cx="16" cy="16" r="15" stroke="var(--color-border-strong)" strokeWidth="1" fill="var(--color-surface-2)" />
          <ellipse cx="16" cy="18" rx="9" ry="3.5" fill="none" stroke="var(--color-green)" strokeWidth="1.5" />
          <path d="M7 18 Q10 15 16 14 Q22 15 25 18" fill="var(--color-green)" fillOpacity="0.08" />
          <circle cx="16" cy="14" r="4" fill="none" stroke="var(--color-green)" strokeWidth="1.5" />
          <circle cx="16" cy="14" r="1.5" fill="var(--color-cyan)" fillOpacity="0.7" />
          <circle cx="10" cy="18.5" r="1" fill="var(--color-cyan)" />
          <circle cx="16" cy="21" r="1" fill="var(--color-green)" />
          <circle cx="22" cy="18.5" r="1" fill="var(--color-cyan)" />
        </svg>

        <div className="flex flex-col leading-none">
          <span
            className="font-bold tracking-widest text-glow-green"
            style={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontSize: "15px",
              color: "var(--color-green)",
              letterSpacing: "0.12em",
            }}
          >
            DataSist
          </span>
          <span
            style={{
              fontSize: "9px",
              color: "var(--color-text-muted)",
              letterSpacing: "0.18em",
              fontFamily: "'General Sans', sans-serif",
            }}
          >
            ALIASIST.COM · AI INFRASTRUCTURE INTEL
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex items-center gap-1">
        {[
          { view: "map" as ActiveView, label: "Map", icon: Map, activeColor: "var(--color-green)", activeBg: "rgba(113,255,156,0.08)", activeBorder: "rgba(113,255,156,0.2)" },
          { view: "dashboard" as ActiveView, label: "Intelligence", icon: BarChart3, activeColor: "var(--color-cyan)", activeBg: "rgba(94,246,255,0.08)", activeBorder: "rgba(94,246,255,0.2)" },
          { view: "admin" as ActiveView, label: "Admin", icon: Shield, activeColor: "#ffb347", activeBg: "rgba(255,179,71,0.08)", activeBorder: "rgba(255,179,71,0.2)" },
        ].map(({ view, label, icon: Icon, activeColor, activeBg, activeBorder }) => (
          <button
            key={view}
            data-testid={`nav-${view}`}
            onClick={() => setActiveView(view)}
            className="flex items-center gap-2 px-3 py-1.5 rounded transition-all text-sm font-medium"
            style={{
              background: activeView === view ? activeBg : "transparent",
              color: activeView === view ? activeColor : "var(--color-text-muted)",
              border: activeView === view ? `1px solid ${activeBorder}` : "1px solid transparent",
              fontSize: "13px",
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5" style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
          <Zap size={11} style={{ color: "var(--color-green)" }} />
          <span>LIVE DATA</span>
        </div>
        <a
          href="https://aliasist.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
          style={{ fontSize: "11px", color: "var(--color-text-muted)", letterSpacing: "0.05em" }}
        >
          <Globe size={11} />
          aliasist.com
        </a>
      </div>
    </header>
  );
}
