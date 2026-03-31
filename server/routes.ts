import type { Express } from "express";
import type { Server } from "http";
import Groq from "groq-sdk";
import { storage } from "./storage";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  storage.seedIfEmpty();

  // ── GET all data centers ──
  app.get("/api/data-centers", (_req, res) => {
    try {
      res.json(storage.getAllDataCenters());
    } catch {
      res.status(500).json({ error: "Failed to fetch data centers" });
    }
  });

  // ── GET single data center ──
  app.get("/api/data-centers/:id", (req, res) => {
    try {
      const center = storage.getDataCenterById(parseInt(req.params.id));
      if (!center) return res.status(404).json({ error: "Not found" });
      res.json(center);
    } catch {
      res.status(500).json({ error: "Failed to fetch data center" });
    }
  });

  // ── POST create data center (admin) ──
  app.post("/api/data-centers", (req, res) => {
    try {
      const center = storage.createDataCenter(req.body);
      res.status(201).json(center);
    } catch (e: any) {
      res.status(400).json({ error: e.message || "Failed to create data center" });
    }
  });

  // ── PATCH update data center (admin) ──
  app.patch("/api/data-centers/:id", (req, res) => {
    try {
      const updated = storage.updateDataCenter(parseInt(req.params.id), req.body);
      if (!updated) return res.status(404).json({ error: "Not found" });
      res.json(updated);
    } catch (e: any) {
      res.status(400).json({ error: e.message || "Failed to update" });
    }
  });

  // ── DELETE data center (admin) ──
  app.delete("/api/data-centers/:id", (req, res) => {
    try {
      const ok = storage.deleteDataCenter(parseInt(req.params.id));
      if (!ok) return res.status(404).json({ error: "Not found" });
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to delete" });
    }
  });

  // ── GET stats ──
  app.get("/api/stats", (_req, res) => {
    try {
      const centers = storage.getAllDataCenters();
      const operational = centers.filter(c => c.status === "operational");
      const underConstruction = centers.filter(c => c.status === "under_construction");
      const byCompany: Record<string, { count: number; capacityMW: number }> = {};
      for (const c of centers) {
        if (!byCompany[c.company]) byCompany[c.company] = { count: 0, capacityMW: 0 };
        byCompany[c.company].count++;
        byCompany[c.company].capacityMW += c.capacityMW || 0;
      }
      const validRenewable = centers.filter(c => c.renewablePercent !== null);
      res.json({
        total: centers.length,
        operational: operational.length,
        underConstruction: underConstruction.length,
        planned: centers.filter(c => c.status === "planned").length,
        canceled: centers.filter(c => c.status === "canceled").length,
        totalCapacityMW: centers.reduce((s, c) => s + (c.capacityMW || 0), 0),
        operationalCapacityMW: operational.reduce((s, c) => s + (c.capacityMW || 0), 0),
        totalInvestmentBillions: centers.reduce((s, c) => s + (c.investmentBillions || 0), 0),
        totalWaterMillionGallons: centers.reduce((s, c) => s + (c.waterUsageMillionGallons || 0), 0),
        byCompany,
        communityResistanceCount: centers.filter(c => c.communityResistance === 1).length,
        highGridRiskCount: centers.filter(c => c.gridRisk === "high").length,
        avgRenewablePercent: validRenewable.length
          ? Math.round(validRenewable.reduce((s, c) => s + (c.renewablePercent || 0), 0) / validRenewable.length)
          : 0,
      });
    } catch {
      res.status(500).json({ error: "Failed to compute stats" });
    }
  });

  // ── POST AI chat about a facility ──
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { question, facilityId } = req.body;
      if (!question) return res.status(400).json({ error: "question is required" });

      const centers = storage.getAllDataCenters();
      let contextBlock = "";

      if (facilityId) {
        const facility = centers.find(c => c.id === facilityId);
        if (facility) {
          const models = facility.primaryModels ? JSON.parse(facility.primaryModels) : [];
          contextBlock = `
FACILITY CONTEXT:
Name: ${facility.name}
Company: ${facility.company} (${facility.companyType})
Location: ${facility.city}, ${facility.state}, ${facility.country}
Status: ${facility.status}
Capacity: ${facility.capacityMW ? `${facility.capacityMW} MW` : "Unknown"}
Annual Energy Use: ${facility.estimatedAnnualGWh ? `${facility.estimatedAnnualGWh} GWh/year` : "Unknown"}
Water Use: ${facility.waterUsageMillionGallons ? `${facility.waterUsageMillionGallons}M gallons/year` : "Unknown"}
Investment: ${facility.investmentBillions ? `$${facility.investmentBillions}B` : "Unknown"}
Renewable Energy: ${facility.renewablePercent !== null ? `${facility.renewablePercent}%` : "Unknown"}
Grid Risk: ${facility.gridRisk || "Unknown"}
Community Resistance: ${facility.communityResistance ? "Yes" : "No"}
AI Models Hosted: ${models.join(", ") || "Unknown"}
Community Impact: ${facility.communityImpact || "No data"}
Notes: ${facility.notes || "None"}
          `.trim();
        }
      } else {
        // Global question — provide aggregate context
        const totalMW = centers.reduce((s, c) => s + (c.capacityMW || 0), 0);
        const countries = [...new Set(centers.map(c => c.country))];
        contextBlock = `
GLOBAL DATASIST CONTEXT:
Total facilities tracked: ${centers.length}
Total capacity: ${(totalMW / 1000).toFixed(1)} GW
Countries covered: ${countries.join(", ")}
Operational: ${centers.filter(c => c.status === "operational").length}
Under construction: ${centers.filter(c => c.status === "under_construction").length}
With community resistance: ${centers.filter(c => c.communityResistance === 1).length}
High grid risk: ${centers.filter(c => c.gridRisk === "high").length}
        `.trim();
      }

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are DataSist AI, an expert analyst for the DataSist platform — part of the Aliasist suite of apps (aliasist.com). You provide concise, factual, and insightful analysis of AI data center infrastructure, power consumption, environmental impact, and community effects.

Your tone is professional but accessible. Keep answers focused and under 200 words unless the question requires more depth. Always cite specific numbers from the context when available. If a question is outside the provided data, acknowledge it and offer what you do know.

${contextBlock}`,
          },
          { role: "user", content: question },
        ],
        temperature: 0.4,
        max_tokens: 400,
      });

      const answer = completion.choices[0]?.message?.content || "No response generated.";
      res.json({ answer, model: "llama-3.3-70b-versatile" });
    } catch (e: any) {
      console.error("Groq error:", e);
      res.status(500).json({ error: "AI service unavailable. Check GROQ_API_KEY." });
    }
  });

  return httpServer;
}
