
"use client";

import { useState } from "react";
import { Loader2, UserMinus } from "lucide-react";

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
  useRemoveProjectMemberMutation,
} from "@/features/projects/projectMemberApi";

import type {
  ProjectMember,
  ProjectMemberParams,
  ProjectMemberPermissions,
} from "@/features/projects/projectMemberTypes";

import {
  canManageMember,
  getErrorMessage,
} from "./memberUtils";

interface Props extends ProjectMemberParams {
  member: ProjectMember;
  managerCount: number;
  permissions: ProjectMemberPermissions;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RemoveProjectMemberDialog({
  member,
  organizationId,
  projectId,
  managerCount,
  permissions,
  open,
  onOpenChange,
}: Props) {
  const [error, setError] = useState("");

  const [removeMember, { isLoading }] =
    useRemoveProjectMemberMutation();

  const isLastManager =
    member.role === "manager" && managerCount <= 1;

  const allowed =
    canManageMember(member, permissions) &&
    !isLastManager;

  async function handleRemove() {
    if (!allowed || isLoading) return;

    setError("");

    try {
      await removeMember({
        organizationId,
        projectId,
        memberId: member.id,
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
      <DialogContent className="rounded-2xl sm:max-w-[440px]">
        <DialogHeader>
          <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <UserMinus size={26} />
          </div>

          <DialogTitle>Remove project member?</DialogTitle>

          <DialogDescription className="leading-6">
            Remove{" "}
            <strong>{member.user.name}</strong>{" "}
            from this project? Their project membership
            will be removed, but they will remain a
            member of the organization.
          </DialogDescription>
        </DialogHeader>

        {isLastManager && (
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
            You cannot remove the last project manager.
            Assign another manager first.
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
            variant="destructive"
            disabled={!allowed || isLoading}
            onClick={handleRemove}
          >
            {isLoading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <UserMinus size={16} />
            )}

            Remove member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
