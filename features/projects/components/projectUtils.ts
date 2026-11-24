import type { ProjectStatus, ProjectPriority } from "../projectApi";

export const PROJECT_COLORS = [
  "#9160EF",
  "#6366F1",
  "#3B82F6",
  "#14B8A6",
  "#22C55E",
  "#F59E0B",
  "#F97316",
  "#EC4899",
  "#EF4444",
  "#64748B",
];

export const PROJECT_STATUSES: {
  value: ProjectStatus;
  label: string;
}[] = [
  { value: "planning", label: "Planning" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

export const PROJECT_PRIORITIES: {
  value: ProjectPriority;
  label: string;
}[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const STATUS_STYLES: Record<string, string> = {
  planning: "bg-slate-100 text-slate-600",
  in_progress: "bg-[#F0E7FF] text-[#8754E8]",
  completed: "bg-emerald-50 text-emerald-600",
  on_hold: "bg-amber-50 text-amber-600",
  cancelled: "bg-red-50 text-red-600",
};

export const PRIORITY_STYLES: Record<string, string> = {
  low: "text-emerald-500",
  medium: "text-amber-500",
  high: "text-red-500",
  urgent: "text-red-700",
};

export interface ProjectPermissions {
  canCreate: boolean;
  isAdmin: boolean;
}

export function formatLabel(value?: string | null) {
  if (!value) return "Not set";

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatDate(value?: string | null) {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function getProjectColor(color?: string) {
  return /^#[0-9a-f]{6}$/i.test(color || "") ? color! : "#9160EF";
}

export function generateProjectKey(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  return (
    words.length === 1
      ? words[0].slice(0, 4)
      : words.map((word) => word[0]).join("")
  )
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 6);
}

export function getErrorMessage(error: unknown) {
  const message = (
    error as {
      data?: {
        message?: string | string[];
      };
    }
  )?.data?.message;

  return Array.isArray(message)
    ? message.join(". ")
    : message || "Something went wrong. Please try again.";
}
