import { ProjectsPage } from "@/features/projects/components/ProjectsPage";

export default async function Projects({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  return <ProjectsPage key={organizationId} organizationId={organizationId} />;
}
