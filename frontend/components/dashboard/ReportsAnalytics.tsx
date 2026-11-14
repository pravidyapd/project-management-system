
"use client";

import ExportReports from "@/components/dashboard/ExportReports";
import type { DateRange } from "@/utils/dashboardUtils";

interface ReportsAnalyticsProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  loading: boolean;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export default function ReportsAnalytics({
  dateRange,
  onDateRangeChange,
  loading,
  onExportCSV,
  onExportPDF,
}: ReportsAnalyticsProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Reports & Analytics
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Track task progress and project performance
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={dateRange}
          onChange={(event) =>
            onDateRangeChange(event.target.value as DateRange)
          }
          disabled={loading}
          className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="3months">Last 3 months</option>
          <option value="all">All time</option>
        </select>

        <ExportReports
          onExportCSV={onExportCSV}
          onExportPDF={onExportPDF}
        />
      </div>
    </div>
  );
}
