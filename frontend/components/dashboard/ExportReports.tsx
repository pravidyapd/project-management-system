
"use client";

import { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  ChevronDown,
} from "lucide-react";

interface ExportReportsProps {
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export default function ExportReports({
  onExportCSV,
  onExportPDF,
}: ExportReportsProps) {
  const [open, setOpen] = useState(false);

  const handleExport = (callback: () => void) => {
    callback();
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-orange-400"
      >
        <Download size={17} />
        Export
        <ChevronDown
          size={16}
          className={`transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close export menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-lg">
            <button
              type="button"
              onClick={() => handleExport(onExportCSV)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition hover:bg-accent"
            >
              <FileSpreadsheet
                size={17}
                className="text-emerald-500"
              />
              Export as CSV
            </button>

            <button
              type="button"
              onClick={() => handleExport(onExportPDF)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition hover:bg-accent"
            >
              <FileText
                size={17}
                className="text-orange-500"
              />
              Export as PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
