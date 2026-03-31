import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { DataCenter } from "@shared/schema";
import DataCenterPanel from "../components/DataCenterPanel";
import AIChatPanel from "../components/AIChatPanel";
import ComparePanel from "../components/ComparePanel";
import { Filter, Search, X, Sparkles, Scale } from "lucide-react";

declare global {
  interface Window {
    L: any;
  }
}

const STATUS_COLORS: Record<string, string> = {
  operational: "#71ff9c",
  under_construction: "#ffb347",
  planned: "#5ef6ff",
  canceled: "#ff5555",
};

const STATUS_PULSE: Record<string, string> = {
  operational: "ufo-pulse",
  under_construction: "ufo-pulse-orange",
  planned: "ufo-pulse-cyan",
  canceled: "ufo-pulse-red",
};

// Region groupings
const REGIONS: Record<string, string[]> = {
  "USA — Northeast": ["New York", "New Jersey", "Connecticut", "Massachusetts", "Pennsylvania", "Maryland", "Delaware"],
  "USA — Southeast": ["Virginia", "North Carolina", "South Carolina", "Georgia", "Florida", "Tennessee", "Louisiana"],
  "USA — Midwest": ["Ohio", "Indiana", "Illinois", "Wisconsin", "Michigan", "Iowa"],
  "USA — South Central": ["Texas", "Oklahoma", "Arkansas", "Mississippi", "Alabama"],
  "USA — West": ["Oregon", "Washington", "California", "Nevada", "Arizona", "Colorado"],
  "Europe": [],
  "Asia-Pacific": [],
  "Middle East": [],
};

const COUNTRY_TO_REGION: Record<string, string> = {
  Denmark: "Europe",
  Ireland: "Europe",
  Germany: "Europe",
  Netherlands: "Europe",
  "United Kingdom": "Europe",
  Japan: "Asia-Pacific",
  Singapore: "Asia-Pacific",
  "South Korea": "Asia-Pacific",
  Australia: "Asia-Pacific",
  UAE: "Middle East",
  "Saudi Arabia": "Middle East",
};

function getRegion(c: DataCenter): string {
  if (c.country !== "USA" && c.country !== "United States") {
    return COUNTRY_TO_REGION[c.country] || "International";
  }
  for (const [region, states] of Object.entries(REGIONS)) {
    if (states.includes(c.state)) return region;
  }
  return "USA — Other";
}

