
import { LoaderCircle } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({
  message = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4">

      {/* Animated Spinner */}
      <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-orange-500/20 bg-orange-500/5">
        <LoaderCircle
          size={32}
          strokeWidth={2.5}
          className="animate-spin text-orange-500"
        />
      </div>

      {/* Loading Message */}
      <p className="animate-pulse text-sm font-medium text-zinc-600 dark:text-zinc-300">
        {message}
      </p>
    </div>
  );
}
