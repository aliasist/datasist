import { X, Zap, Droplets, DollarSign, Leaf, AlertTriangle, Globe, CheckCircle, Scale } from "lucide-react";
import type { DataCenter } from "@shared/schema";

interface Props {
  facilityA: DataCenter;
  facilityB: DataCenter;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  operational: "#71ff9c",
  under_construction: "#ffb347",
  planned: "#5ef6ff",
  canceled: "#ff5555",
};

function pct(val: number | null | undefined, max: number): number {
  if (!val) return 0;
  return Math.min(100, Math.round((val / max) * 100));
}

interface CompareRowProps {
  label: string;
  valA: string;
  valB: string;
  barA?: number; // 0-100
  barB?: number;
  colorA?: string;
  colorB?: string;
  icon: any;
}

function CompareRow({ label, valA, valB, barA, barB, colorA = "var(--color-green)", colorB = "var(--color-cyan)", icon: Icon }: CompareRowProps) {
  return (
    <div
      className="rounded p-2.5"
      style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={10} style={{ color: "var(--color-text-muted)" }} />
        <span style={{ fontSize: "9px", letterSpacing: "0.1em", color: "var(--color-text-muted)" }}>{label}</span>
      </div>
      <div className="flex gap-3">
        {/* Facility A */}
        <div className="flex-1">
          <div style={{ fontSize: "13px", fontWeight: 700, color: colorA, marginBottom: "4px" }}>{valA}</div>
          {barA !== undefined && (
            <div className="h-1 rounded-full" style={{ background: "var(--color-border)" }}>
              <div
                className="h-1 rounded-full transition-all"
                style={{ width: `${barA}%`, background: colorA, opacity: 0.8 }}
              />
            </div>
          )}
        </div>
        {/* Divider */}
        <div style={{ width: "1px", background: "var(--color-border)" }} />
        {/* Facility B */}
        <div className="flex-1">
          <div style={{ fontSize: "13px", fontWeight: 700, color: colorB, marginBottom: "4px" }}>{valB}</div>
          {barB !== undefined && (
            <div className="h-1 rounded-full" style={{ background: "var(--color-border)" }}>
              <div
                className="h-1 rounded-full transition-all"
                style={{ width: `${barB}%`, background: colorB, opacity: 0.8 }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ComparePanel({ facilityA, facilityB, onClose }: Props) {
  const maxCap = Math.max(facilityA.capacityMW || 0, facilityB.capacityMW || 0);
  const maxWater = Math.max(facilityA.waterUsageMillionGallons || 0, facilityB.waterUsageMillionGallons || 0);
  const maxInvest = Math.max(facilityA.investmentBillions || 0, facilityB.investmentBillions || 0);

  const colorA = "#71ff9c";
  const colorB = "#5ef6ff";

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        background: "var(--color-surface)",
        borderLeft: "1px solid var(--color-border-strong)",
        fontFamily: "'General Sans', sans-serif",
        minWidth: "320px",
        maxWidth: "360px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center gap-2">
          <Scale size={14} style={{ color: "var(--color-green)" }} />
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text)", letterSpacing: "0.05em" }}>
            COMPARE MODE
          </span>
        </div>
        <button
          data-testid="compare-panel-close"
          onClick={onClose}
          className="p-1 rounded hover:opacity-80 transition-opacity"
          style={{ color: "var(--color-text-muted)" }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Facility name headers */}
      <div
        className="grid grid-cols-2 gap-0 border-b flex-shrink-0"
        style={{ borderColor: "var(--color-border)" }}
      >
        {[
          { facility: facilityA, color: colorA },
          { facility: facilityB, color: colorB },
        ].map(({ facility, color }, i) => (
          <div
            key={i}
            className="p-2.5"
            style={{
              borderRight: i === 0 ? `1px solid var(--color-border)` : "none",
              background: `${color}05`,
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color,
                lineHeight: "1.3",
                letterSpacing: "0.03em",
              }}
            >
              {facility.name}
            </div>
            <div style={{ fontSize: "9px", color: "var(--color-text-muted)", marginTop: "2px" }}>
              {facility.city}, {facility.state}
              {facility.country !== "USA" ? `, ${facility.country}` : ""}
            </div>
            <div
              className="inline-block px-1.5 py-0.5 rounded-full mt-1"
              style={{
                fontSize: "8px",
                color: STATUS_COLORS[facility.status] || color,
                background: `${STATUS_COLORS[facility.status] || color}18`,
                border: `1px solid ${STATUS_COLORS[facility.status] || color}35`,
                letterSpacing: "0.05em",
              }}
            >
              {facility.status.replace("_", " ").toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison rows */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        <CompareRow
          label="CAPACITY"
          icon={Zap}
          valA={facilityA.capacityMW ? `${facilityA.capacityMW >= 1000 ? `${(facilityA.capacityMW / 1000).toFixed(1)} GW` : `${facilityA.capacityMW} MW`}` : "—"}
          valB={facilityB.capacityMW ? `${facilityB.capacityMW >= 1000 ? `${(facilityB.capacityMW / 1000).toFixed(1)} GW` : `${facilityB.capacityMW} MW`}` : "—"}
          barA={pct(facilityA.capacityMW, maxCap)}
          barB={pct(facilityB.capacityMW, maxCap)}
          colorA={colorA}
          colorB={colorB}
        />

        <CompareRow
          label="ANNUAL ENERGY USE"
          icon={Zap}
          valA={facilityA.estimatedAnnualGWh ? `${(facilityA.estimatedAnnualGWh / 1000).toFixed(2)} TWh/yr` : "—"}
          valB={facilityB.estimatedAnnualGWh ? `${(facilityB.estimatedAnnualGWh / 1000).toFixed(2)} TWh/yr` : "—"}
          colorA={colorA}
          colorB={colorB}
        />

        <CompareRow
          label="WATER USAGE"
          icon={Droplets}
          valA={facilityA.waterUsageMillionGallons ? `${facilityA.waterUsageMillionGallons}M gal/yr` : "—"}
          valB={facilityB.waterUsageMillionGallons ? `${facilityB.waterUsageMillionGallons}M gal/yr` : "—"}
          barA={pct(facilityA.waterUsageMillionGallons, maxWater)}
          barB={pct(facilityB.waterUsageMillionGallons, maxWater)}
          colorA={colorA}
          colorB={colorB}
        />

        <CompareRow
          label="INVESTMENT"
          icon={DollarSign}
          valA={facilityA.investmentBillions ? `$${facilityA.investmentBillions}B` : "—"}
          valB={facilityB.investmentBillions ? `$${facilityB.investmentBillions}B` : "—"}
          barA={pct(facilityA.investmentBillions, maxInvest)}
          barB={pct(facilityB.investmentBillions, maxInvest)}
          colorA={colorA}
          colorB={colorB}
        />

        <CompareRow
          label="RENEWABLE ENERGY"
          icon={Leaf}
          valA={facilityA.renewablePercent !== null && facilityA.renewablePercent !== undefined ? `${facilityA.renewablePercent}%` : "—"}
          valB={facilityB.renewablePercent !== null && facilityB.renewablePercent !== undefined ? `${facilityB.renewablePercent}%` : "—"}
          barA={facilityA.renewablePercent ?? undefined}
          barB={facilityB.renewablePercent ?? undefined}
          colorA={facilityA.renewablePercent !== null && (facilityA.renewablePercent ?? 0) >= 80 ? "#71ff9c" : "#ffb347"}
          colorB={facilityB.renewablePercent !== null && (facilityB.renewablePercent ?? 0) >= 80 ? "#71ff9c" : "#ffb347"}
        />

        <CompareRow
          label="GRID RISK"
          icon={AlertTriangle}
          valA={facilityA.gridRisk ? facilityA.gridRisk.toUpperCase() : "—"}
          valB={facilityB.gridRisk ? facilityB.gridRisk.toUpperCase() : "—"}
          colorA={facilityA.gridRisk === "high" ? "#ff5555" : facilityA.gridRisk === "medium" ? "#ffb347" : "#71ff9c"}
          colorB={facilityB.gridRisk === "high" ? "#ff5555" : facilityB.gridRisk === "medium" ? "#ffb347" : "#71ff9c"}
        />

        <CompareRow
          label="OPERATOR"
          icon={Globe}
          valA={facilityA.company}
          valB={facilityB.company}
          colorA={colorA}
          colorB={colorB}
        />

        <CompareRow
          label="COMPANY TYPE"
          icon={CheckCircle}
          valA={facilityA.companyType.replace("_", " ").toUpperCase()}
          valB={facilityB.companyType.replace("_", " ").toUpperCase()}
          colorA={colorA}
          colorB={colorB}
        />

        {/* Community resistance */}
        <div
          className="rounded p-2.5"
          style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle size={10} style={{ color: "var(--color-text-muted)" }} />
            <span style={{ fontSize: "9px", letterSpacing: "0.1em", color: "var(--color-text-muted)" }}>COMMUNITY RESISTANCE</span>
          </div>
          <div className="flex gap-3">
            {[facilityA, facilityB].map((f, i) => (
              <div key={i} className="flex-1">
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{
                    fontSize: "10px",
                    background: f.communityResistance ? "rgba(255,85,85,0.12)" : "rgba(113,255,156,0.08)",
                    color: f.communityResistance ? "#ff5555" : "#71ff9c",
                    border: `1px solid ${f.communityResistance ? "rgba(255,85,85,0.3)" : "rgba(113,255,156,0.2)"}`,
                  }}
                >
                  {f.communityResistance ? "Yes — Active" : "None Recorded"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex-shrink-0 px-3 py-2 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p style={{ fontSize: "9px", color: "var(--color-text-muted)", letterSpacing: "0.06em" }}>
          ALIASIST.COM · DataSist Compare · dev@aliasist.com
        </p>
      </div>
    </div>
  );
}
