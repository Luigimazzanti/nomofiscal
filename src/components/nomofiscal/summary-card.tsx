import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Accent = "mint" | "sky" | "violet" | "orange";

const accentStyles: Record<Accent, string> = {
  mint: "bg-emerald-50 text-emerald-700",
  sky: "bg-sky-50 text-sky-700",
  violet: "bg-violet-50 text-violet-700",
  orange: "bg-orange-50 text-orange-700",
};

export function SummaryCard({
  title,
  value,
  accent,
  icon: Icon,
}: {
  title: string;
  value: string;
  accent: Accent;
  icon: LucideIcon;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-center justify-between pt-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full",
            accentStyles[accent]
          )}
        >
          <Icon size={20} />
        </div>
      </CardContent>
    </Card>
  );
}
