"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
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
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] p-6 shadow-sm">
      <h2 className="text-base font-semibold text-[var(--text-primary)] mb-0.5">Welcome back</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-5">Sign in to your account</p>

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

      <div className="mt-5 flex items-center justify-between text-sm">
        <Link
          href="/forgot-password"
          className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          Forgot password?
        </Link>
        <span className="text-[var(--text-muted)]">
          No account?{" "}
          <Link href="/register" className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium transition-colors">
            Sign up
          </Link>
        </span>
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
