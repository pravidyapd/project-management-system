
interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    Todo: "bg-zinc-800/80 text-zinc-300 border-zinc-700/60",
    "To Do": "bg-zinc-800/80 text-zinc-300 border-zinc-700/60",
    "In Progress":
      "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Completed:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Done:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "On Hold":
      "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Cancelled:
      "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const badgeStyle =
    styles[status] ||
    "bg-purple-500/10 text-purple-400 border-purple-500/20";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide transition-all duration-200 hover:brightness-125 ${badgeStyle}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
