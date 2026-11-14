
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="page-enter mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <h1 className="!text-3xl !font-bold !tracking-tight !text-zinc-900 dark:!text-white sm:!text-4xl">
          {title}
        </h1>

        {description && (
          <p className="mt-2 !text-sm !text-zinc-600 dark:!text-zinc-300">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {action}
        </div>
      )}
    </div>
  );
}
