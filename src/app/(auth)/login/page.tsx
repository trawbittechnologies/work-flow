"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Sparkles } from "lucide-react";
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


  return (
    <div className="space-y-4">
      {/* Registration Success Banner */}
      {registered && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3.5 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <Sparkles className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          <span>Account created successfully! You can now sign in below.</span>
        </div>
      )}

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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="text-xs font-extrabold uppercase tracking-wider text-[#0A1237] dark:text-white"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-text-secondary hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
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
          </div>

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
