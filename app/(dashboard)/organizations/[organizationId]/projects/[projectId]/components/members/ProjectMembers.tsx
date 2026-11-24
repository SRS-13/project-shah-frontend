
"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  Search,
  UserPlus,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  useGetProjectMembersQuery,
} from "@/features/projects/projectMemberApi";

import type {
  ProjectMember,
  ProjectMemberRole,
  ProjectMemberParams,
  ProjectMemberPermissions,
} from "@/features/projects/projectMemberTypes";

import { ProjectMemberStats } from "./ProjectMemberStats";
import { ProjectMemberTable } from "./ProjectMemberTable";
import { AddProjectMemberDialog } from "./AddProjectMemberDialog";
import { UpdateMemberRoleDialog } from "./UpdateMemberRoleDialog";
import { RemoveProjectMemberDialog } from "./RemoveProjectMemberDialog";

interface Props extends ProjectMemberParams {
  permissions: ProjectMemberPermissions;
  currentUserId?: string;
}

type RoleFilter = "all" | ProjectMemberRole;

type MemberAction = {
  type: "edit" | "remove";
  memberId: string;
} | null;

export function ProjectMembers({
  organizationId,
  projectId,
  permissions,
  currentUserId,
}: Props) {
  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] =
    useState<RoleFilter>("all");

  const [addOpen, setAddOpen] = useState(false);

  const [action, setAction] =
    useState<MemberAction>(null);

  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetProjectMembersQuery({
    organizationId,
    projectId,
  });

  const members = useMemo(
    () => data?.data ?? [],
    [data],
  );

  const managerCount = useMemo(
    () =>
      members.filter(
        (member) => member.role === "manager",
      ).length,
    [members],
  );

  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        `${member.user.name} ${member.user.email}`
          .toLowerCase()
          .includes(keyword);

      const matchesRole =
        roleFilter === "all" ||
        member.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [members, search, roleFilter]);

  const selectedMember = members.find(
    (member) => member.id === action?.memberId,
  );

  function handleEditRole(member: ProjectMember) {
    setAction({
      type: "edit",
      memberId: member.id,
    });
  }

  function handleRemove(member: ProjectMember) {
    setAction({
      type: "remove",
      memberId: member.id,
    });
  }

  if (isLoading) {
    return <MembersSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-[#EAE5F1] bg-white p-6 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <AlertCircle size={27} />
        </div>

        <h2 className="text-lg font-semibold text-[#17152B]">
          Unable to load project members
        </h2>

        <p className="mt-2 text-sm text-[#77718E]">
          Please check your project access and try again.
        </p>

        <Button
          variant="outline"
          disabled={isFetching}
          onClick={() => refetch()}
          className="mt-5 rounded-xl"
        >
          <RefreshCw
            size={16}
            className={isFetching ? "animate-spin" : ""}
          />

          Try again
        </Button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#17152B]">
            Project members
          </h2>

          <p className="mt-1 text-sm text-[#77718E]">
            Manage your team and project access.
          </p>
        </div>

        {permissions.canManage && (
          <Button
            onClick={() => setAddOpen(true)}
            className="h-11 rounded-xl bg-gradient-to-r from-[#A36AF0] to-[#8754E8] px-5 text-white shadow-sm hover:opacity-90"
          >
            <UserPlus size={18} />
            Add member
          </Button>
        )}
      </div>

      {/* Statistics */}
      <ProjectMemberStats members={members} />

      {/* Members table */}
      <div className="overflow-hidden rounded-2xl border border-[#EAE5F1] bg-white shadow-[0_4px_20px_rgba(60,40,100,0.025)]">
        {/* Search and filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="relative w-full sm:max-w-[320px]">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9993A9]"
            />

            <Input
              aria-label="Search project members"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search members..."
              className="h-11 rounded-xl border-[#DED9E8] pl-10 shadow-none focus-visible:ring-[#9160EF]/20"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              aria-label="Filter project members by role"
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(
                  event.target.value as RoleFilter,
                )
              }
              className="h-11 rounded-xl border border-[#DED9E8] bg-white px-4 text-sm text-[#69647C]"
            >
              <option value="all">All roles</option>
              <option value="manager">Managers</option>
              <option value="member">Members</option>
              <option value="viewer">Viewers</option>
            </select>

            <Button
              variant="outline"
              size="icon"
              aria-label="Refresh project members"
              disabled={isFetching}
              onClick={() => refetch()}
              className="size-11 rounded-xl border-[#DED9E8]"
            >
              <RefreshCw
                size={16}
                className={
                  isFetching
                    ? "animate-spin text-[#9160EF]"
                    : "text-[#77718E]"
                }
              />
            </Button>
          </div>
        </div>

        <ProjectMemberTable
          members={filteredMembers}
          permissions={permissions}
          currentUserId={currentUserId}
          managerCount={managerCount}
          onEditRole={handleEditRole}
          onRemove={handleRemove}
        />

        <div className="flex items-center justify-between border-t border-[#F0ECF5] px-5 py-4">
          <p className="text-xs text-[#827B94]">
            Showing {filteredMembers.length} of{" "}
            {data?.total ?? members.length} members
          </p>

          {isFetching && (
            <Loader2
              size={15}
              className="animate-spin text-[#9160EF]"
            />
          )}
        </div>
      </div>

      {/* Add member */}
      {permissions.canManage && (
        <AddProjectMemberDialog
          organizationId={organizationId}
          projectId={projectId}
          permissions={permissions}
          open={addOpen}
          onOpenChange={setAddOpen}
        />
      )}

      {/* Change role */}
      {action?.type === "edit" && selectedMember && (
        <UpdateMemberRoleDialog
          member={selectedMember}
          organizationId={organizationId}
          projectId={projectId}
          permissions={permissions}
          managerCount={managerCount}
          open
          onOpenChange={(open) => {
            if (!open) setAction(null);
          }}
        />
      )}

      {/* Remove member */}
      {action?.type === "remove" && selectedMember && (
        <RemoveProjectMemberDialog
          member={selectedMember}
          organizationId={organizationId}
          projectId={projectId}
          permissions={permissions}
          managerCount={managerCount}
          open
          onOpenChange={(open) => {
            if (!open) setAction(null);
          }}
        />
      )}
    </section>
  );
}

function MembersSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-52 rounded-lg bg-[#EAE5F1]" />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 rounded-2xl border border-[#EAE5F1] bg-white"
          />
        ))}
      </div>

      <div className="space-y-4 rounded-2xl border border-[#EAE5F1] bg-white p-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-14 rounded-xl bg-[#F5F2FA]"
          />
        ))}
      </div>
    </div>
  );
}
