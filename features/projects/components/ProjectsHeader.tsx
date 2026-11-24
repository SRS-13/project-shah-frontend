"use client";

import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  canCreate: boolean;
  onCreate: () => void;
}

export function ProjectsHeader({ canCreate, onCreate }: Props) {
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[#E9DDF9] bg-gradient-to-br from-[#F1E5FF] via-[#F6EDFF] to-[#FBEAF3] p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-[#D9BBFF]/50 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 right-40 size-56 rounded-full bg-[#F8D9EF]/60 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white bg-white/70 text-[#9160EF] shadow-sm">
            <FolderKanban size={28} />
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-[#8754E8]">
              Workspace management
            </p>

            <h1 className="text-3xl font-bold tracking-[-0.04em] text-[#17152B]">
              All projects
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#69647C]">
              Plan, organize and manage your team&apos;s work.
            </p>
          </div>
        </div>

        {canCreate && (
          <Button
            onClick={onCreate}
            className="h-12 rounded-xl bg-gradient-to-r from-[#A36AF0] to-[#8754E8] px-5 font-semibold text-white shadow-lg shadow-purple-200/60 hover:opacity-90"
          >
            <Plus size={19} />
            New project
          </Button>
        )}
      </div>
    </section>
  );
}
