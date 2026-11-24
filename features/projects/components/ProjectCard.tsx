"use client";

import Link from "next/link";

import {
  Archive,
  ArrowUpRight,
  CalendarDays,
  Flag,
  FolderKanban,
  Users,
} from "lucide-react";

import type { Project } from "../projectApi";

import {
  formatLabel,
  formatDate,
  getProjectColor,
  STATUS_STYLES,
  PRIORITY_STYLES,
  type ProjectPermissions,
} from "./projectUtils";

import { ProjectActions } from "./ProjectActions";

export interface ProjectItemProps {
  project: Project;
  organizationId: string;
  permissions: ProjectPermissions;
  onEdit: (project: Project) => void;
  onArchive: (project: Project) => void;
  onRestore: (project: Project) => void;
}

export function ProjectCard(props: ProjectItemProps) {
  const { project, organizationId } = props;

  const color = getProjectColor(project.color);
  const archived = Boolean(project.deletedAt);

  const projectPath = `/organizations/${encodeURIComponent(organizationId)}/projects/${encodeURIComponent(project.id)}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#EAE5F1] bg-white p-5 shadow-[0_4px_20px_rgba(60,40,100,0.025)] transition-all hover:border-[#D9C7F8] hover:shadow-[0_8px_30px_rgba(145,96,239,0.08)]">
      {/* Color indicator */}
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ backgroundColor: color }}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-xl"
          style={{
            color,
            backgroundColor: `${color}18`,
          }}
        >
          <FolderKanban size={25} />
        </div>

        <span className="rounded-md bg-[#F8F5FC] px-2.5 py-1 text-xs font-semibold text-[#77718E]">
          {project.key}
        </span>

        <div className="ml-auto">
          <ProjectActions {...props} />
        </div>
      </div>

      {/* Project details */}
      <div className="mt-5 flex-1">
        {archived ? (
          <h3 className="text-lg font-bold text-[#17152B]">{project.name}</h3>
        ) : (
          <Link
            href={projectPath}
            className="flex items-start gap-2 text-lg font-bold leading-6 tracking-tight text-[#17152B] hover:text-[#9160EF]"
          >
            <span>{project.name}</span>

            <ArrowUpRight
              size={17}
              className="mt-1 shrink-0 text-[#B7A3D7] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
            />
          </Link>
        )}

        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[#827B94]">
          {project.description || "No project description provided."}
        </p>
      </div>

      {/* Status and priority */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {archived ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
            <Archive size={13} />
            Archived
          </span>
        ) : (
          <span
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
              STATUS_STYLES[project.status || ""] ||
              "bg-slate-100 text-slate-600"
            }`}
          >
            {formatLabel(project.status)}
          </span>
        )}

        <div className="flex items-center gap-1.5 text-xs text-[#69647C]">
          <Flag
            size={15}
            className={
              PRIORITY_STYLES[project.priority || ""] || "text-slate-400"
            }
          />
          {formatLabel(project.priority)} priority
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#F0ECF5] pt-4">
        <div className="flex items-center gap-2 text-xs text-[#69647C]">
          <Users size={16} className="text-[#9160EF]" />
          {project.memberCount ?? 0} members
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#827B94]">
          <CalendarDays size={15} />

          {formatDate(project.dueDate)}
        </div>
      </div>

      {project.myRole && (
        <div className="mt-3 text-xs text-[#9993A9]">
          Your role:{" "}
          <span className="font-medium text-[#77718E]">
            {formatLabel(project.myRole)}
          </span>
        </div>
      )}
    </article>
  );
}
