
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
}

export default function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="page-enter flex flex-col items-center justify-center py-14 text-center">

      {/* Icon */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400 transition-all duration-300 hover:scale-110 hover:bg-orange-500/15">
        <Inbox size={30} strokeWidth={1.7} />
      </div>

      {/* Heading */}
      <h3 className="text-lg font-semibold text-white">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">
          {description}
        </p>
      )}
    </div>
  );
}
