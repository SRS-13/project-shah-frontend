"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Info,
  Layers3,
  Loader2,
  Mail,
  Plus,
  Send,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddOrganizationMemberMutation } from "@/features/organizations/organizationApi";
import { useCreateInvitationMutation } from "@/features/organizations/organizationApi";
import { InvitationList } from "./components/InvitationList";

type MemberRole = "admin" | "member";

interface Invitee {
  id: string;
  email: string;
  role: MemberRole;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getInitials(email: string) {
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/).filter(Boolean);

  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

function OnboardingSteps() {
  const steps = ["Create Organization", "Invite Members", "Set Up Project"];

  return (
    <div
      aria-label="Onboarding progress"
      className="mb-14 flex items-start justify-between"
    >
      {steps.map((step, index) => (
        <div
          key={step}
          className="relative flex min-w-0 flex-1 flex-col items-center gap-2"
        >
          {index > 0 && (
            <div
              className={`absolute right-1/2 top-5 -z-0 h-px w-full ${
                index === 1 ? "bg-[#9160EF]" : "bg-[#DCD8E7]"
              }`}
            />
          )}

          <div
            className={`relative z-10 flex size-10 items-center justify-center rounded-full border text-sm font-semibold ${
              index <= 1
                ? "border-[#9160EF] bg-[#9160EF] text-white"
                : "border-[#D8D3E4] bg-white text-[#77718E]"
            }`}
          >
            {index === 0 ? <Check size={19} /> : index + 1}
          </div>

          <span
            className={`text-center text-xs sm:text-sm ${
              index === 1 ? "font-semibold text-[#17152B]" : "text-[#625D76]"
            }`}
          >
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}

function InviteRow({
  invitee,
  onRemove,
  onRoleChange,
  disabled,
}: {
  invitee: Invitee;
  onRemove: (id: string) => void;
  onRoleChange: (id: string, role: MemberRole) => void;
  disabled: boolean;
}) {
  const avatarColors = [
    "bg-[#E8DEFF] text-[#7142CD]",
    "bg-[#FFE5D1] text-[#A94C20]",
    "bg-[#D6F5E7] text-[#187A4B]",
    "bg-[#DCEAFF] text-[#315FC0]",
  ];

  const color =
    avatarColors[
      invitee.email
        .split("")
        .reduce((total, char) => total + char.charCodeAt(0), 0) %
        avatarColors.length
    ];

  return (
    <div className="flex items-center gap-3 border-b border-[#EAE6F2] px-3 py-3 last:border-0 sm:px-4">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${color}`}
      >
        {getInitials(invitee.email)}
      </div>

      <span className="min-w-0 flex-1 truncate text-sm text-[#17152B]">
        {invitee.email}
      </span>

      <select
        aria-label={`Role for ${invitee.email}`}
        value={invitee.role}
        disabled={disabled}
        onChange={(event) =>
          onRoleChange(invitee.id, event.target.value as MemberRole)
        }
        className="h-9 w-[105px] shrink-0 rounded-lg border border-[#D9D4E6] bg-white px-2 text-xs text-[#211C32] outline-none focus:border-[#9160EF] sm:w-[125px] sm:text-sm"
      >
        <option value="admin">Admin</option>
        <option value="member">Member</option>
      </select>

      <button
        type="button"
        disabled={disabled}
        aria-label={`Remove ${invitee.email}`}
        onClick={() => onRemove(invitee.id)}
        className="rounded-md p-1 text-[#625D76] hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <X size={17} />
      </button>
    </div>
  );
}

function CollaborationPreview() {
  const columns = [
    {
      name: "To Do",
      count: 4,
      color: "bg-[#F2E9FF]",
      accent: "bg-[#D9B5FF]",
    },
    {
      name: "In Progress",
      count: 3,
      color: "bg-[#E9EEFF]",
      accent: "bg-[#9DAFFF]",
    },
    {
      name: "Done",
      count: 6,
      color: "bg-[#E7F8EE]",
      accent: "bg-[#9BDFB1]",
    },
  ];

  return (
    <div className="rounded-[28px] border border-white/80 bg-white/75 p-4 shadow-[0_30px_80px_rgba(115,69,183,0.17)] backdrop-blur-xl">
      <div className="flex overflow-hidden rounded-2xl bg-[#FCFAFF]">
        <div className="flex w-14 shrink-0 flex-col items-center gap-6 border-r border-purple-100 bg-white/90 py-6 text-[#827A99]">
          <Layers3 size={21} className="text-[#9160EF]" />
          <Users size={18} className="text-[#9160EF]" />
          <CheckCircle2 size={18} />
        </div>

        <div className="min-w-0 flex-1 p-4">
          <div className="mb-6 flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-[#211A3B]">Acme Inc.</p>
              <p className="mt-1 text-[11px] text-[#77718E]">Team workspace</p>
            </div>

            <div className="flex -space-x-2">
              {["JD", "AS", "MK"].map((name, index) => (
                <div
                  key={name}
                  className={`flex size-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold ${
                    [
                      "bg-purple-200 text-purple-700",
                      "bg-orange-200 text-orange-700",
                      "bg-green-200 text-green-700",
                    ][index]
                  }`}
                >
                  {name}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {columns.map((column) => (
              <div
                key={column.name}
                className={`min-w-0 rounded-xl p-2 ${column.color}`}
              >
                <div className="mb-3 flex items-center gap-1 text-[10px] font-semibold text-[#211A3B]">
                  <span className="truncate">{column.name}</span>
                  <span className="rounded-full bg-white/70 px-1.5">
                    {column.count}
                  </span>
                </div>

                {[0, 1].map((card) => (
                  <div
                    key={card}
                    className="mb-2 space-y-2 rounded-lg bg-white p-2.5 shadow-sm"
                  >
                    <div className="h-2 w-full rounded-full bg-[#E7E4EE]" />
                    <div className="h-2 w-2/3 rounded-full bg-[#F0EDF5]" />
                    <div
                      className={`mt-4 h-2 w-1/2 rounded-full ${column.accent}`}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InviteMembersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("organizationId");
  const organizationId =
    requestedId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      requestedId,
    )
      ? requestedId
      : null;

  const [emailInput, setEmailInput] = useState("");
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const [addMember] = useAddOrganizationMemberMutation();
  const [createInvitation] = useCreateInvitationMutation();

  const nextUrl = "/dashboard";

  const emails = useMemo(
    () =>
      emailInput
        .split(/[,;\n]+/)
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    [emailInput],
  );

  function addEmails() {
    setError("");
    setSuccessMessage("");

    if (emails.length === 0) return;

    const invalid = emails.find((email) => !emailRegex.test(email));

    if (invalid) {
      setError(`Invalid email address: ${invalid}`);
      return;
    }

    const existing = new Set(invitees.map((item) => item.email));

    const newInvitees = [...new Set(emails)]
      .filter((email) => !existing.has(email))
      .map((email) => ({
        id: crypto.randomUUID(),
        email,
        role: "member" as MemberRole,
      }));

    if (newInvitees.length === 0) {
      setError("These email addresses are already in your list.");
      return;
    }

    setInvitees((previous) => [...previous, ...newInvitees]);
    setEmailInput("");
  }

  function removeInvitee(id: string) {
    setInvitees((previous) => previous.filter((invitee) => invitee.id !== id));
  }

  function updateRole(id: string, role: MemberRole) {
    setInvitees((previous) =>
      previous.map((invitee) =>
        invitee.id === id ? { ...invitee, role } : invitee,
      ),
    );
  }

  async function handleSubmit() {
    setError("");
    setSuccessMessage("");

    if (!organizationId) {
      setError(
        "Organization ID is missing. Please return to organization setup.",
      );
      return;
    }

    if (invitees.length === 0) {
      setError("Add at least one team member.");
      return;
    }

    setIsSubmitting(true);

    const failed: Invitee[] = [];
    let sentCount = 0;

    try {
      for (const invitee of invitees) {
        try {
          await createInvitation({
            organizationId,
            email: invitee.email,
            role: invitee.role,
          }).unwrap();

          sentCount++;
        } catch (error) {
          console.error(
            `Failed to create invitation for ${invitee.email}`,
            error,
          );

          failed.push(invitee);
        }
      }

      setInvitees(failed);

      if (failed.length === 0) {
        router.push(
          `/create-project?organizationId=${encodeURIComponent(
            organizationId,
          )}`,
        );
      } else {
        setError(
          `${failed.length} invitation(s) could not be created. ` +
            "They may already be members or have active invitations.",
        );

        if (sentCount > 0) {
          setSuccessMessage(`${sentCount} invitation(s) created successfully.`);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-layout grid min-h-dvh bg-white lg:grid-cols-[44%_56%]">
      <section className="flex min-h-dvh flex-col px-6 py-8 sm:px-10 xl:px-[clamp(40px,5vw,90px)]">
        <header>
          <Link href="/dashboard" className="inline-flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#AD80FA] to-[#7C4BEF] text-white shadow-lg shadow-purple-200">
              <Layers3 size={23} />
            </span>
            <span className="text-[26px] font-bold tracking-[-0.05em] text-[#17152B]">
              TeamFlow
            </span>
          </Link>
        </header>

        {/* {organizationId && (
          <div className="mt-10">
            <InvitationList organizationId={organizationId} />
          </div>
        )} */}

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[540px]">
            <OnboardingSteps />

            <div className="mb-9">
              <h1 className="text-[38px] font-bold tracking-[-0.055em] text-[#17152B] sm:text-[44px]">
                Invite your team
              </h1>
              <p className="mt-2 text-[15px] leading-6 text-[#625D76]">
                Add your teammates to collaborate on projects, tasks, and more.
              </p>
            </div>

            <div className="space-y-3">
              <label
                htmlFor="invite-email"
                className="block text-sm font-semibold text-[#17152B]"
              >
                Invite by email
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#77718E]"
                />
                <Input
                  id="invite-email"
                  type="text"
                  inputMode="email"
                  value={emailInput}
                  disabled={isSubmitting}
                  onChange={(event) => setEmailInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addEmails();
                    }
                  }}
                  placeholder="Enter email addresses (e.g., john@company.com)"
                  className="h-[54px] rounded-xl border-[#D9D4E6] pl-12 shadow-none focus-visible:border-purple-400 focus-visible:ring-purple-200"
                />
              </div>

              <p className="text-xs text-[#625D76]">
                Add multiple people, separated by commas.
              </p>

              <button
                type="button"
                onClick={addEmails}
                disabled={isSubmitting || !emailInput.trim()}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8754E8] hover:text-[#7140CE] disabled:opacity-40"
              >
                <Plus size={16} />
                Add to list
              </button>
            </div>

            <div className="mt-9">
              <h2 className="mb-4 text-base font-semibold text-[#17152B]">
                Invites ({invitees.length})
              </h2>

              <div className="overflow-hidden rounded-xl border border-[#E4DDF1] bg-white shadow-[0_3px_12px_rgba(84,52,133,0.05)]">
                {invitees.length > 0 ? (
                  invitees.map((invitee) => (
                    <InviteRow
                      key={invitee.id}
                      invitee={invitee}
                      disabled={isSubmitting}
                      onRemove={removeInvitee}
                      onRoleChange={updateRole}
                    />
                  ))
                ) : (
                  <div className="px-5 py-8 text-center">
                    <Users size={24} className="mx-auto mb-3 text-[#A98AE8]" />
                    <p className="text-sm text-[#77718E]">
                      No teammates added yet.
                    </p>
                    <p className="mt-1 text-xs text-[#9993A9]">
                      Enter email addresses above to get started.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-7 rounded-xl border border-[#EEE5FF] bg-[#F6F0FF] p-5">
              <div className="flex items-start gap-3">
                <Info size={22} className="mt-0.5 shrink-0 text-[#9160EF]" />

                <div className="text-sm text-[#211C32]">
                  <p className="mb-2 font-semibold">Role description</p>

                  <ul className="list-disc space-y-1 pl-5 text-[13px] leading-5">
                    <li>
                      <strong>Owner</strong> — Full organization control (you).
                    </li>
                    <li>
                      <strong>Admin</strong> — Manage projects, members, and
                      settings.
                    </li>
                    <li>
                      <strong>Member</strong> — Collaborate on projects and
                      tasks.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              >
                {successMessage}
              </div>
            )}

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || invitees.length === 0}
              className="mt-8 h-[54px] w-full rounded-xl bg-gradient-to-r from-[#A36AF0] to-[#8754E8] text-base font-semibold text-white shadow-[0_8px_20px_rgba(145,91,232,0.18)] hover:from-[#9256E5] hover:to-[#7740D8]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Adding members...
                </>
              ) : (
                <>
                  <Send size={19} />
                  Add Members
                  <ArrowRight size={17} />
                </>
              )}
            </Button>

            <div className="mt-6 text-center">
              <Link
                href={nextUrl}
                className="text-sm font-semibold text-[#8754E8] hover:underline"
              >
                Skip for now
              </Link>
            </div>
          </div>
        </div>

        <footer className="text-center text-xs text-[#AAA5B7]">
          © {new Date().getFullYear()} TeamFlow. All rights reserved.
        </footer>
      </section>

      <aside className="relative hidden min-h-dvh overflow-hidden bg-[#F4E9FF] lg:flex lg:flex-col lg:justify-center">
        <div className="pointer-events-none absolute -left-32 -top-40 size-[450px] rounded-full bg-[#D9BBFF]/70 blur-[85px]" />
        <div className="pointer-events-none absolute -right-32 top-16 size-[450px] rounded-full bg-[#F8D9EF]/90 blur-[85px]" />
        <div className="pointer-events-none absolute -bottom-40 left-10 size-[450px] rounded-full bg-[#DCC5FF]/80 blur-[85px]" />

        <div className="relative z-10 mx-auto w-full max-w-[760px] px-10 py-16 xl:px-16">
          <h2 className="text-[38px] font-bold leading-[1.16] tracking-[-0.055em] text-[#211A3B] xl:text-[48px]">
            Collaboration is
            <br />
            better together.
          </h2>

          <p className="mb-12 mt-5 max-w-[470px] text-base leading-7 text-[#625A79]">
            Bring your team into one shared workspace and turn great ideas into
            real progress.
          </p>

          <CollaborationPreview />

          <div className="mt-12 grid grid-cols-3 gap-5">
            {[
              {
                title: "Get everyone onboard",
                description: "Bring your teammates together.",
              },
              {
                title: "Work together",
                description: "Plan and track work as a team.",
              },
              {
                title: "Move faster",
                description: "Turn ideas into results.",
              },
            ].map((item) => (
              <div key={item.title}>
                <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-white/60 text-[#9160EF]">
                  <Users size={22} />
                </div>
                <p className="text-sm font-semibold text-[#211A3B]">
                  {item.title}
                </p>
                <p className="mt-2 text-xs leading-5 text-[#625A79]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
}
