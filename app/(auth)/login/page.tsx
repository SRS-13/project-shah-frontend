
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Layers3,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  Loader2,
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Users,
  CircleCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useLoginMutation } from "@/features/auth/authQuery";
import TeamFlowLogo from "../components/TeamFlowLogo";
import DashboardPreview from "../components/DashboardPreview";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;


function LoginIllustration() {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-[#F4E9FF] lg:flex lg:flex-col lg:justify-center">
      {/* Abstract pastel background */}
      <div className="pointer-events-none absolute -left-32 -top-44 size-[450px] rounded-full bg-[#D9BBFF]/70 blur-[70px]" />
      <div className="pointer-events-none absolute -right-32 top-20 size-[420px] rounded-full bg-[#F8D9EF]/90 blur-[75px]" />
      <div className="pointer-events-none absolute -bottom-44 left-12 size-[480px] rounded-full bg-[#DCC5FF]/80 blur-[75px]" />

      <div className="relative z-10 mx-auto w-full max-w-[750px] px-10 py-16 xl:px-16">
        <div className="mx-auto mb-12 max-w-[560px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-white/60 px-4 py-2 text-xs font-semibold text-purple-700">
            <span className="size-2 rounded-full bg-purple-500" />
            Your workspace, simplified
          </div>

          <h2 className="text-[38px] font-bold leading-[1.18] tracking-[-0.055em] text-[#211A3B] xl:text-[49px]">
            Manage projects,
            <br />
            tasks, and your team
            <br />
            in one place.
          </h2>

          <p className="mt-6 max-w-[480px] text-base leading-7 text-[#625A79]">
            Plan, collaborate, and track progress with
            TeamFlow — the modern project management
            platform for growing teams.
          </p>
        </div>

        <DashboardPreview />

        <div className="mt-9 flex items-center justify-center gap-2">
          <span className="h-2 w-7 rounded-full bg-purple-600" />
          <span className="size-2 rounded-full bg-purple-300" />
          <span className="size-2 rounded-full bg-purple-300" />
        </div>
      </div>
    </aside>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState("");

  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: LoginValues) => {
    setServerError("");

    try {
      await login(values).unwrap();

      // Requires a valid server-side session established by the API.
      router.replace("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      const apiError = error as { status?: number };

      if (apiError.status === 401) {
        setServerError("Incorrect email or password.");
      } else if (apiError.status === 429) {
        setServerError(
          "Too many login attempts. Please try again later."
        );
      } else {
        setServerError(
          "Unable to sign in. Please try again."
        );
      }
    }
  };

  const busy = isLoading || isSubmitting;

  return (
    <main className="auth-layout grid min-h-screen bg-white lg:grid-cols-[44%_56%]">
      {/* Left login panel */}
      <section className="flex min-h-screen flex-col px-6 py-8 sm:px-12 xl:px-[clamp(48px,6vw,110px)]">
        <header>
          <TeamFlowLogo />
        </header>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[440px]">
            <div className="mb-10">
              <h1 className="text-[36px] font-bold tracking-[-0.055em] text-[#17152B] sm:text-[42px]">
                Welcome back
              </h1>
              <p className="mt-2 text-[15px] text-[#69647C]">
                Sign in to your TeamFlow workspace
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-6"
            >
              {/* Email */}
              <div className="space-y-2.5">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-[#211C32]"
                >
                  Email address
                </Label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#88849B]"
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                    className="h-[54px] rounded-xl border-[#DDD9E8] bg-white pl-12 text-[15px] shadow-none placeholder:text-[#9792A8] focus-visible:border-purple-400 focus-visible:ring-purple-200"
                  />
                </div>

                {errors.email && (
                  <p role="alert" className="text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2.5">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-[#211C32]"
                >
                  Password
                </Label>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#88849B]"
                  />

                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                    className="h-[54px] rounded-xl border-[#DDD9E8] pl-12 pr-12 text-[15px] shadow-none placeholder:text-[#9792A8] focus-visible:border-purple-400 focus-visible:ring-purple-200"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#77718E] transition hover:text-purple-600"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p role="alert" className="text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember me / Forgot password */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#625D76]">
                  <Checkbox
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked === true)
                    }
                    className="border-[#CFC8E0] data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600"
                  />
                  Remember me
                </label>

                <span
                  className="text-sm text-[#8B5CF6]"
                  title="Password recovery will be available after the backend endpoint is implemented"
                >
                  Forgot password?
                </span>
              </div>

              {serverError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {serverError}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={busy}
                className="h-[54px] w-full rounded-xl bg-gradient-to-r from-[#A36AF0] to-[#8754E8] text-[16px] font-semibold text-white shadow-[0_8px_20px_rgba(145,91,232,0.18)] transition hover:from-[#9256E5] hover:to-[#7740D8]"
              >
                {busy ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            {/* Social authentication is intentionally not shown:
                Google/GitHub OAuth endpoints are not yet implemented. */}

            <div className="mt-10 text-center text-sm text-[#69647C]">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#8754E8] hover:underline"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>

        <footer className="text-center text-xs text-[#AAA5B7]">
          © TeamFlow. All rights reserved.
        </footer>
      </section>

      {/* Right product preview */}
      <LoginIllustration />
    </main>
  );
}
