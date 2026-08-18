"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, KeyRound, MailCheck } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setServerError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error || "Failed to send reset link. Please try again.");
        return;
      }

      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl card-shadow">
        {isSubmitted ? (
          <div className="text-center py-3 space-y-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-primary-subtle border border-primary/20 flex items-center justify-center text-primary">
              <MailCheck className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-text-primary tracking-tight">Check your email</h2>
              <p className="text-xs font-medium text-text-secondary mt-1.5 leading-relaxed max-w-sm mx-auto">
                If an account exists for <strong className="text-text-primary">{submittedEmail}</strong>, we have sent a secure password reset link.
              </p>
            </div>

            <div className="bg-surface-elevated border border-border-subtle rounded-xl p-3.5 text-xs text-text-muted text-left space-y-1">
              <p className="font-semibold text-text-secondary">Next steps:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Check your inbox and spam folder</li>
                <li>The link is valid for 60 minutes</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsSubmitted(false)}
                className="w-full text-xs font-semibold"
              >
                Try another email
              </Button>

              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors py-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Sign in
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-primary-subtle border border-primary/20 text-primary">
                <KeyRound className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-extrabold text-text-primary tracking-tight">Reset password</h2>
            </div>
            <p className="text-xs font-medium text-text-secondary mb-6">
              Enter your registered email address and we&apos;ll send you a password reset link.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                id="forgot-email"
                {...register("email")}
                error={errors.email?.message}
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
                Send Reset Link
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
        )}
      </div>
    </div>
  );
}
