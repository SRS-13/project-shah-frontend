"use client";

import Link from "next/link";

import { Flag, FolderKanban, Users } from "lucide-react";

import type { Project } from "../projectApi";
import type { ProjectItemProps } from "./ProjectCard";

import { ProjectActions } from "./ProjectActions";

import {
  formatLabel,
  formatDate,
  getProjectColor,
  STATUS_STYLES,
  PRIORITY_STYLES,
} from "./projectUtils";

interface Props extends Omit<ProjectItemProps, "project"> {
  projects: Project[];
}

export function ProjectList({ projects, ...props }: Props) {
  const columns = [
    "Project name",
    "Status",
    "Priority",
    "Members",
    "Due date",
    "Your role",
    "Actions",
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#EAE5F1] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] text-left">
          <thead className="border-b border-[#F0ECF5] bg-[#FAF9FD]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-5 py-4 text-xs font-semibold text-[#77718E]"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#F0ECF5]">
            {projects.map((project) => {
              const color = getProjectColor(project.color);

              const archived = Boolean(project.deletedAt);

              const href = `/organizations/${encodeURIComponent(props.organizationId)}/projects/${encodeURIComponent(project.id)}`;

              return (
                <tr key={project.id} className="hover:bg-[#FCFAFF]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          color,
                          backgroundColor: `${color}18`,
                        }}
                      >
                        <FolderKanban size={22} />
                      </div>

                      <div className="max-w-[260px]">
                        {archived ? (
                          <p className="truncate text-sm font-semibold text-[#17152B]">
                            {project.name}
                          </p>
                        ) : (
                          <Link
                            href={href}
                            className="block truncate text-sm font-semibold text-[#17152B] hover:text-[#9160EF]"
                          >
                            {project.name}
                          </Link>
                        )}

                        <p className="mt-1 text-xs text-[#827B94]">
                          {project.key}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                        archived
                          ? "bg-slate-100 text-slate-600"
                          : STATUS_STYLES[project.status || ""] ||
                            "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {archived ? "Archived" : formatLabel(project.status)}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-[#69647C]">
                      <Flag
                        size={15}
                        className={
                          PRIORITY_STYLES[project.priority || ""] ||
                          "text-slate-400"
                        }
                      />

                      {formatLabel(project.priority)}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-[#69647C]">
                      <Users size={16} className="text-[#9160EF]" />

                      {project.memberCount ?? 0}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-[#77718E]">
                    {formatDate(project.dueDate)}
                  </td>

                  <td className="px-5 py-4 text-sm text-[#77718E]">
                    {formatLabel(project.myRole)}
                  </td>

                  <td className="px-5 py-4">
                    <ProjectActions project={project} {...props} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
