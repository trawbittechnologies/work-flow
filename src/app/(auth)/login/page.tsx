"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const registered = searchParams.get("registered") === "1";
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
      {/* Registration Success Banner */}
      {registered && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3.5 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <Sparkles className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          <span>Account created successfully! You can now sign in below.</span>
        </div>
      )}

      {/* Default Admin Quick Login Card */}
      <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/80 dark:border-indigo-800/40 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" /> Demo Admin Access
          </div>
          <p className="text-[11px] font-mono text-text-secondary">
            <code className="bg-surface px-1.5 py-0.5 rounded border border-border text-[10px]">admin@flowdesk.io</code> / <code className="bg-surface px-1.5 py-0.5 rounded border border-border text-[10px]">adminpassword123</code>
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleFillAdminCredentials}
          className="text-xs shrink-0 font-bold border-indigo-200 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white"
        >
          Auto Fill
        </Button>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl card-shadow">
        <h2 className="text-lg font-extrabold text-text-primary tracking-tight">Welcome back</h2>
        <p className="text-xs font-medium text-text-secondary mb-6 mt-0.5">Sign in to your Flowdesk workspace</p>

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
                className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          {serverError && (
            <div className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl px-3.5 py-2.5">
              {serverError}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full shadow-md font-bold mt-2"
          >
            Sign in
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-border-subtle text-center text-xs text-text-muted">
          Need workspace access? Ask your project owner or admin to invite your email.
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-text-muted">Loading login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
