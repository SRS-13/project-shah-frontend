"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Layers3,
  Building2,
  Globe2,
  ArrowRight,
  Loader2,
  Users,
  FolderKanban,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCreateOrganizationMutation } from "@/features/organizations/organizationApi";

import {
  createOrganizationSchema,
  CreateOrganizationValues,
  generateSlug,
} from "@/features/organizations/organizationSchema";
import { OnboardingSteps } from "./components/OnboardingSteps";
import { OrganizationLogoUpload } from "./components/OrganizationLogoUpload";

const sampleProjects = [
  {
    name: "Product Launch",
    tasks: 24,
    members: 5,
    progress: 71,
    color: "bg-orange-100 text-orange-500",
  },
  {
    name: "Marketing Campaign",
    tasks: 18,
    members: 4,
    progress: 43,
    color: "bg-blue-100 text-blue-500",
  },
  {
    name: "Mobile App",
    tasks: 32,
    members: 6,
    progress: 86,
    color: "bg-pink-100 text-pink-500",
  },
];

function TeamFlowLogo() {
  return (
    <Link href="/dashboard" className="inline-flex items-center gap-3">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#AD80FA] to-[#7C4BEF] text-white shadow-lg shadow-purple-200">
        <Layers3 size={23} strokeWidth={2.3} />
      </div>

      <span className="text-[26px] font-bold tracking-[-0.05em] text-[#17152B]">
        TeamFlow
      </span>
    </Link>
  );
}

