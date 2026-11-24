"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { ProjectOverview } from "./ProjectOverview";

import { useGetProjectQuery } from "@/features/projects/projectApi";
import { useGetMeQuery } from "@/features/auth/authQuery";
import { useGetOrganizationMembersQuery } from "@/features/organizations/organizationApi";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectNavigation, ProjectTab } from "./ProjectNavigation";
import { ProjectSettings } from "./ProjectSettings";
import { ProjectMembers } from "../members/ProjectMembers";

interface Props {
  organizationId: string;
  projectId: string;
}

export function ProjectDetails({ organizationId, projectId }: Props) {
  const [activeTab, setActiveTab] = useState<ProjectTab>("overview");
  const { data: currentUser } = useGetMeQuery();
  const currentUserId = currentUser?.id;
  const { currentData: organizationMembers } = useGetOrganizationMembersQuery(
    organizationId,
    { skip: !currentUserId },
  );
  const organizationRole = organizationMembers?.find(
    (member) => member.user.id === currentUserId,
  )?.role;
  const isOrganizationAdmin =
    organizationRole === "OWNER" || organizationRole === "ADMIN";

  const {
    data: project,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetProjectQuery({
    organizationId,
    projectId,
  });

  const projectsPath = `/organizations/${encodeURIComponent(organizationId)}/projects`;

  if (isLoading) {
    return <ProjectDetailsSkeleton />;
  }

  if (isError || !project) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <AlertCircle size={30} />
        </div>

        <h2 className="text-xl font-semibold text-[#17152B]">
          Unable to load project
        </h2>

        <p className="mt-2 max-w-sm text-sm text-[#77718E]">
          This project may not exist, or you may not have permission to access
          it.
        </p>

        <div className="mt-6 flex gap-3">
          <Link href={projectsPath}>
            <Button variant="outline">
              <ArrowLeft size={16} />
              Back to projects
            </Button>
          </Link>

          <Button
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-[#9160EF] text-white hover:bg-[#8754E8]"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-full bg-[#FAF9FD] p-4 sm:p-6 xl:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/dashboard"
            className="text-[#827B94] hover:text-[#9160EF]"
          >
            Workspace
          </Link>

          <ChevronRight size={14} className="text-[#AAA5B7]" />

          <Link
            href={projectsPath}
            className="text-[#827B94] hover:text-[#9160EF]"
          >
            Projects
          </Link>

          <ChevronRight size={14} className="text-[#AAA5B7]" />

          <span className="font-medium text-[#17152B]">{project.name}</span>

          {isFetching && (
            <Loader2
              size={14}
              className="ml-auto animate-spin text-[#9160EF]"
            />
          )}
        </div>

        <ProjectHeader
          project={project}
          onSettings={() => setActiveTab("settings")}
        />

        <ProjectNavigation activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "overview" && <ProjectOverview project={project} />}

        {activeTab === "settings" && (
          <ProjectSettings project={project} organizationId={organizationId} />
        )}

        {activeTab === "board" && (
          <ModulePlaceholder
            title="Project board"
            description="The Kanban board will be connected to the task management module."
          />
        )}

        {activeTab === "tasks" && (
          <ModulePlaceholder
            title="Project tasks"
            description="Create and manage tasks once the task API is available."
          />
        )}

        {activeTab === "members" && (
          <ProjectMembers
            key={`${organizationId}-${projectId}`}
            organizationId={organizationId}
            projectId={projectId}
            permissions={{
              canManage: isOrganizationAdmin || project.myRole === "manager",
              isAdmin: isOrganizationAdmin,
            }}
            currentUserId={currentUserId}
          />
        )}

        {activeTab === "activity" && (
          <ModulePlaceholder
            title="Project activity"
            description="Project activity will appear here when activity tracking is connected."
          />
        )}
      </div>
    </main>
  );
}

function ModulePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-[#EAE5F1] bg-white p-8 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#F1E9FF] text-[#9160EF]">
        <AlertCircle size={26} />
      </div>

      <h2 className="text-lg font-semibold text-[#17152B]">{title}</h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-[#77718E]">
        {description}
      </p>
    </div>
  );
}

function ProjectDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-6 bg-[#FAF9FD] p-6">
      <div className="h-4 w-56 rounded bg-[#E8E2F1]" />
      <div className="h-48 rounded-2xl bg-[#EEE5FA]" />
      <div className="h-14 rounded-xl bg-white" />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 rounded-2xl bg-white" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="h-80 rounded-2xl bg-white xl:col-span-2" />
        <div className="h-80 rounded-2xl bg-white" />
      </div>
    </div>
  );
}
