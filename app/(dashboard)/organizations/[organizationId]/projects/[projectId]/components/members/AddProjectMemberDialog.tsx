"use client";

import { useState } from "react";
import { Check, Loader2, Search, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  getInitials,
  getErrorMessage,
  getAssignableRoles,
  ROLE_CONFIG,
} from "./memberUtils";
import {
  ProjectMemberRole,
  ProjectMemberPermissions,
  ProjectMemberParams,
} from "@/features/projects/projectMemberTypes";
import {
  useGetEligibleProjectMembersQuery,
  useAddProjectMemberMutation,
} from "@/features/projects/projectMemberApi";

interface Props extends ProjectMemberParams {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permissions: ProjectMemberPermissions;
}

export function AddProjectMemberDialog({
  organizationId,
  projectId,
  open,
  onOpenChange,
  permissions,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const [role, setRole] = useState<ProjectMemberRole>("member");

  const [error, setError] = useState("");

  const { data, isLoading, isFetching, isError, refetch } =
    useGetEligibleProjectMembersQuery(
      {
        organizationId,
        projectId,
      },
      {
        skip: !open || !permissions.canManage,
        refetchOnMountOrArgChange: true,
      },
    );

  const [addProjectMember, { isLoading: adding }] =
    useAddProjectMemberMutation();

  const members = data?.data ?? [];

  const filteredMembers = members.filter((member) =>
    `${member.name} ${member.email}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  const selectedMember = members.find(
    (member) => member.userId === selectedUserId,
  );

  const roles = getAssignableRoles(permissions);

  function handleOpenChange(value: boolean) {
    if (adding) return;

    if (!value) {
      setSearch("");
      setSelectedUserId("");
      setRole("member");
      setError("");
    }

    onOpenChange(value);
  }

  async function handleSubmit() {
    if (
      !permissions.canManage ||
      !selectedMember ||
      !roles.includes(role) ||
      adding
    ) {
      return;
    }

    setError("");

    try {
      await addProjectMember({
        organizationId,
        projectId,
        userId: selectedMember.userId,
        role,
      }).unwrap();

      setSearch("");
      setSelectedUserId("");
      setRole("member");
      onOpenChange(false);
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-[500px]">
        <DialogHeader>
          <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-[#F0E7FF] text-[#9160EF]">
            <UserPlus size={24} />
          </div>

          <DialogTitle className="text-xl font-bold text-[#17152B]">
            Add project member
          </DialogTitle>

          <DialogDescription className="leading-6 text-[#77718E]">
            Select an existing organization member and assign their project
            role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-3">
            <Label htmlFor="eligible-member-search">Organization member</Label>

            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9993A9]"
              />

              <Input
                id="eligible-member-search"
                value={search}
                disabled={adding}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or email..."
                className="h-11 rounded-xl border-[#DED9E8] pl-10 shadow-none"
              />
            </div>

            <div className="max-h-[240px] space-y-2 overflow-y-auto p-0.5">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-[#9160EF]" />
                </div>
              ) : isError ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-red-500">
                    Unable to load organization members.
                  </p>

                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => refetch()}
                  >
                    Retry
                  </Button>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Users size={30} className="mb-3 text-[#B4A3D4]" />

                  <p className="text-sm font-medium text-[#17152B]">
                    {members.length === 0
                      ? "No eligible members"
                      : "No matching members"}
                  </p>

                  <p className="mt-1 text-xs text-[#827B94]">
                    {members.length === 0
                      ? "All eligible organization members have already joined."
                      : "Try a different name or email."}
                  </p>
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const selected = selectedUserId === member.userId;

                  return (
                    <button
                      key={member.userId}
                      type="button"
                      disabled={adding}
                      aria-pressed={selected}
                      onClick={() => {
                        setSelectedUserId(member.userId);
                        setError("");
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                        selected
                          ? "border-[#9160EF] bg-[#F8F3FF]"
                          : "border-[#EAE5F1] hover:bg-[#FAF8FD]"
                      }`}
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#EDE4FF] text-sm font-semibold text-[#9160EF]">
                        {getInitials(member.name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#17152B]">
                          {member.name}
                        </p>

                        <p className="truncate text-xs text-[#827B94]">
                          {member.email}
                        </p>

                        <p className="mt-1 text-[11px] capitalize text-[#9160EF]">
                          Organization {member.organizationRole}
                        </p>
                      </div>

                      <div
                        className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                          selected
                            ? "border-[#9160EF] bg-[#9160EF] text-white"
                            : "border-[#DED9E8]"
                        }`}
                      >
                        {selected && <Check size={13} />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {isFetching && !isLoading && (
              <p className="text-xs text-[#827B94]">
                Refreshing available members...
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-project-role">Project role</Label>

            <select
              id="add-project-role"
              value={role}
              disabled={adding}
              onChange={(event) => {
                setRole(event.target.value as ProjectMemberRole);
                setError("");
              }}
              className="h-11 w-full rounded-xl border border-[#DED9E8] bg-white px-3 text-sm text-[#17152B]"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {ROLE_CONFIG[role].label}
                </option>
              ))}
            </select>

            <p className="text-xs leading-5 text-[#827B94]">
              {ROLE_CONFIG[role].description}
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-3 text-sm text-red-600"
            >
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="border-t border-[#F0ECF5] pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={adding}
            onClick={() => handleOpenChange(false)}
            className="rounded-xl"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={
              !selectedMember ||
              !permissions.canManage ||
              !roles.includes(role) ||
              adding ||
              isError ||
              isFetching
            }
            onClick={handleSubmit}
            className="rounded-xl bg-[#9160EF] text-white hover:bg-[#8754E8]"
          >
            {adding ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <UserPlus size={16} />
            )}

            {adding ? "Adding..." : "Add member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
