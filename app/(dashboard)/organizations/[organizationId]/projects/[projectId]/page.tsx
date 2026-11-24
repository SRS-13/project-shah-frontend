import { ProjectDetails } from "./components/details/ProjectDetails";


interface Props {
  params: Promise<{
    organizationId: string;
    projectId: string;
  }>;
}

export default async function ProjectDetailsPage({
  params,
}: Props) {
  const { organizationId, projectId } = await params;

  return (
    <ProjectDetails
      organizationId={organizationId}
      projectId={projectId}
    />
  );
}