"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setServerError("");
    const result = await signIn("credentials", {
      email: data.email.toLowerCase(),
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError("Invalid email or password. Please try again.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  function handleFillAdminCredentials() {
    setValue("email", "admin@flowdesk.io");
    setValue("password", "adminpassword123");
  }

  return (
    <div className="space-y-4">
      {/* Default Admin Quick Login Card */}
      <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-[14px] p-4 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <ShieldCheck className="h-3.5 w-3.5" /> Default Admin Credentials
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">
            <code className="bg-white/80 dark:bg-black/40 px-1 py-0.5 rounded font-mono text-[10px]">admin@flowdesk.io</code> / <code className="bg-white/80 dark:bg-black/40 px-1 py-0.5 rounded font-mono text-[10px]">adminpassword123</code>
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleFillAdminCredentials}
          className="text-xs shrink-0"
        >
          Fill Form
        </Button>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-0.5">Welcome back</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-5">Sign in to your Flowdesk workspace</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            id="login-email"
            {...register("email")}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Your password"
            autoComplete="current-password"
            id="login-password"
            {...register("password")}
            error={errors.password?.message}
            rightAddon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          {serverError && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-[8px] px-3 py-2">
              {serverError}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full"
          >
            Sign in
          </Button>
        </form>

        <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)]">
          Need access? Ask your project owner or workspace admin to add your account.
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-[var(--text-muted)]">Loading login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
