"use client";

import { Archive, CheckCircle2, Clock3, FolderKanban } from "lucide-react";

import { useGetProjectsQuery } from "../projectApi";

interface Props {
  organizationId: string;
  canViewArchived: boolean;
}

export function ProjectStats({ organizationId, canViewArchived }: Props) {
  const baseParams = {
    organizationId,
    page: 1,
    limit: 1,
  };

  const active = useGetProjectsQuery({
    ...baseParams,
    archiveStatus: "active",
  });

  const inProgress = useGetProjectsQuery({
    ...baseParams,
    archiveStatus: "active",
    status: "in_progress",
  });

  const completed = useGetProjectsQuery({
    ...baseParams,
    archiveStatus: "active",
    status: "completed",
  });

  const archived = useGetProjectsQuery(
    {
      ...baseParams,
      archiveStatus: "archived",
    },
    {
      skip: !canViewArchived,
    },
  );

  const stats = [
    {
      label: "Active projects",
      query: active,
      icon: FolderKanban,
      color: "#9160EF",
    },
    {
      label: "In progress",
      query: inProgress,
      icon: Clock3,
      color: "#638CE5",
    },
    {
      label: "Completed",
      query: completed,
      icon: CheckCircle2,
      color: "#38A881",
    },
    ...(canViewArchived
      ? [
          {
            label: "Archived",
            query: archived,
            icon: Archive,
            color: "#827B94",
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-[#EAE5F1] bg-white p-5 shadow-[0_4px_20px_rgba(60,40,100,0.025)]"
        >
          <div
            className="mb-4 flex size-11 items-center justify-center rounded-xl"
            style={{
              color: stat.color,
              backgroundColor: `${stat.color}15`,
            }}
          >
            <stat.icon size={22} />
          </div>

          <p className="text-sm text-[#77718E]">{stat.label}</p>

          {stat.query.isLoading ? (
            <div className="mt-3 h-8 w-12 animate-pulse rounded bg-[#F0E7FF]" />
          ) : (
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-[#17152B]">
              {stat.query.isError ? "—" : (stat.query.data?.meta.total ?? "—")}
            </h3>
          )}
        </div>
      ))}
    </div>
  );
}
