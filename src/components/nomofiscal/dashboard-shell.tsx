"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/nomofiscal/sidebar";
import { Topbar } from "@/components/nomofiscal/topbar";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const titleByPathname: Record<string, string> = {
  "/daily-log": "Daily Log",
  "/clients": "Clients",
  "/services": "Services",
  "/periodos": "Periodos Cerrados",
  "/reports": "Reports",
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = useMemo(
    () => titleByPathname[pathname] ?? "NomoFiscal",
    [pathname]
  );

  useEffect(() => {
    const bodyAttributes = Array.from(document.body.attributes).map((attr) => ({
      name: attr.name,
      value: attr.value.length > 80 ? `${attr.value.slice(0, 80)}...` : attr.value,
    }));
    // #region agent log
    fetch("http://127.0.0.1:7856/ingest/38a7fdbf-23ef-4eba-be79-e9824cf9b81c", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "e66cdf",
      },
      body: JSON.stringify({
        sessionId: "e66cdf",
        runId: "pre-fix-1",
        hypothesisId: "H1",
        location: "dashboard-shell.tsx:27",
        message: "Body attributes at hydration",
        data: { pathname, bodyAttributes },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-100 shadow-sm lg:block">
        <Sidebar />
      </aside>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="left-0 top-0 h-screen max-w-[82vw] translate-x-0 translate-y-0 rounded-none border-r border-slate-100 p-0">
          <Sidebar className="h-full" />
        </DialogContent>
      </Dialog>

      <div className="lg:pl-72">
        <Topbar title={pageTitle} onOpenMenu={() => setMobileOpen(true)} />
        <main className="px-4 py-5 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}