function OrganizationIllustration() {
  return (
    <aside className="relative hidden min-h-dvh overflow-hidden bg-[#F4E9FF] lg:flex lg:flex-col lg:justify-center">
      <div className="pointer-events-none absolute -left-36 -top-40 size-[500px] rounded-full bg-[#D9BBFF]/70 blur-[90px]" />
      <div className="pointer-events-none absolute -right-36 top-20 size-[440px] rounded-full bg-[#F8D9EF]/90 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-40 left-20 size-[450px] rounded-full bg-[#DCC5FF]/80 blur-[80px]" />

      <div className="relative z-10 mx-auto w-full max-w-[760px] px-10 py-16 xl:px-16">
        <div className="mb-10">
          <h2 className="text-[38px] font-bold leading-[1.15] tracking-[-0.055em] text-[#211A3B] xl:text-[48px]">
            A dedicated workspace
            <br />
            for your team.
          </h2>

          <p className="mt-5 max-w-[510px] text-base leading-7 text-[#625A79]">
            Bring your people, projects, and tasks together in a single,
            organized workspace.
          </p>
        </div>

        {/* Dashboard illustration */}
        <div className="rounded-[28px] border border-white/80 bg-white/75 p-4 shadow-[0_30px_90px_rgba(111,65,174,0.15)] backdrop-blur-xl">
          <div className="rounded-[20px] bg-[#FCFAFF] p-5">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                  <Building2 size={22} />
                </div>

                <div>
                  <p className="font-bold text-[#211A3B]">Acme Inc.</p>
                  <p className="text-xs text-[#77718E]">
                    Organization workspace
                  </p>
                </div>
              </div>

              <div className="flex -space-x-2">
                {["JD", "AL", "MK"].map((name, index) => (
                  <div
                    key={name}
                    className={`flex size-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-slate-700 ${
                      ["bg-orange-200", "bg-purple-200", "bg-emerald-200"][
                        index
                      ]
                    }`}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6 grid grid-cols-4 gap-1 rounded-xl bg-white p-1 text-center text-xs text-slate-600">
              {["Projects", "Tasks", "Team", "Reports"].map((tab, index) => (
                <div
                  key={tab}
                  className={`rounded-lg px-2 py-2.5 ${
                    index === 0 ? "bg-[#9160EF] font-semibold text-white" : ""
                  }`}
                >
                  {tab}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {sampleProjects.map((project) => (
                <div
                  key={project.name}
                  className="flex items-center gap-4 rounded-xl border border-purple-50 bg-white p-4 shadow-sm"
                >
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${project.color}`}
                  >
                    <FolderKanban size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#211A3B]">
                      {project.name}
                    </p>
                    <p className="mt-1 text-xs text-[#77718E]">
                      {project.tasks} tasks · {project.members} members
                    </p>
                  </div>

                  <div className="hidden w-24 sm:block">
                    <div className="h-2 overflow-hidden rounded-full bg-purple-100">
                      <div
                        className="h-full rounded-full bg-[#9160EF]"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-[#211A3B]">
                    {project.progress}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-10 grid grid-cols-3 gap-5">
          {[
            {
              icon: Users,
              title: "Collaborate easily",
              description: "Bring your team together.",
            },
            {
              icon: Layers3,
              title: "Stay organized",
              description: "Manage projects and tasks.",
            },
            {
              icon: ChartNoAxesColumnIncreasing,
              title: "Track progress",
              description: "See how work is moving.",
            },
          ].map((item) => (
            <div key={item.title}>
              <div className="mb-3 inline-flex rounded-xl bg-white/60 p-3 text-[#9160EF]">
                <item.icon size={22} />
              </div>
              <p className="text-sm font-semibold text-[#211A3B]">
                {item.title}
              </p>
              <p className="mt-1 text-xs leading-5 text-[#625A79]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function CreateOrganizationPage() {
  const router = useRouter();

  const [logo, setLogo] = useState<File | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [serverError, setServerError] = useState("");

  const [createOrganization, { isLoading }] = useCreateOrganizationMutation();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrganizationValues>({
    resolver: zodResolver(createOrganizationSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const name = useWatch({ control, name: "name" }) ?? "";
  const slug = useWatch({ control, name: "slug" }) ?? "";

  // Name changes automatically update the slug until the user edits it.
  // This runs during input handling, not during render.
  const nameField = register("name");
  const slugField = register("slug");

  const onSubmit = async (values: CreateOrganizationValues) => {
    setServerError("");

    try {
      const organization = await createOrganization({
        name: values.name.trim(),
        slug: values.slug.trim().toLowerCase(),
      }).unwrap();

      if (!organization?.id) {
        setServerError("Organization was created, but its ID was missing. Reload before continuing.");
        return;
      }

      router.push(
        `/invite-members?organizationId=${encodeURIComponent(
          organization.id,
        )}`,
      );
    } catch (error: unknown) {
      const apiError = error as {
        status?: number;
        data?: { message?: string | string[] };
      };

      if (apiError.status === 409) {
        setServerError("This organization URL is already taken. Try another.");
      } else {
        setServerError("Unable to create organization. Please try again.");
      }
    }
  };
  const busy = isLoading || isSubmitting;

  return (
    <main className="grid min-h-dvh bg-white lg:grid-cols-[44%_56%]">
      <section className="flex min-h-dvh flex-col px-6 py-8 sm:px-12 xl:px-[clamp(48px,5vw,90px)]">
        <header>
          <TeamFlowLogo />
        </header>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[500px]">
            <OnboardingSteps currentStep={1} />

            <div className="mb-9 mt-12">
              <h1 className="text-[34px] font-bold tracking-[-0.055em] text-[#17152B] sm:text-[40px]">
                Create your organization
              </h1>

              <p className="mt-3 text-[15px] leading-6 text-[#69647C]">
                Set up a workspace for your team, projects, and collaboration.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-6"
            >
              {/* Organization name */}
              <div className="space-y-2.5">
                <Label
                  htmlFor="organization-name"
                  className="text-sm font-semibold text-[#211C32]"
                >
                  Organization name
                  <span className="ml-1 text-red-500">*</span>
                </Label>

                <div className="relative">
                  <Building2
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#88849B]"
                  />

                  <Input
                    id="organization-name"
                    placeholder="Acme Inc."
                    autoComplete="organization"
                    aria-invalid={!!errors.name}
                    {...nameField}
                    onChange={(event) => {
                      nameField.onChange(event);

                      if (!slugEdited) {
                        setValue("slug", generateSlug(event.target.value), {
                          shouldValidate: false,
                        });
                      }
                    }}
                    className="h-[54px] rounded-xl border-[#DDD9E8] pl-12 shadow-none focus-visible:border-purple-400 focus-visible:ring-purple-200"
                  />
                </div>

                {errors.name && (
                  <p role="alert" className="text-xs text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Organization slug */}
              <div className="space-y-2.5">
                <Label
                  htmlFor="organization-slug"
                  className="text-sm font-semibold text-[#211C32]"
                >
                  Organization URL
                  <span className="ml-1 text-red-500">*</span>
                </Label>

                <div className="flex h-[54px] overflow-hidden rounded-xl border border-[#DDD9E8] focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100">
                  <div className="flex shrink-0 items-center gap-2 border-r border-[#DDD9E8] bg-[#F8F6FC] px-3 text-xs text-[#77718E] sm:text-sm">
                    <Globe2 size={17} className="text-[#9160EF]" />
                    teamflow.com/
                  </div>

                  <input
                    id="organization-slug"
                    placeholder="acme-inc"
                    aria-invalid={!!errors.slug}
                    {...slugField}
                    onChange={(event) => {
                      setSlugEdited(true);
                      slugField.onChange(event);
                    }}
                    className="min-w-0 flex-1 bg-white px-3 text-sm text-[#211C32] outline-none"
                  />
                </div>

                <p className="text-xs text-[#77718E]">
                  Your workspace URL: teamflow.com/
                  <span className="font-medium text-[#8754E8]">
                    {slug || "your-organization"}
                  </span>
                </p>

                {errors.slug && (
                  <p role="alert" className="text-xs text-red-600">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              {/* Logo */}
              <OrganizationLogoUpload value={logo} onChange={setLogo} />

              {/* Owner role */}
              <div className="space-y-2.5">
                <Label className="text-sm font-semibold text-[#211C32]">
                  Your role
                </Label>

                <div className="flex h-[54px] items-center gap-3 rounded-xl border border-[#DDD9E8] bg-[#FCFAFF] px-4">
                  <Users size={19} className="text-[#9160EF]" />
                  <span className="flex-1 text-sm font-medium text-[#211C32]">
                    Organization Owner
                  </span>
                  <CheckCircle2 size={18} className="text-emerald-500" />
                </div>

                <p className="text-xs text-[#77718E]">
                  You'll automatically become the owner of this organization.
                </p>
              </div>

              {serverError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {serverError}
                </div>
              )}

              <Button
                type="submit"
                disabled={busy}
                className="h-[54px] w-full rounded-xl bg-gradient-to-r from-[#A36AF0] to-[#8754E8] text-base font-semibold text-white shadow-[0_8px_20px_rgba(145,91,232,0.18)] hover:from-[#9256E5] hover:to-[#7740D8]"
              >
                {busy ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating organization...
                  </>
                ) : (
                  <>
                    Create Organization
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-[#9792A8]">
              Your organization will be private until you invite members.
            </p>
          </div>
        </div>

        <footer className="text-center text-xs text-[#AAA5B7]">
          © {new Date().getFullYear()} TeamFlow. All rights reserved.
        </footer>
      </section>

      <OrganizationIllustration />
    </main>
  );
}
