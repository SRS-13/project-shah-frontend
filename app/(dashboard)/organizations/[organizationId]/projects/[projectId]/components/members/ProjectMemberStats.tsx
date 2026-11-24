
import {
  Users,
  ShieldCheck,
  UserRound,
  Eye,
} from "lucide-react";

import type { ProjectMember } from "@/features/projects/projectMemberTypes";

interface Props {
  members: ProjectMember[];
}

export function ProjectMemberStats({ members }: Props) {
  const stats = [
    {
      label: "Total members",
      value: members.length,
      icon: Users,
      color: "#9160EF",
    },
    {
      label: "Managers",
      value: members.filter(
        (member) => member.role === "manager",
      ).length,
      icon: ShieldCheck,
      color: "#9160EF",
    },
    {
      label: "Members",
      value: members.filter(
        (member) => member.role === "member",
      ).length,
      icon: UserRound,
      color: "#638CE5",
    },
    {
      label: "Viewers",
      value: members.filter(
        (member) => member.role === "viewer",
      ).length,
      icon: Eye,
      color: "#38A881",
    },
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

          <p className="text-sm text-[#77718E]">
            {stat.label}
          </p>

          <h3 className="mt-2 text-3xl font-bold tracking-tight text-[#17152B]">
            {stat.value}
          </h3>
        </div>
      ))}
    </div>
  );
}
