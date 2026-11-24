"use client";

import {
  Archive,
  FolderKanban,
  LayoutGrid,
  List,
  Search,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import type { ProjectStatus, ProjectPriority } from "../projectApi";

import { PROJECT_STATUSES, PROJECT_PRIORITIES } from "./projectUtils";

export type ProjectView = "grid" | "list";
export type ArchiveStatus = "active" | "archived";

export interface ProjectFilterState {
  search: string;
  status: "all" | ProjectStatus;
  priority: "all" | ProjectPriority;
  archiveStatus: ArchiveStatus;
  sortBy: "createdAt" | "name";
  sortOrder: "ASC" | "DESC";
}

export const DEFAULT_FILTERS: ProjectFilterState = {
  search: "",
  status: "all",
  priority: "all",
  archiveStatus: "active",
  sortBy: "createdAt",
  sortOrder: "DESC",
};

interface Props {
  filters: ProjectFilterState;
  view: ProjectView;
  canViewArchived: boolean;
  onChange: (filters: ProjectFilterState) => void;
  onViewChange: (view: ProjectView) => void;
}

export function ProjectFilters({
  filters,
  view,
  canViewArchived,
  onChange,
  onViewChange,
}: Props) {
  function update<K extends keyof ProjectFilterState>(
    key: K,
    value: ProjectFilterState[K],
  ) {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  const hasFilters =
    filters.search !== "" ||
    filters.status !== "all" ||
    filters.priority !== "all";

  const selectClass =
    "h-11 rounded-xl border border-[#DED9E8] bg-white px-3 text-sm text-[#69647C] outline-none focus:border-[#9160EF]";

  return (
    <div className="space-y-4">
      {/* Active / archived tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-xl border border-[#EAE5F1] bg-white p-1">
          {[
            {
              value: "active" as const,
              label: "All projects",
              icon: FolderKanban,
            },
            ...(canViewArchived
              ? [
                  {
                    value: "archived" as const,
                    label: "Archived",
                    icon: Archive,
                  },
                ]
              : []),
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={filters.archiveStatus === tab.value}
              onClick={() => update("archiveStatus", tab.value)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                filters.archiveStatus === tab.value
                  ? "bg-[#F0E7FF] text-[#8754E8]"
                  : "text-[#77718E] hover:bg-[#FAF9FD]"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid / list switch */}
        <div className="flex items-center gap-1 rounded-xl border border-[#EAE5F1] bg-white p-1">
          {[
            { value: "grid" as const, icon: LayoutGrid },
            { value: "list" as const, icon: List },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              aria-label={`${item.value} view`}
              aria-pressed={view === item.value}
              onClick={() => onViewChange(item.value)}
              className={`flex size-9 items-center justify-center rounded-lg ${
                view === item.value
                  ? "bg-[#F0E7FF] text-[#9160EF]"
                  : "text-[#77718E]"
              }`}
            >
              <item.icon size={18} />
            </button>
          ))}
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9993A9]"
          />

          <Input
            aria-label="Search projects"
            value={filters.search}
            onChange={(event) => update("search", event.target.value)}
            placeholder="Search projects..."
            className="h-11 rounded-xl border-[#DED9E8] bg-white pl-10 text-[#17152B] shadow-none focus-visible:ring-[#9160EF]/20"
          />
        </div>

        <select
          aria-label="Project status"
          value={filters.status}
          onChange={(event) =>
            update("status", event.target.value as ProjectFilterState["status"])
          }
          className={selectClass}
        >
          <option value="all">All statuses</option>

          {PROJECT_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Project priority"
          value={filters.priority}
          onChange={(event) =>
            update(
              "priority",
              event.target.value as ProjectFilterState["priority"],
            )
          }
          className={selectClass}
        >
          <option value="all">All priorities</option>

          {PROJECT_PRIORITIES.map((priority) => (
            <option key={priority.value} value={priority.value}>
              {priority.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort projects"
          value={`${filters.sortBy}:${filters.sortOrder}`}
          onChange={(event) => {
            const [sortBy, sortOrder] = event.target.value.split(":");

            onChange({
              ...filters,
              sortBy: sortBy as ProjectFilterState["sortBy"],
              sortOrder: sortOrder as ProjectFilterState["sortOrder"],
            });
          }}
          className={selectClass}
        >
          <option value="createdAt:DESC">Newest first</option>

          <option value="createdAt:ASC">Oldest first</option>

          <option value="name:ASC">Name A–Z</option>
          <option value="name:DESC">Name Z–A</option>
        </select>

        {hasFilters && (
          <Button
            variant="ghost"
            onClick={() =>
              onChange({
                ...filters,
                search: "",
                status: "all",
                priority: "all",
              })
            }
            className="text-[#9160EF]"
          >
            <X size={16} />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
