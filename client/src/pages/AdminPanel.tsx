import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DataCenter, InsertDataCenter } from "@shared/schema";
import { Plus, Edit2, Trash2, X, Save, Shield, Search, Globe, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type FormMode = "add" | "edit" | null;

const EMPTY_FORM: Partial<InsertDataCenter> = {
  name: "",
  company: "",
  companyType: "hyperscale",
  lat: 0,
  lng: 0,
  city: "",
  state: "",
  country: "USA",
  capacityMW: undefined,
  estimatedAnnualGWh: undefined,
  waterUsageMillionGallons: undefined,
  status: "operational",
  yearOpened: undefined,
  yearPlanned: undefined,
  investmentBillions: undefined,
  acreage: undefined,
  primaryModels: "[]",
  communityImpact: "",
  communityResistance: 0,
  gridRisk: "low",
  renewablePercent: undefined,
  notes: "",
};

const STATUS_COLORS: Record<string, string> = {
  operational: "#71ff9c",
  under_construction: "#ffb347",
  planned: "#5ef6ff",
  canceled: "#ff5555",
};

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label style={{ fontSize: "10px", letterSpacing: "0.08em", color: "var(--color-text-muted)" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  background: "var(--color-surface-2)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  fontSize: "12px",
  borderRadius: "4px",
  padding: "5px 8px",
  outline: "none",
  width: "100%",
};

export default function AdminPanel() {
  const { toast } = useToast();
  const [mode, setMode] = useState<FormMode>(null);
  const [editTarget, setEditTarget] = useState<DataCenter | null>(null);
  const [form, setForm] = useState<Partial<InsertDataCenter>>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: centers = [], isLoading } = useQuery<DataCenter[]>({
    queryKey: ["/api/data-centers"],
    queryFn: () => apiRequest("GET", "/api/data-centers").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertDataCenter) =>
      apiRequest("POST", "/api/data-centers", data).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-centers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Facility added", description: `${form.name} has been added to the database.` });
      setMode(null);
      setForm(EMPTY_FORM);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertDataCenter> }) =>
      apiRequest("PATCH", `/api/data-centers/${id}`, data).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-centers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Facility updated", description: `${form.name} has been updated.` });
      setMode(null);
      setEditTarget(null);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/data-centers/${id}`).then((r) => r.json()),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-centers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Facility deleted" });
      setDeleteConfirm(null);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setMode("add");
  }

  function openEdit(c: DataCenter) {
    setForm({
      name: c.name,
      company: c.company,
      companyType: c.companyType,
      lat: c.lat,
      lng: c.lng,
      city: c.city,
      state: c.state,
      country: c.country,
      capacityMW: c.capacityMW ?? undefined,
      estimatedAnnualGWh: c.estimatedAnnualGWh ?? undefined,
      waterUsageMillionGallons: c.waterUsageMillionGallons ?? undefined,
      status: c.status,
      yearOpened: c.yearOpened ?? undefined,
      yearPlanned: c.yearPlanned ?? undefined,
      investmentBillions: c.investmentBillions ?? undefined,
      acreage: c.acreage ?? undefined,
      primaryModels: c.primaryModels ?? "[]",
      communityImpact: c.communityImpact ?? "",
      communityResistance: c.communityResistance ?? 0,
      gridRisk: c.gridRisk ?? "low",
      renewablePercent: c.renewablePercent ?? undefined,
      notes: c.notes ?? "",
    });
    setEditTarget(c);
    setMode("edit");
  }

  function handleSubmit() {
    if (!form.name || !form.company || !form.city || !form.state) {
      toast({ title: "Missing fields", description: "Name, company, city, and state are required.", variant: "destructive" });
      return;
    }
    // Validate primaryModels is valid JSON array
    try {
      JSON.parse(form.primaryModels || "[]");
    } catch {
      toast({ title: "Invalid JSON", description: "Primary models must be a valid JSON array like [\"GPT-4\"]", variant: "destructive" });
      return;
    }
    const payload = { ...form } as InsertDataCenter;
    if (mode === "add") {
      createMutation.mutate(payload);
    } else if (mode === "edit" && editTarget) {
      updateMutation.mutate({ id: editTarget.id, data: payload });
    }
  }

  function setField(key: keyof InsertDataCenter, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const filtered = centers.filter(
    (c) =>
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full overflow-hidden" style={{ fontFamily: "'General Sans', sans-serif" }}>
      {/* Table section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-2">
            <Shield size={16} style={{ color: "#ffb347" }} />
            <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text)", fontFamily: "'Cabinet Grotesk', sans-serif", letterSpacing: "0.05em" }}>
              Admin Panel
            </span>
            <span
              className="px-2 py-0.5 rounded-full"
              style={{ fontSize: "10px", background: "rgba(255,179,71,0.1)", color: "#ffb347", border: "1px solid rgba(255,179,71,0.25)", letterSpacing: "0.08em" }}
            >
              {centers.length} FACILITIES
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={11} style={{ position: "absolute", left: "7px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input
                data-testid="admin-search"
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ ...inputStyle, paddingLeft: "24px", width: "180px" }}
              />
            </div>
            <button
              data-testid="btn-add-facility"
              onClick={openAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-all"
              style={{
                background: "rgba(113,255,156,0.1)",
                border: "1px solid rgba(113,255,156,0.3)",
                color: "var(--color-green)",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              <Plus size={13} />
              Add Facility
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
                {["Name", "Company", "Location", "Status", "Capacity", "Renewable %", "Grid Risk", "Actions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      fontSize: "9px",
                      letterSpacing: "0.12em",
                      color: "var(--color-text-muted)",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={8} style={{ padding: "24px", textAlign: "center", fontSize: "12px", color: "var(--color-text-muted)" }}>
                    Loading facilities...
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: "24px", textAlign: "center", fontSize: "12px", color: "var(--color-text-muted)" }}>
                    No facilities found
                  </td>
                </tr>
              )}
              {filtered.map((c, i) => (
                <tr
                  key={c.id}
                  data-testid={`facility-row-${c.id}`}
                  style={{
                    borderBottom: "1px solid var(--color-border)",
                    background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                  }}
                >
                  <td style={{ padding: "8px 12px" }}>
                    <div style={{ fontSize: "12px", color: "var(--color-text)", fontWeight: 600, maxWidth: "200px" }}>
                      {c.name}
                    </div>
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{c.company}</div>
                    <div style={{ fontSize: "9px", color: "var(--color-text-muted)", opacity: 0.6, letterSpacing: "0.06em" }}>
                      {c.companyType.toUpperCase()}
                    </div>
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                      {c.city}, {c.state}
                    </div>
                    {c.country !== "USA" && (
                      <div style={{ fontSize: "9px", color: "var(--color-cyan)", display: "flex", alignItems: "center", gap: "3px" }}>
                        <Globe size={8} />
                        {c.country}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{
                        fontSize: "9px",
                        color: STATUS_COLORS[c.status] || "#71ff9c",
                        background: `${STATUS_COLORS[c.status] || "#71ff9c"}15`,
                        border: `1px solid ${STATUS_COLORS[c.status] || "#71ff9c"}35`,
                        letterSpacing: "0.05em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--color-green)", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {c.capacityMW ? (c.capacityMW >= 1000 ? `${(c.capacityMW / 1000).toFixed(1)} GW` : `${c.capacityMW} MW`) : "—"}
                  </td>
                  <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--color-text-muted)" }}>
                    {c.renewablePercent !== null && c.renewablePercent !== undefined ? `${c.renewablePercent}%` : "—"}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    {c.gridRisk ? (
                      <span style={{
                        fontSize: "9px",
                        color: c.gridRisk === "high" ? "#ff5555" : c.gridRisk === "medium" ? "#ffb347" : "#71ff9c",
                        letterSpacing: "0.06em",
                      }}>
                        {c.gridRisk.toUpperCase()}
                      </span>
                    ) : "—"}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <div className="flex items-center gap-1">
                      <button
                        data-testid={`btn-edit-${c.id}`}
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded transition-all hover:opacity-80"
                        style={{ background: "rgba(94,246,255,0.08)", border: "1px solid rgba(94,246,255,0.2)", color: "var(--color-cyan)" }}
                      >
                        <Edit2 size={11} />
                      </button>
                      {deleteConfirm === c.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            data-testid={`btn-delete-confirm-${c.id}`}
                            onClick={() => deleteMutation.mutate(c.id)}
                            className="px-2 py-1 rounded text-xs transition-all"
                            style={{ background: "rgba(255,85,85,0.15)", border: "1px solid rgba(255,85,85,0.4)", color: "#ff5555", fontSize: "10px" }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="p-1 rounded"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <button
                          data-testid={`btn-delete-${c.id}`}
                          onClick={() => setDeleteConfirm(c.id)}
                          className="p-1.5 rounded transition-all hover:opacity-80"
                          style={{ background: "rgba(255,85,85,0.08)", border: "1px solid rgba(255,85,85,0.2)", color: "#ff5555" }}
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form slide-in */}
      {mode && (
        <div
          className="flex-shrink-0 flex flex-col overflow-hidden border-l"
          style={{
            width: "360px",
            background: "var(--color-surface)",
            borderColor: "var(--color-border-strong)",
          }}
        >
          {/* Form header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text)", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
              {mode === "add" ? "Add New Facility" : `Edit: ${editTarget?.name}`}
            </div>
            <button
              onClick={() => { setMode(null); setEditTarget(null); }}
              className="p-1 hover:opacity-80"
              style={{ color: "var(--color-text-muted)" }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Form body */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            <FieldRow label="FACILITY NAME *">
              <input data-testid="form-name" style={inputStyle} value={form.name || ""} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. AWS US-East-1" />
            </FieldRow>

            <div className="grid grid-cols-2 gap-2">
              <FieldRow label="COMPANY *">
                <input data-testid="form-company" style={inputStyle} value={form.company || ""} onChange={(e) => setField("company", e.target.value)} placeholder="Amazon Web Services" />
              </FieldRow>
              <FieldRow label="COMPANY TYPE">
                <select
                  data-testid="form-company-type"
                  style={inputStyle}
                  value={form.companyType || "hyperscale"}
                  onChange={(e) => setField("companyType", e.target.value)}
                >
                  <option value="hyperscale">Hyperscale</option>
                  <option value="colocation">Colocation</option>
                  <option value="neocloud">Neocloud</option>
                </select>
              </FieldRow>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FieldRow label="CITY *">
                <input data-testid="form-city" style={inputStyle} value={form.city || ""} onChange={(e) => setField("city", e.target.value)} placeholder="Ashburn" />
              </FieldRow>
              <FieldRow label="STATE / PROVINCE *">
                <input data-testid="form-state" style={inputStyle} value={form.state || ""} onChange={(e) => setField("state", e.target.value)} placeholder="Virginia" />
              </FieldRow>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FieldRow label="COUNTRY">
                <input data-testid="form-country" style={inputStyle} value={form.country || "USA"} onChange={(e) => setField("country", e.target.value)} placeholder="USA" />
              </FieldRow>
              <FieldRow label="STATUS">
                <select data-testid="form-status" style={inputStyle} value={form.status || "operational"} onChange={(e) => setField("status", e.target.value)}>
                  <option value="operational">Operational</option>
                  <option value="under_construction">Under Construction</option>
                  <option value="planned">Planned</option>
                  <option value="canceled">Canceled</option>
                </select>
              </FieldRow>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FieldRow label="LATITUDE">
                <input data-testid="form-lat" type="number" step="0.0001" style={inputStyle} value={form.lat ?? ""} onChange={(e) => setField("lat", parseFloat(e.target.value) || 0)} />
              </FieldRow>
              <FieldRow label="LONGITUDE">
                <input data-testid="form-lng" type="number" step="0.0001" style={inputStyle} value={form.lng ?? ""} onChange={(e) => setField("lng", parseFloat(e.target.value) || 0)} />
              </FieldRow>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FieldRow label="CAPACITY (MW)">
                <input data-testid="form-capacity" type="number" style={inputStyle} value={form.capacityMW ?? ""} onChange={(e) => setField("capacityMW", e.target.value ? parseFloat(e.target.value) : undefined)} placeholder="150" />
              </FieldRow>
              <FieldRow label="INVESTMENT ($B)">
                <input data-testid="form-investment" type="number" step="0.1" style={inputStyle} value={form.investmentBillions ?? ""} onChange={(e) => setField("investmentBillions", e.target.value ? parseFloat(e.target.value) : undefined)} placeholder="5.0" />
              </FieldRow>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FieldRow label="ANNUAL USE (GWh)">
                <input type="number" style={inputStyle} value={form.estimatedAnnualGWh ?? ""} onChange={(e) => setField("estimatedAnnualGWh", e.target.value ? parseFloat(e.target.value) : undefined)} />
              </FieldRow>
              <FieldRow label="WATER (M gal/yr)">
                <input type="number" style={inputStyle} value={form.waterUsageMillionGallons ?? ""} onChange={(e) => setField("waterUsageMillionGallons", e.target.value ? parseFloat(e.target.value) : undefined)} />
              </FieldRow>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FieldRow label="RENEWABLE %">
                <input type="number" min="0" max="100" style={inputStyle} value={form.renewablePercent ?? ""} onChange={(e) => setField("renewablePercent", e.target.value ? parseInt(e.target.value) : undefined)} placeholder="75" />
              </FieldRow>
              <FieldRow label="GRID RISK">
                <select style={inputStyle} value={form.gridRisk || "low"} onChange={(e) => setField("gridRisk", e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </FieldRow>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FieldRow label="YEAR OPENED">
                <input type="number" style={inputStyle} value={form.yearOpened ?? ""} onChange={(e) => setField("yearOpened", e.target.value ? parseInt(e.target.value) : undefined)} placeholder="2024" />
              </FieldRow>
              <FieldRow label="YEAR PLANNED">
                <input type="number" style={inputStyle} value={form.yearPlanned ?? ""} onChange={(e) => setField("yearPlanned", e.target.value ? parseInt(e.target.value) : undefined)} placeholder="2026" />
              </FieldRow>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FieldRow label="ACREAGE">
                <input type="number" style={inputStyle} value={form.acreage ?? ""} onChange={(e) => setField("acreage", e.target.value ? parseFloat(e.target.value) : undefined)} />
              </FieldRow>
              <FieldRow label="COMMUNITY RESISTANCE">
                <select style={inputStyle} value={form.communityResistance ?? 0} onChange={(e) => setField("communityResistance", parseInt(e.target.value))}>
                  <option value={0}>None</option>
                  <option value={1}>Active Resistance</option>
                </select>
              </FieldRow>
            </div>

            <FieldRow label='PRIMARY MODELS (JSON array, e.g. ["GPT-4"])'>
              <input
                data-testid="form-models"
                style={inputStyle}
                value={form.primaryModels || "[]"}
                onChange={(e) => setField("primaryModels", e.target.value)}
                placeholder='["GPT-4", "Gemini"]'
              />
            </FieldRow>

            <FieldRow label="COMMUNITY IMPACT">
              <textarea
                data-testid="form-community-impact"
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
                value={form.communityImpact || ""}
                onChange={(e) => setField("communityImpact", e.target.value)}
                placeholder="Community journal entry..."
              />
            </FieldRow>

            <FieldRow label="NOTES">
              <textarea
                rows={2}
                style={{ ...inputStyle, resize: "vertical" }}
                value={form.notes || ""}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder="Internal notes..."
              />
            </FieldRow>
          </div>

          {/* Form footer */}
          <div
            className="flex-shrink-0 p-3 border-t flex gap-2"
            style={{ borderColor: "var(--color-border)" }}
          >
            <button
              onClick={() => { setMode(null); setEditTarget(null); }}
              className="flex-1 py-2 rounded transition-all"
              style={{
                background: "transparent",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-muted)",
                fontSize: "12px",
              }}
            >
              Cancel
            </button>
            <button
              data-testid="btn-save-facility"
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded transition-all"
              style={{
                background: "rgba(113,255,156,0.12)",
                border: "1px solid rgba(113,255,156,0.35)",
                color: "var(--color-green)",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              <Save size={13} />
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : mode === "add" ? "Add Facility" : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
