"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar({
  title,
  onOpenMenu,
}: {
  title: string;
  onOpenMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-100 bg-slate-50/90 px-4 backdrop-blur md:px-6 lg:h-[73px]">
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="icon"
          className="lg:hidden"
          onClick={onOpenMenu}
          aria-label="Abrir menú"
        >
          <Menu size={18} />
        </Button>
        <h2 className="text-base font-semibold text-slate-800 md:text-lg">{title}</h2>
      </div>
    </header>
  );
}
