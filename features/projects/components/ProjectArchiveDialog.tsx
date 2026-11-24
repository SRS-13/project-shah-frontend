"use client";

import { useState } from "react";

import { Archive, ArchiveRestore, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  useArchiveProjectMutation,
  useRestoreProjectMutation,
  type Project,
} from "../projectApi";

import { getErrorMessage } from "./projectUtils";

interface Props {
  organizationId: string;
  project: Project;
  action: "archive" | "restore";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProjectArchiveDialog({
  organizationId,
  project,
  action,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [error, setError] = useState("");

  const [archiveProject, { isLoading: archiving }] =
    useArchiveProjectMutation();

  const [restoreProject, { isLoading: restoring }] =
    useRestoreProjectMutation();

  const restoringProject = action === "restore";
  const busy = archiving || restoring;

  async function handleSubmit() {
    if (busy) return;

    setError("");

    try {
      const params = {
        organizationId,
        projectId: project.id,
      };

      if (restoringProject) {
        await restoreProject(params).unwrap();
      } else {
        await archiveProject(params).unwrap();
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!busy) onOpenChange(value);
      }}
    >
      <DialogContent className="rounded-2xl bg-white text-[#17152B] sm:max-w-[440px]">
        <DialogHeader>
          <div
            className={`mb-3 flex size-14 items-center justify-center rounded-2xl ${
              restoringProject
                ? "bg-[#F0E7FF] text-[#9160EF]"
                : "bg-red-50 text-red-500"
            }`}
          >
            {restoringProject ? (
              <ArchiveRestore size={26} />
            ) : (
              <Archive size={26} />
            )}
          </div>

          <DialogTitle>
            {restoringProject ? "Restore project?" : "Archive project?"}
          </DialogTitle>

          <DialogDescription className="leading-6">
            {restoringProject ? "Return" : "Move"}{" "}
            <strong>{project.name}</strong>{" "}
            {restoringProject
              ? "to the active projects list."
              : "to archived projects. An organization owner or admin can restore it later."}
          </DialogDescription>
        </DialogHeader>

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
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            disabled={busy}
            onClick={handleSubmit}
            className={
              restoringProject
                ? "bg-[#9160EF] text-white hover:bg-[#8754E8]"
                : "bg-red-600 text-white hover:bg-red-700"
            }
          >
            {busy && <Loader2 size={16} className="animate-spin" />}

            {restoringProject ? "Restore project" : "Archive project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
