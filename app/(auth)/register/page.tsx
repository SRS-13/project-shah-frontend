"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  Check,
  Loader2,
  ArrowRight,
  Layers3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { useRegisterMutation } from "@/features/auth/authQuery";
import TeamFlowLogo from "../components/TeamFlowLogo";
import DashboardPreview from "../components/DashboardPreview";

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Full name must contain at least 2 characters")
      .max(80, "Name is too long"),
    email: z.email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[a-z]/, "Include a lowercase letter")
      .regex(/[0-9]/, "Include a number"),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((value) => value, {
      message: "You must accept the terms to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type RegisterValues = z.infer<typeof registerSchema>;

const passwordRules = [
  {
    label: "8+ characters",
    test: (value: string) => value.length >= 8,
  },
  {
    label: "Uppercase letter",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: "Lowercase letter",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    label: "Number",
    test: (value: string) => /[0-9]/.test(value),
  },
];

function PasswordStrength({ password }: { password: string }) {
  const passed = passwordRules.filter((rule) => rule.test(password)).length;

  const strengthLabel =
    passed === 0
      ? "Enter a password"
      : passed <= 2
        ? "Needs improvement"
        : passed === 3
          ? "Almost there"
          : "Meets requirements";

  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#77718E]">Password requirements</span>
        <span
          className={`text-xs font-medium ${
            passed === 4 ? "text-emerald-600" : "text-[#8B5CF6]"
          }`}
        >
          {strengthLabel}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-1.5 rounded-full transition-colors ${
              passed >= step
                ? passed === 4
                  ? "bg-emerald-500"
                  : "bg-[#A477F4]"
                : "bg-[#EDE8F4]"
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        {passwordRules.map((rule) => {
          const valid = rule.test(password);

          return (
            <div
              key={rule.label}
              className={`flex items-center gap-1.5 text-xs ${
                valid ? "text-emerald-600" : "text-[#9993A9]"
              }`}
            >
              <Check size={13} strokeWidth={2.5} />
              {rule.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const password =
    useWatch({
      control,
      name: "password",
    }) ?? "";

  const acceptTerms =
    useWatch({
      control,
      name: "acceptTerms",
    }) ?? false;

  const onSubmit = async (values: RegisterValues) => {
    setServerError("");

    try {
      await registerUser({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      }).unwrap();

      // Registration does not automatically log the user in.
      router.replace("/login?registered=1");
    } catch (error: unknown) {
      const apiError = error as {
        status?: number;
        data?: {
          message?: string | string[];
        };
      };

      if (apiError.status === 409) {
        setServerError(
          "An account with this email already exists. Try signing in.",
        );
      } else if (apiError.status === 429) {
        setServerError("Too many requests. Please try again later.");
      } else {
        setServerError("Unable to create your account. Please try again.");
      }
    }
  };

  const busy = isLoading || isSubmitting;

  return (
    <main className="auth-layout grid min-h-dvh w-full bg-white lg:grid-cols-2">
      {/* Left registration form */}
      <section className="flex min-w-0 flex-col px-6 py-6 sm:px-10 lg:px-12 xl:px-16">
        <header>
          <TeamFlowLogo />
        </header>

        <div className="flex flex-1 items-center justify-center py-8 lg:py-10">
          <div className="w-full max-w-[440px]">
            {/* Heading */}
            <div className="mb-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F4EEFF] px-3 py-1.5 text-xs font-medium text-[#8754E8]">
                <Layers3 size={13} />
                Get started with TeamFlow
              </div>

              <h1 className="text-3xl font-bold leading-tight tracking-[-0.04em] text-[#17152B] sm:text-4xl">
                Create your account
              </h1>

              <p className="mt-2 text-[15px] text-[#69647C]">
                Start organizing your team&apos;s work in minutes.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-4 [&_input]:bg-white [&_input]:text-[#211C32]"
            >
              {/* Full name */}
              <div className="space-y-2">
                <Label
                  htmlFor="register-name"
                  className="text-sm font-semibold text-[#211C32]"
                >
                  Full name
                </Label>

                <div className="relative">
                  <UserRound
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#88849B]"
                  />

                  <Input
                    id="register-name"
                    type="text"
                    placeholder="John Doe"
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    {...register("name")}
                    className="h-[52px] rounded-xl border-[#DDD9E8] pl-12 shadow-none placeholder:text-[#9792A8] focus-visible:border-purple-400 focus-visible:ring-purple-200"
                  />
                </div>

                {errors.name && (
                  <p role="alert" className="text-xs text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="register-email"
                  className="text-sm font-semibold text-[#211C32]"
                >
                  Work email
                </Label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#88849B]"
                  />

                  <Input
                    id="register-email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                    className="h-[52px] rounded-xl border-[#DDD9E8] pl-12 shadow-none placeholder:text-[#9792A8] focus-visible:border-purple-400 focus-visible:ring-purple-200"
                  />
                </div>

                {errors.email && (
                  <p role="alert" className="text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="register-password"
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
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                    className="h-[52px] rounded-xl border-[#DDD9E8] pl-12 pr-12 shadow-none placeholder:text-[#9792A8] focus-visible:border-purple-400 focus-visible:ring-purple-200"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#77718E] hover:text-purple-600"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>

                {errors.password && (
                  <p role="alert" className="text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}

                <PasswordStrength password={password} />
              </div>

              {/* Confirm password */}
              <div className="space-y-2">
                <Label
                  htmlFor="register-confirm-password"
                  className="text-sm font-semibold text-[#211C32]"
                >
                  Confirm password
                </Label>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#88849B]"
                  />

                  <Input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    aria-invalid={!!errors.confirmPassword}
                    {...register("confirmPassword")}
                    className="h-[52px] rounded-xl border-[#DDD9E8] pl-12 pr-12 shadow-none placeholder:text-[#9792A8] focus-visible:border-purple-400 focus-visible:ring-purple-200"
                  />

                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#77718E] hover:text-purple-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p role="alert" className="text-xs text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="space-y-2 pt-1">
                <label className="flex cursor-pointer items-start gap-3">
                  <Checkbox
                    checked={acceptTerms}
                    onCheckedChange={(checked) =>
                      setValue("acceptTerms", checked === true, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    aria-invalid={!!errors.acceptTerms}
                    className="mt-0.5 border-[#CFC8E0] data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600"
                  />

                  <span className="text-[13px] leading-5 text-[#69647C]">
                    I agree to the{" "}
                    <span className="font-semibold text-[#8754E8]">
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold text-[#8754E8]">
                      Privacy Policy
                    </span>
                  </span>
                </label>

                {errors.acceptTerms && (
                  <p role="alert" className="text-xs text-red-600">
                    {errors.acceptTerms.message}
                  </p>
                )}
              </div>

              {/* API error */}
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>

            {/* Login navigation */}
            <div className="mt-6 text-center text-sm text-[#69647C]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#8754E8] hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>

        <footer className="text-center text-xs text-[#AAA5B7]">
          © TeamFlow. All rights reserved.
        </footer>
      </section>

      <aside className="relative hidden min-w-0 overflow-hidden bg-[#F4ECFF] lg:flex lg:items-center lg:justify-center">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-12 size-96 rounded-full bg-pink-200/50 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-purple-300/40 blur-3xl" />
        <div className="relative w-full max-w-[720px] space-y-10 px-8 py-16 xl:px-12">
          <div className="mx-auto max-w-[540px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/70 px-3 py-2 text-xs font-semibold text-purple-700">
              <Layers3 size={14} />
              A little structure. A lot more progress.
            </span>
            <h2 className="mt-6 text-4xl font-bold leading-tight tracking-[-0.04em] text-[#211A3B] xl:text-5xl">
              Great teamwork starts here.
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-[#625A79]">
              Bring your projects, tasks, and people together in one shared workspace.
            </p>
          </div>
          <DashboardPreview />
          <p className="text-center text-sm font-medium text-[#625A79]">
            Less busywork. More moving forward.
          </p>
        </div>
      </aside>
    </main>
  );
}
