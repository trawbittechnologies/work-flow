"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      email,
    },
  });

  if (!token || !email) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl card-shadow text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-text-primary tracking-tight">Invalid Reset Link</h2>
          <p className="text-xs font-medium text-text-secondary mt-1.5 leading-relaxed">
            This password reset link is missing required parameters or is invalid.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(data: ResetPasswordInput) {
    setServerError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error || "Failed to reset password. Please try again.");
        return;
      }

      setIsSuccess(true);
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    }
  }

  if (isSuccess) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl card-shadow text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <div>
          <h2 className="text-lg font-extrabold text-text-primary tracking-tight">Password Reset Complete</h2>
          <p className="text-xs font-medium text-text-secondary mt-1.5 leading-relaxed">
            Your password has been successfully updated. You can now log in with your new password.
          </p>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={() => router.push("/login")}
            className="w-full shadow-md font-bold"
          >
            Sign in to Flowdesk
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl card-shadow">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-xl bg-primary-subtle border border-primary/20 text-primary">
          <Lock className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-extrabold text-text-primary tracking-tight">Set new password</h2>
      </div>
      <p className="text-xs font-medium text-text-secondary mb-6">
        Create a new secure password for <strong className="text-text-primary">{email}</strong>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("token")} value={token} />
        <input type="hidden" {...register("email")} value={email} />

        <Input
          label="New Password"
          type={showPassword ? "text" : "password"}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          id="new-password"
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

        <Input
          label="Confirm New Password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Re-enter new password"
          autoComplete="new-password"
          id="confirm-password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
          rightAddon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
          Update Password
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-border-subtle text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-text-muted">Loading reset form...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
