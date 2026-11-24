"use client";

import Link from "next/link";

import {
  Archive,
  ArchiveRestore,
  ExternalLink,
  MoreHorizontal,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Project } from "../projectApi";
import type { ProjectPermissions } from "./projectUtils";

interface Props {
  project: Project;
  organizationId: string;
  permissions: ProjectPermissions;
  onEdit: (project: Project) => void;
  onArchive: (project: Project) => void;
  onRestore: (project: Project) => void;
}

export function ProjectActions({
  project,
  organizationId,
  permissions,
  onEdit,
  onArchive,
  onRestore,
}: Props) {
  const archived = Boolean(project.deletedAt);

  const canManage = permissions.isAdmin || project.myRole === "manager";

  const canRestore = permissions.isAdmin;

  const projectPath = `/organizations/${encodeURIComponent(organizationId)}/projects/${encodeURIComponent(project.id)}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Actions for ${project.name}`}
            className="size-9 rounded-lg text-[#827B94] hover:bg-[#F0E7FF] hover:text-[#9160EF]"
          />
        }
      >
        <MoreHorizontal size={20} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-48 rounded-xl bg-white text-[#17152B]"
      >
        {!archived && (
          <DropdownMenuItem render={<Link href={projectPath} />}>
            <ExternalLink size={16} />
            Open project
          </DropdownMenuItem>
        )}

        {!archived && canManage && (
          <>
            <DropdownMenuItem onClick={() => onEdit(project)}>
              <Pencil size={16} />
              Edit project
            </DropdownMenuItem>

            {permissions.isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onArchive(project)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Archive size={16} />
                  Archive project
                </DropdownMenuItem>
              </>
            )}
          </>
        )}

        {archived && canRestore && (
          <DropdownMenuItem
            onClick={() => onRestore(project)}
            className="text-[#9160EF]"
          >
            <ArchiveRestore size={16} />
            Restore project
          </DropdownMenuItem>
        )}

        {archived && !canRestore && (
          <DropdownMenuItem disabled>No available actions</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