function getMarkerHtml(center: DataCenter) {
  const color = STATUS_COLORS[center.status] || "#71ff9c";
  const size = center.capacityMW
    ? Math.max(10, Math.min(28, 10 + (center.capacityMW / 1000) * 18))
    : 12;

  return `
    <div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${color}25;
      border: 1.5px solid ${color};
      cursor: pointer;
      animation: ${STATUS_PULSE[center.status] || "ufo-pulse"} 2.5s ease-in-out infinite;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    ">
      <div style="
        width: ${Math.max(4, size * 0.35)}px;
        height: ${Math.max(4, size * 0.35)}px;
        border-radius: 50%;
        background: ${color};
      "></div>
    </div>
  `;
}

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [selectedCenter, setSelectedCenter] = useState<DataCenter | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [leafletReady, setLeafletReady] = useState(false);

  // AI Chat panel state
  const [aiChatFacility, setAiChatFacility] = useState<DataCenter | null | undefined>(undefined);
  // undefined = closed, null = global, DataCenter = facility-specific

  // Compare mode
  const [compareSelections, setCompareSelections] = useState<DataCenter[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const { data: centers = [], isLoading } = useQuery<DataCenter[]>({
    queryKey: ["/api/data-centers"],
    queryFn: () => apiRequest("GET", "/api/data-centers").then((r) => r.json()),
  });

  // Compute unique companies and regions
  const companies = [...new Set(centers.map((c) => c.company))].sort();
  const availableRegions = [...new Set(centers.map(getRegion))].sort();

  // Load Leaflet dynamically
  useEffect(() => {
    if (window.L) { setLeafletReady(true); return; }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setLeafletReady(true);
    document.head.appendChild(script);
  }, []);

  // Init map
  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapInstanceRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, {
      center: [38, -95],
      zoom: 4,
      zoomControl: true,
      attributionControl: true,
    });

    // CartoDB Dark Matter — native dark tiles, no CSS filter needed
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
  }, [leafletReady]);

  // Update markers on filter change
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletReady || centers.length === 0) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    const filtered = centers.filter((c) => {
      const statusMatch = filterStatus === "all" || c.status === filterStatus;
      const companyMatch = filterCompany === "all" || c.company === filterCompany;
      const regionMatch = filterRegion === "all" || getRegion(c) === filterRegion;
      const searchMatch =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && companyMatch && regionMatch && searchMatch;
    });

    filtered.forEach((center) => {
      const icon = L.divIcon({
        html: getMarkerHtml(center),
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([center.lat, center.lng], { icon });
      marker.on("click", () => setSelectedCenter(center));

      const models: string[] = center.primaryModels ? JSON.parse(center.primaryModels) : [];
      const color = STATUS_COLORS[center.status] || "#71ff9c";
      marker.bindTooltip(
        `<div style="font-family:'General Sans',sans-serif;min-width:160px;max-width:220px;">
          <div style="font-weight:700;font-size:12px;color:#d6f5e0;margin-bottom:4px;">${center.name}</div>
          <div style="font-size:10px;color:#7aad8a;margin-bottom:4px;">${center.company} · ${center.city}, ${center.state}${center.country !== "USA" ? ", " + center.country : ""}</div>
          ${center.capacityMW ? `<div style="font-size:11px;color:${color};font-weight:600;">${center.capacityMW >= 1000 ? `${(center.capacityMW / 1000).toFixed(1)} GW` : `${center.capacityMW} MW`} capacity</div>` : ""}
          ${models.length > 0 ? `<div style="font-size:10px;color:#7aad8a;margin-top:2px;">${models.slice(0, 2).join(", ")}${models.length > 2 ? ` +${models.length - 2}` : ""}</div>` : ""}
          <div style="font-size:10px;margin-top:4px;padding:2px 5px;border-radius:3px;display:inline-block;background:${color}25;color:${color};border:1px solid ${color}40;">${center.status.replace("_", " ")}</div>
        </div>`,
        {
          permanent: false,
          direction: "top",
          offset: [0, -8],
          className: "datasist-tooltip",
        }
      );

      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [centers, filterStatus, filterCompany, filterRegion, searchQuery, leafletReady]);

  // Compare handlers
  function handleToggleCompare(center: DataCenter) {
    setCompareSelections((prev) => {
      if (prev.find((c) => c.id === center.id)) {
        return prev.filter((c) => c.id !== center.id);
      }
      if (prev.length >= 2) {
        // Replace second
        return [prev[0], center];
      }
      const next = [...prev, center];
      if (next.length === 2) {
        setShowCompare(true);
        setSelectedCenter(null);
        setAiChatFacility(undefined);
      }
      return next;
    });
  }

  const aiPanelOpen = aiChatFacility !== undefined;

  return (
    <div className="flex h-full relative">
      {/* Filter sidebar */}
      <div
        className="flex-shrink-0 flex flex-col gap-3 p-3 overflow-y-auto"
        style={{
          width: "220px",
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        {/* Search */}
        <div className="relative">
          <Search size={12} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
          <input
            data-testid="search-input"
            type="text"
            placeholder="Search facilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded pl-7 pr-3 py-1.5"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              fontSize: "11px",
              outline: "none",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }}
            >
              <X size={10} />
            </button>
          )}
        </div>

        <div style={{ height: "1px", background: "var(--color-border)" }} />

        {/* AI Chat global button */}
        <button
          data-testid="btn-global-ai"
          onClick={() => {
            setAiChatFacility(aiPanelOpen && aiChatFacility === null ? undefined : null);
            setSelectedCenter(null);
            setShowCompare(false);
          }}
          className="flex items-center gap-2 px-2 py-1.5 rounded transition-all"
          style={{
            background: aiPanelOpen && aiChatFacility === null ? "rgba(113,255,156,0.12)" : "rgba(113,255,156,0.05)",
            border: `1px solid ${aiPanelOpen && aiChatFacility === null ? "rgba(113,255,156,0.35)" : "rgba(113,255,156,0.15)"}`,
            color: "var(--color-green)",
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          <Sparkles size={11} />
          Ask DataSist AI
        </button>

        {/* Compare mode info */}
        {compareSelections.length > 0 && (
          <div
            className="flex flex-col gap-1.5 p-2 rounded"
            style={{ background: "rgba(94,246,255,0.06)", border: "1px solid rgba(94,246,255,0.18)" }}
          >
            <div style={{ fontSize: "9px", letterSpacing: "0.1em", color: "var(--color-cyan)" }}>
              COMPARE MODE — {compareSelections.length}/2
            </div>
            {compareSelections.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-1">
                <span style={{ fontSize: "10px", color: "var(--color-text-muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.name}
                </span>
                <button
                  onClick={() => setCompareSelections((prev) => prev.filter((x) => x.id !== c.id))}
                  style={{ color: "var(--color-text-muted)", flexShrink: 0 }}
                >
                  <X size={9} />
                </button>
              </div>
            ))}
            {compareSelections.length === 2 && (
              <button
                data-testid="btn-show-compare"
                onClick={() => { setShowCompare(true); setSelectedCenter(null); setAiChatFacility(undefined); }}
                className="flex items-center gap-1.5 justify-center py-1 rounded transition-all"
                style={{
                  background: "rgba(94,246,255,0.12)",
                  border: "1px solid rgba(94,246,255,0.3)",
                  color: "var(--color-cyan)",
                  fontSize: "10px",
                  fontWeight: 600,
                }}
              >
                <Scale size={10} />
                View Side-by-Side
              </button>
            )}
          </div>
        )}

        <div style={{ height: "1px", background: "var(--color-border)" }} />

        {/* Status filter */}
        <div className="flex flex-col gap-1.5">
          <div style={{ fontSize: "9px", letterSpacing: "0.12em", color: "var(--color-text-muted)" }}>STATUS</div>
          {[
            { value: "all", label: "All Facilities", color: "var(--color-text-muted)" },
            { value: "operational", label: "Operational", color: STATUS_COLORS.operational },
            { value: "under_construction", label: "Under Construction", color: STATUS_COLORS.under_construction },
            { value: "planned", label: "Planned", color: STATUS_COLORS.planned },
            { value: "canceled", label: "Canceled / Blocked", color: STATUS_COLORS.canceled },
          ].map((opt) => (
            <button
              key={opt.value}
              data-testid={`filter-status-${opt.value}`}
              onClick={() => setFilterStatus(opt.value)}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all"
              style={{
                background: filterStatus === opt.value ? `${opt.color}15` : "transparent",
                border: filterStatus === opt.value ? `1px solid ${opt.color}35` : "1px solid transparent",
                fontSize: "11px",
                color: filterStatus === opt.value ? opt.color : "var(--color-text-muted)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: opt.value === "all" ? "var(--color-text-muted)" : opt.color }}
              />
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ height: "1px", background: "var(--color-border)" }} />

        {/* Region / State filter */}
        <div className="flex flex-col gap-1">
          <div style={{ fontSize: "9px", letterSpacing: "0.12em", color: "var(--color-text-muted)" }}>REGION</div>
          <button
            data-testid="filter-region-all"
            onClick={() => setFilterRegion("all")}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all"
            style={{
              background: filterRegion === "all" ? "rgba(113,255,156,0.08)" : "transparent",
              border: filterRegion === "all" ? "1px solid rgba(113,255,156,0.2)" : "1px solid transparent",
              fontSize: "11px",
              color: filterRegion === "all" ? "var(--color-green)" : "var(--color-text-muted)",
            }}
          >
            All Regions
          </button>
          {availableRegions.map((region) => (
            <button
              key={region}
              data-testid={`filter-region-${region}`}
              onClick={() => setFilterRegion(region === filterRegion ? "all" : region)}
              className="flex items-center px-2 py-1.5 rounded text-left transition-all"
              style={{
                background: filterRegion === region ? "rgba(255,179,71,0.08)" : "transparent",
                border: filterRegion === region ? "1px solid rgba(255,179,71,0.2)" : "1px solid transparent",
                fontSize: "10px",
                color: filterRegion === region ? "#ffb347" : "var(--color-text-muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {region}
            </button>
          ))}
        </div>

        <div style={{ height: "1px", background: "var(--color-border)" }} />

        {/* Company filter */}
        <div className="flex flex-col gap-1">
          <div style={{ fontSize: "9px", letterSpacing: "0.12em", color: "var(--color-text-muted)" }}>OPERATOR</div>
          <button
            onClick={() => setFilterCompany("all")}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all"
            style={{
              background: filterCompany === "all" ? "rgba(113,255,156,0.08)" : "transparent",
              border: filterCompany === "all" ? "1px solid rgba(113,255,156,0.2)" : "1px solid transparent",
              fontSize: "11px",
              color: filterCompany === "all" ? "var(--color-green)" : "var(--color-text-muted)",
            }}
          >
            All Operators
          </button>
          {companies.map((company) => (
            <button
              key={company}
              data-testid={`filter-company-${company}`}
              onClick={() => setFilterCompany(company === filterCompany ? "all" : company)}
              className="flex items-center px-2 py-1.5 rounded text-left transition-all"
              style={{
                background: filterCompany === company ? "rgba(94,246,255,0.08)" : "transparent",
                border: filterCompany === company ? "1px solid rgba(94,246,255,0.18)" : "1px solid transparent",
                fontSize: "11px",
                color: filterCompany === company ? "var(--color-cyan)" : "var(--color-text-muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {company}
            </button>
          ))}
        </div>

        <div style={{ height: "1px", background: "var(--color-border)" }} />

        {/* Legend */}
        <div className="flex flex-col gap-1.5">
          <div style={{ fontSize: "9px", letterSpacing: "0.12em", color: "var(--color-text-muted)" }}>MARKER SIZE = CAPACITY</div>
          {[
            { size: 10, label: "< 100 MW" },
            { size: 16, label: "100–500 MW" },
            { size: 22, label: "500 MW – 1 GW" },
            { size: 28, label: "> 1 GW" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <div
                style={{
                  width: `${l.size}px`,
                  height: `${l.size}px`,
                  borderRadius: "50%",
                  border: "1.5px solid var(--color-green)",
                  background: "rgba(113,255,156,0.12)",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{ background: "var(--color-bg)" }}
          >
            <div style={{ fontSize: "12px", color: "var(--color-green)", letterSpacing: "0.15em" }}>
              LOADING INTELLIGENCE DATA...
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" style={{ zIndex: 1 }} />
      </div>

      {/* Detail Panel */}
      {selectedCenter && !showCompare && !aiPanelOpen && (
        <div
          className="flex-shrink-0 overflow-hidden"
          style={{
            width: "300px",
            background: "var(--color-surface)",
            borderLeft: "1px solid var(--color-border-strong)",
          }}
        >
          <DataCenterPanel
            center={selectedCenter}
            onClose={() => setSelectedCenter(null)}
            onAskAI={(c) => {
              setAiChatFacility(c);
              setShowCompare(false);
            }}
            onCompare={handleToggleCompare}
            isCompareSelected={!!compareSelections.find((c) => c.id === selectedCenter.id)}
          />
        </div>
      )}

      {/* AI Chat Panel */}
      {aiPanelOpen && (
        <div
          className="flex-shrink-0 overflow-hidden"
          style={{
            width: "320px",
            background: "var(--color-surface)",
            borderLeft: "1px solid var(--color-border-strong)",
          }}
        >
          <AIChatPanel
            facility={aiChatFacility ?? null}
            onClose={() => setAiChatFacility(undefined)}
          />
        </div>
      )}

      {/* Compare Panel */}
      {showCompare && compareSelections.length === 2 && !aiPanelOpen && (
        <ComparePanel
          facilityA={compareSelections[0]}
          facilityB={compareSelections[1]}
          onClose={() => {
            setShowCompare(false);
            setCompareSelections([]);
          }}
        />
      )}
    </div>
  );
}
