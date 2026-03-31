import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import MapView from "./pages/MapView";
import DashboardView from "./pages/DashboardView";
import AdminPanel from "./pages/AdminPanel";
import Header from "./components/Header";
import Marquee from "./components/Marquee";

export type ActiveView = "map" | "dashboard" | "admin";

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>("map");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--color-bg)" }}>
        <div className="scanline-overlay" />
        <Header activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 overflow-hidden relative">
          {activeView === "map" && <MapView />}
          {activeView === "dashboard" && <DashboardView />}
          {activeView === "admin" && <AdminPanel />}
        </main>
        <Marquee />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
