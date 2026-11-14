
import { LucideIcon, TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  color: string;
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:bg-accent hover:shadow-xl hover:shadow-orange-500/5">

      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-500/[0.04] blur-2xl transition-all duration-500 group-hover:bg-orange-500/10" />

      <div className="relative flex items-start justify-between gap-3">

        {/* Content */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground transition-colors group-hover:text-orange-500">
            {value}
          </h2>
        </div>

        {/* Icon */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 ${color}`}
        >
          <Icon size={23} strokeWidth={1.8} />
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="relative mt-5 flex items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
          <TrendingUp
            size={15}
            className="shrink-0 text-orange-500"
          />
          <span>{description}</span>
        </div>
      )}
    </div>
  );
}
