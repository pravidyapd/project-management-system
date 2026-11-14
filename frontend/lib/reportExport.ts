
import type { Task } from "@/api/taskApi";
import type { Project } from "@/api/projectApi";

export interface ReportSummary {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
}

const isCompleted = (status: string) =>
  status === "Completed" || status === "Done";

const escapeCSV = (value: unknown) => {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
};

const escapeHTML = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });

// Export CSV
export function exportReportCSV(
  tasks: Task[],
  projects: Project[],
  summary: ReportSummary
) {
  const rows: unknown[][] = [
    ["Record Type", "Project", "Task Title", "Status", "Priority",
      "Due Date", "Assignee", "Total Tasks", "Completed Tasks",
      "Completion Rate"],
    [
      "Summary",
      "",
      "",
      "",
      "",
      "",
      "",
      summary.totalTasks,
      summary.completedTasks,
      `${summary.completionRate}%`,
    ],
  ];

  projects.forEach((project) => {
    const projectTasks = tasks.filter(
      (task) => task.projectId === project.id
    );

    const completed = projectTasks.filter((task) =>
      isCompleted(task.status)
    ).length;

    const rate = projectTasks.length
      ? Math.round((completed / projectTasks.length) * 100)
      : 0;

    rows.push([
      "Project",
      project.name,
      "",
      project.status,
      "",
      "",
      "",
      projectTasks.length,
      completed,
      `${rate}%`,
    ]);
  });

  tasks.forEach((task) => {
    rows.push([
      "Task",
      projects.find((project) => project.id === task.projectId)?.name ?? "",
      task.title,
      task.status,
      task.priority,
      task.dueDate
        ? new Date(task.dueDate).toLocaleDateString()
        : "",
      task.assignee?.name ?? "",
      "",
      "",
      "",
    ]);
  });

  const csvContent = rows
    .map((row) => row.map(escapeCSV).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "tasknest-report.csv";
  link.click();

  URL.revokeObjectURL(url);
}

// Export PDF using the browser print dialog
export function exportReportPDF(
  tasks: Task[],
  projects: Project[],
  summary: ReportSummary
) {
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("Please allow pop-ups to export the PDF report.");
    return;
  }

  const projectRows = projects
    .map((project) => {
      const projectTasks = tasks.filter(
        (task) => task.projectId === project.id
      );

      const completed = projectTasks.filter((task) =>
        isCompleted(task.status)
      ).length;

      const rate = projectTasks.length
        ? Math.round((completed / projectTasks.length) * 100)
        : 0;

      return `
        <tr>
          <td>${escapeHTML(project.name)}</td>
          <td>${escapeHTML(project.status)}</td>
          <td>${projectTasks.length}</td>
          <td>${completed}</td>
          <td>${rate}%</td>
        </tr>
      `;
    })
    .join("");

  const taskRows = tasks
    .map(
      (task) => `
        <tr>
          <td>${escapeHTML(task.title)}</td>
          <td>${escapeHTML(
            projects.find((p) => p.id === task.projectId)?.name ?? ""
          )}</td>
          <td>${escapeHTML(task.status)}</td>
          <td>${escapeHTML(task.priority)}</td>
          <td>${escapeHTML(task.dueDate
            ? new Date(task.dueDate).toLocaleDateString()
            : "-")}</td>
          <td>${escapeHTML(task.assignee?.name ?? "-")}</td>
        </tr>
      `
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>TaskNest Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            color: #222;
          }

          h1 { color: #f97316; }
          h2 { margin-top: 32px; }

          .summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin: 24px 0;
          }

          .card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 14px;
          }

          .value {
            font-size: 22px;
            font-weight: bold;
            margin-top: 8px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 14px;
            font-size: 12px;
          }

          th, td {
            border: 1px solid #ddd;
            padding: 9px;
            text-align: left;
          }

          th {
            background: #f3f3f3;
          }

          tr {
            page-break-inside: avoid;
          }

          @media print {
            body { padding: 0; }
          }
        </style>
      </head>

      <body>
        <h1>TaskNest Report</h1>
        <p>Generated on ${escapeHTML(new Date().toLocaleString())}</p>

        <h2>Analytics Summary</h2>

        <div class="summary">
          <div class="card">
            Total Tasks
            <div class="value">${summary.totalTasks}</div>
          </div>

          <div class="card">
            Completed
            <div class="value">${summary.completedTasks}</div>
          </div>

          <div class="card">
            In Progress
            <div class="value">${summary.inProgressTasks}</div>
          </div>

          <div class="card">
            Overdue
            <div class="value">${summary.overdueTasks}</div>
          </div>
        </div>

        <p><strong>Completion Rate:</strong> ${summary.completionRate}%</p>

        <h2>Project Progress</h2>

        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              <th>Total Tasks</th>
              <th>Completed</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>${projectRows}</tbody>
        </table>

        <h2>Task Details</h2>

        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Project</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Assignee</th>
            </tr>
          </thead>
          <tbody>${taskRows}</tbody>
        </table>

        <script>
          window.onload = () => {
            window.print();
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}
