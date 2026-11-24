
"use client";

import {
  MoreHorizontal,
  ShieldCheck,
  UserMinus,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type {
  ProjectMember,
  ProjectMemberPermissions,
} from "@/features/projects/projectMemberTypes";

import {
  getInitials,
  formatJoinedDate,
  canManageMember,
  ROLE_CONFIG,
} from "./memberUtils";

interface Props {
  members: ProjectMember[];
  permissions: ProjectMemberPermissions;
  currentUserId?: string;
  managerCount: number;
  onEditRole: (member: ProjectMember) => void;
  onRemove: (member: ProjectMember) => void;
}

export function ProjectMemberTable({
  members,
  permissions,
  currentUserId,
  managerCount,
  onEditRole,
  onRemove,
}: Props) {
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center px-5 py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#F0E7FF] text-[#9160EF]">
          <Users size={27} />
        </div>

        <h3 className="font-semibold text-[#17152B]">
          No members found
        </h3>

        <p className="mt-2 text-sm text-[#827B94]">
          Add a project member or change your search filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left">
        <thead className="border-y border-[#F0ECF5] bg-[#FAF9FD]">
          <tr>
            <th className="px-5 py-3.5 text-xs font-semibold text-[#77718E]">
              Name
            </th>

            <th className="px-5 py-3.5 text-xs font-semibold text-[#77718E]">
              Project role
            </th>

            <th className="px-5 py-3.5 text-xs font-semibold text-[#77718E]">
              Joined date
            </th>

            <th className="px-5 py-3.5 text-right text-xs font-semibold text-[#77718E]">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#F0ECF5]">
          {members.map((member) => {
            const config = ROLE_CONFIG[member.role];

            const manageable = canManageMember(
              member,
              permissions,
            );

            const lastManager =
              member.role === "manager" &&
              managerCount <= 1;

            const isCurrentUser =
              member.userId === currentUserId;

            return (
              <tr
                key={member.id}
                className="transition-colors hover:bg-[#FCFAFF]"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#EDE4FF] text-sm font-semibold text-[#9160EF]">
                      {getInitials(member.user.name)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#17152B]">
                          {member.user.name}
                        </p>

                        {isCurrentUser && (
                          <span className="rounded-md bg-[#F0E7FF] px-1.5 py-0.5 text-[10px] font-medium text-[#9160EF]">
                            You
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-[#827B94]">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${config.className}`}
                  >
                    {member.role === "manager" && (
                      <ShieldCheck size={13} />
                    )}

                    {config.label}
                  </span>
                </td>

                <td className="px-5 py-4 text-sm text-[#77718E]">
                  {formatJoinedDate(member.createdAt)}
                </td>

                <td className="px-5 py-4 text-right">
                  {manageable ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Actions for ${member.user.name}`}
                          className="rounded-lg text-[#77718E]"
                        >
                          <MoreHorizontal size={19} />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="end"
                        className="w-48 rounded-xl"
                      >
                        <DropdownMenuItem
                          disabled={lastManager}
                          onSelect={() =>
                            onEditRole(member)
                          }
                        >
                          <ShieldCheck
                            size={16}
                            className="text-[#9160EF]"
                          />

                          Change role
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          disabled={lastManager}
                          onSelect={() =>
                            onRemove(member)
                          }
                          className="text-red-600 focus:text-red-600"
                        >
                          <UserMinus size={16} />
                          Remove member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span className="text-xs text-[#AAA5B7]">
                      —
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
