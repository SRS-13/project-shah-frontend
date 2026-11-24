
"use client";

import { useState } from "react";
import {
  Check,
  Eye,
  Loader2,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  useUpdateProjectMemberRoleMutation,
} from "@/features/projects/projectMemberApi";

import type {
  ProjectMember,
  ProjectMemberRole,
  ProjectMemberParams,
  ProjectMemberPermissions,
} from "@/features/projects/projectMemberTypes";

import {
  getInitials,
  getErrorMessage,
  getAssignableRoles,
  canManageMember,
  ROLE_CONFIG,
} from "./memberUtils";

interface Props extends ProjectMemberParams {
  member: ProjectMember;
  managerCount: number;
  permissions: ProjectMemberPermissions;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLE_ICONS = {
  manager: ShieldCheck,
  member: UserRound,
  viewer: Eye,
};

export function UpdateMemberRoleDialog(props: Props) {
  return (
    <UpdateMemberRoleForm
      key={`${props.member.id}-${props.member.role}-${props.open}`}
      {...props}
    />
  );
}

function UpdateMemberRoleForm({
  member,
  organizationId,
  projectId,
  managerCount,
  permissions,
  open,
  onOpenChange,
}: Props) {
  const [role, setRole] =
    useState<ProjectMemberRole>(member.role);

  const [error, setError] = useState("");

  const [updateRole, { isLoading }] =
    useUpdateProjectMemberRoleMutation();

  const allowedRoles = getAssignableRoles(permissions);

  const allowed = canManageMember(
    member,
    permissions,
  );

  const isLastManager =
    member.role === "manager" && managerCount <= 1;

  async function handleSubmit() {
    if (
      !allowed ||
      !allowedRoles.includes(role) ||
      role === member.role ||
      isLoading ||
      (isLastManager && role !== "manager")
    ) {
      return;
    }

    setError("");

    try {
      await updateRole({
        organizationId,
        projectId,
        memberId: member.id,
        role,
      }).unwrap();

      onOpenChange(false);
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!isLoading) onOpenChange(value);
      }}
    >
      <DialogContent className="rounded-2xl sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Change project role</DialogTitle>

          <DialogDescription>
            Update this member&apos;s project permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-xl bg-[#F8F5FC] p-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#EDE4FF] font-semibold text-[#9160EF]">
            {getInitials(member.user.name)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#17152B]">
              {member.user.name}
            </p>

            <p className="truncate text-xs text-[#827B94]">
              {member.user.email}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {allowedRoles.map((option) => {
            const Icon = ROLE_ICONS[option];

            const selected = role === option;

            const disabled =
              !allowed ||
              isLoading ||
              (isLastManager && option !== "manager");

            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => {
                  setRole(option);
                  setError("");
                }}
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  selected
                    ? "border-[#9160EF] bg-[#F8F3FF]"
                    : "border-[#EAE5F1] hover:bg-[#FAF9FD]"
                }`}
              >
                <Icon
                  size={22}
                  className="shrink-0 text-[#9160EF]"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#17152B]">
                    {ROLE_CONFIG[option].label}
                  </p>

                  <p className="mt-1 text-xs text-[#827B94]">
                    {ROLE_CONFIG[option].description}
                  </p>
                </div>

                {selected && (
                  <Check
                    size={18}
                    className="text-[#9160EF]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {isLastManager && (
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
            This is the last project manager. Assign
            another manager before changing this role.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            disabled={
              !allowed ||
              role === member.role ||
              !allowedRoles.includes(role) ||
              isLoading ||
              (isLastManager && role !== "manager")
            }
            onClick={handleSubmit}
            className="bg-[#9160EF] text-white hover:bg-[#8754E8]"
          >
            {isLoading && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
