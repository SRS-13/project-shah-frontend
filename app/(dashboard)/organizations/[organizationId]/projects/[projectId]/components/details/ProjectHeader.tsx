
"use client";

import {
  CalendarDays,
  Flag,
  FolderKanban,
  Settings2,
  Users,
  Archive,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Project } from "@/features/projects/projectApi";

interface Props {
  project: Project;
  onSettings: () => void;
}

export function formatProjectLabel(value?: string | null) {
  if (!value) return "Not set";

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatProjectDate(value?: string | null) {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function ProjectHeader({
  project,
  onSettings,
}: Props) {
  const color = /^#[0-9a-f]{6}$/i.test(project.color || "")
    ? project.color!
    : "#9160EF";

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[#E9DDF9] bg-gradient-to-br from-[#F1E5FF] via-[#F6EDFF] to-[#FBEAF3] p-5 sm:p-7">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-[#D9BBFF]/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-40 size-56 rounded-full bg-[#F8D9EF]/60 blur-3xl" />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/70 shadow-sm"
              style={{ color }}
            >
              <FolderKanban size={32} />
            </div>

            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-white/70 px-2 py-1 text-xs font-semibold text-[#8754E8]">
                  {project.key}
                </span>

                <span className="text-xs text-[#77718E]">
                  Project workspace
                </span>

                {project.deletedAt && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                    <Archive size={12} />
                    Archived
                  </span>
                )}
              </div>

              <h1 className="break-words text-2xl font-bold tracking-[-0.04em] text-[#17152B] sm:text-3xl">
                {project.name}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#69647C]">
                {project.description ||
                  "No project description provided."}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onSettings}
            className="rounded-xl border-white bg-white/70 text-[#625D76] hover:bg-white"
          >
            <Settings2 size={16} />
            Project settings
          </Button>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="inline-flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-xs font-semibold text-[#8754E8]">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            {formatProjectLabel(project.status)}
          </span>

          <div className="flex items-center gap-2 text-sm text-[#69647C]">
            <Flag
              size={16}
              className={
                project.priority === "high"
                  ? "text-red-500"
                  : project.priority === "medium"
                    ? "text-amber-500"
                    : "text-emerald-500"
              }
            />
            {formatProjectLabel(project.priority)} priority
          </div>

          <div className="flex items-center gap-2 text-sm text-[#69647C]">
            <CalendarDays size={16} />
            {formatProjectDate(project.dueDate)}
          </div>

          <div className="flex items-center gap-2 text-sm text-[#69647C] sm:ml-auto">
            <Users size={18} className="text-[#9160EF]" />
            {project.memberCount ?? 0} members
          </div>
        </div>
      </div>
    </section>
  );
}
