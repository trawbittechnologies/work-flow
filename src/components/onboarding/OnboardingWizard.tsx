"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  User,
  Camera,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Upload,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  UserCircle2,
  ShieldCheck,
  BadgeInfo
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OnboardingWizardProps {
  userName: string;
  userEmail: string;
  userId: string;
  onComplete: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DESIGNATIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "UI/UX Designer",
  "Product Manager",
  "Project Manager",
  "QA Engineer",
  "DevOps Engineer",
  "Data Analyst",
  "Scrum Master",
  "Business Analyst",
  "Mobile Developer",
  "Cloud Architect",
  "Security Engineer",
  "Technical Lead",
  "CTO / VP Engineering",
];

const SUPERHERO_AVATARS = [
  { id: "spiderman", name: "Spider-Man", src: "/avatars/spiderman.svg", color: "#cc1818" },
  { id: "superman", name: "Superman", src: "/avatars/superman.svg", color: "#0d2b8a" },
  { id: "ironman", name: "Iron Man", src: "/avatars/ironman.svg", color: "#cc2200" },
  { id: "hulk", name: "Hulk", src: "/avatars/hulk.svg", color: "#22bb44" },
  { id: "thor", name: "Thor", src: "/avatars/thor.svg", color: "#3355cc" },
  { id: "batman", name: "Batman", src: "/avatars/batman.svg", color: "#1a1a1a" },
  { id: "wonderwoman", name: "Wonder Woman", src: "/avatars/wonderwoman.svg", color: "#cc0022" },
  { id: "captainamerica", name: "Captain America", src: "/avatars/captainamerica.svg", color: "#1144cc" },
  { id: "blackpanther", name: "Black Panther", src: "/avatars/blackpanther.svg", color: "#4400cc" },
  { id: "flash", name: "The Flash", src: "/avatars/flash.svg", color: "#cc3300" },
];

function generatePassword(length = 14): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%^&*";
  const all = upper + lower + digits + special;
  let pwd = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  for (let i = 4; i < length; i++) {
    pwd.push(all[Math.floor(Math.random() * all.length)]);
  }
  return pwd.sort(() => Math.random() - 0.5).join("");
}

// ─── Step Components ──────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  const steps = [
    { icon: User, label: "Designation" },
    { icon: Camera, label: "Profile" },
    { icon: Lock, label: "Password" },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  done
                    ? "bg-[#88C315] border-[#88C315] text-white"
                    : active
                    ? "bg-white border-[#88C315] text-[#88C315] shadow-sm"
                    : "bg-[#F9FAFB] border-[#E5E7EB] text-[#9CA3AF]"
                }`}
              >
                {done ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={`text-[10px] font-bold tracking-wide ${
                  active ? "text-[#111827]" : done ? "text-[#4B5563]" : "text-[#9CA3AF]"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-12 sm:w-16 h-0.5 mb-4 mx-2 transition-all duration-300 ${
                  done ? "bg-[#88C315]" : "bg-[#E5E7EB]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Step 1: Designation
function Step1Designation({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [custom, setCustom] = useState(
    DESIGNATIONS.includes(value) ? "" : value
  );
  const [useCustom, setUseCustom] = useState(
    !DESIGNATIONS.includes(value) && value !== ""
  );

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#F3F9DE] text-[#88C315] mb-2">
          <BadgeInfo className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#111827]">What&apos;s your role?</h2>
        <p className="text-sm text-[#6B7280]">
          Select your designation or add a custom title
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {DESIGNATIONS.map((d) => (
          <button
            key={d}
            onClick={() => {
              onChange(d);
              setUseCustom(false);
            }}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all duration-200 border ${
              value === d && !useCustom
                ? "bg-[#F3F9DE] border-[#88C315] text-[#88C315] ring-1 ring-[#88C315]"
                : "bg-white border-[#E5E7EB] text-[#4B5563] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="border-t border-[#EAEDF2] pt-4 mt-2">
        <button
          onClick={() => setUseCustom((v) => !v)}
          className="flex items-center gap-2 text-xs text-[#6B7280] hover:text-[#111827] font-semibold transition-colors"
        >
          <span className={`w-4 h-4 rounded border transition-all ${useCustom ? "bg-[#88C315] border-[#88C315]" : "border-[#D1D5DB]"} flex items-center justify-center`}>
            {useCustom && <Check className="w-2.5 h-2.5 text-white" />}
          </span>
          Use a custom title instead
        </button>

        {useCustom && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="e.g. Senior Solutions Architect"
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value);
                onChange(e.target.value);
              }}
              className="w-full bg-white border border-[#D1D5DB] focus:border-[#88C315] focus:ring-1 focus:ring-[#88C315] rounded-xl px-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none transition-all shadow-sm"
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Step 2: Profile Picture
function Step2Avatar({
  value,
  onChange,
  userName,
}: {
  value: string;
  onChange: (v: string) => void;
  userName: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [customPreview, setCustomPreview] = useState<string | null>(
    value && !value.startsWith("/avatars/") ? value : null
  );

  async function handleFileUpload(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onChange(data.url);
      setCustomPreview(data.url);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) handleFileUpload(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#F3F9DE] text-[#88C315] mb-2">
          <UserCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#111827]">Choose your avatar</h2>
        <p className="text-sm text-[#6B7280]">
          Pick a superhero or upload your own photo, {userName.split(" ")[0]}!
        </p>
      </div>

      {/* Preview */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-[#E5E7EB] bg-white shadow-sm flex flex-shrink-0 items-center justify-center">
            {value ? (
              <Image
                src={value}
                alt="Selected avatar"
                width={96}
                height={96}
                unoptimized
                className="object-cover w-full h-full"
              />
            ) : (
              <User className="w-8 h-8 text-[#D1D5DB]" />
            )}
          </div>
          {value && (
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#88C315] border-2 border-white rounded-full flex items-center justify-center shadow-sm">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Superhero grid */}
      <div className="grid grid-cols-5 gap-2 pt-2">
        {SUPERHERO_AVATARS.map((hero) => (
          <button
            key={hero.id}
            onClick={() => {
              onChange(hero.src);
              setCustomPreview(null);
            }}
            title={hero.name}
            className={`group relative rounded-xl overflow-hidden transition-all duration-200 aspect-square border ${
              value === hero.src
                ? "ring-2 ring-[#88C315] border-transparent"
                : "border-[#E5E7EB] hover:border-[#D1D5DB]"
            }`}
          >
            <div
              className="w-full h-full flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: `${hero.color}15` }}
            >
              <Image
                src={hero.src}
                alt={hero.name}
                width={48}
                height={48}
                unoptimized
                className="w-[80%] h-[80%] object-contain"
              />
            </div>
            {value === hero.src && (
              <div className="absolute inset-0 bg-[#88C315]/10 flex items-center justify-center" />
            )}
          </button>
        ))}
      </div>

      {/* Custom upload */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-[#D1D5DB] hover:border-[#88C315] bg-[#F9FAFB] rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all group mt-2"
      >
        <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-center flex-shrink-0 transition-colors group-hover:border-[#88C315]/50 group-hover:text-[#88C315]">
          {uploading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : customPreview ? (
            <Image
              src={customPreview}
              alt="Custom"
              width={40}
              height={40}
              unoptimized
              className="w-full h-full rounded-lg object-cover"
            />
          ) : (
            <Upload className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#88C315] transition-colors" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-[#111827]">
            {uploading ? "Uploading..." : customPreview ? "Custom photo selected" : "Upload custom photo"}
          </p>
          <p className="text-xs text-[#6B7280]">PNG, JPG, WEBP · Drop or click</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />
      </div>
      {uploadError && (
        <p className="text-xs text-red-500 font-medium text-center">{uploadError}</p>
      )}
    </div>
  );
}

// Step 3: Password
function Step3Password({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [useGenerated, setUseGenerated] = useState(true);
  const [generated, setGenerated] = useState(() => generatePassword());
  const [custom, setCustom] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  function refreshPassword() {
    const pwd = generatePassword();
    setGenerated(pwd);
    if (useGenerated) onChange(pwd);
  }

  function handleCopy() {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Sync value on mode change
  function switchMode(toGenerated: boolean) {
    setUseGenerated(toGenerated);
    if (toGenerated) {
      onChange(generated);
    } else {
      onChange(custom);
    }
  }

  const passwordsMatch = custom === confirm && custom.length > 0;
  const customValid = custom.length >= 8;

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#F3F9DE] text-[#88C315] mb-2">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#111827]">Secure your account</h2>
        <p className="text-sm text-[#6B7280]">
          Use a generated password or create your own
        </p>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-2 bg-[#F9FAFB] rounded-xl p-1.5 border border-[#EAEDF2]">
        <button
          onClick={() => switchMode(true)}
          className={`py-2 rounded-lg text-xs font-bold transition-all ${
            useGenerated
              ? "bg-white border border-[#D1D5DB] text-[#111827] shadow-sm"
              : "text-[#6B7280] hover:text-[#374151]"
          }`}
        >
          Auto-Generate
        </button>
        <button
          onClick={() => switchMode(false)}
          className={`py-2 rounded-lg text-xs font-bold transition-all ${
            !useGenerated
              ? "bg-white border border-[#D1D5DB] text-[#111827] shadow-sm"
              : "text-[#6B7280] hover:text-[#374151]"
          }`}
        >
          Custom Password
        </button>
      </div>

      {useGenerated ? (
        <div className="space-y-4">
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between gap-3 shadow-sm">
            <code className="text-base font-mono font-bold text-[#111827] tracking-widest flex-1 break-all">
              {generated}
            </code>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={refreshPassword}
                className="p-2 rounded-lg bg-white border border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#4B5563] transition-colors shadow-sm"
                title="Regenerate"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-white border border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#4B5563] transition-colors shadow-sm"
                title="Copy password"
              >
                {copied ? <Check className="w-4 h-4 text-[#88C315]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <div className="mt-0.5 text-amber-500">
              <BadgeInfo className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">Save this password!</p>
              <p className="text-xs text-amber-700 mt-0.5">You will need this password to sign in next time.</p>
            </div>
          </div>

          {/* Trigger onChange on mount for generated mode */}
          <input type="hidden" value={generated} onChange={() => {}} ref={(el) => { if (el && !value) onChange(generated); }} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-xs font-semibold text-[#4B5563] mb-1.5">
              New Password
            </label>
            <input
              type={showPwd ? "text" : "password"}
              placeholder="Minimum 8 characters"
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value);
                onChange(e.target.value);
              }}
              className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none transition-all pr-10 shadow-sm ${
                custom.length > 0 && !customValid
                  ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-[#D1D5DB] focus:border-[#88C315] focus:ring-1 focus:ring-[#88C315]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-8 text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength bar */}
          {custom.length > 0 && (
            <div className="flex gap-1">
              {[8, 10, 12, 14].map((threshold, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    custom.length >= threshold
                      ? i < 2 ? "bg-red-400" : i === 2 ? "bg-amber-400" : "bg-[#88C315]"
                      : "bg-[#E5E7EB]"
                  }`}
                />
              ))}
            </div>
          )}

          <div className="relative">
            <label className="block text-xs font-semibold text-[#4B5563] mb-1.5">
              Confirm Password
            </label>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none transition-all pr-10 shadow-sm ${
                confirm.length > 0 && !passwordsMatch
                  ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : confirm.length > 0 && passwordsMatch
                  ? "border-[#88C315] focus:border-[#88C315] focus:ring-1 focus:ring-[#88C315]"
                  : "border-[#D1D5DB] focus:border-[#88C315] focus:ring-1 focus:ring-[#88C315]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-8 text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {confirm.length > 0 && !passwordsMatch && (
            <p className="text-xs text-red-500 font-medium">Passwords don&apos;t match</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export function OnboardingWizard({
  userName,
  userEmail,
  onComplete,
}: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [designation, setDesignation] = useState("");
  const [avatar, setAvatar] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canNext =
    step === 0
      ? designation.trim().length > 0
      : step === 1
      ? avatar.trim().length > 0
      : password.length >= 8;

  async function handleComplete() {
    setSaving(true);
    setError("");
    try {
      // 1. Save profile (designation + avatar + mark onboarding complete)
      const profileRes = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designation,
          avatar: avatar || undefined,
          onboardingComplete: true,
        }),
      });
      if (!profileRes.ok) throw new Error("Failed to save profile");

      // 2. Update password
      const passwordRes = await fetch("/api/users/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: password,
          confirmPassword: password,
        }),
      });
      if (!passwordRes.ok) throw new Error("Failed to update password");

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#F3F4F6]/80 backdrop-blur-sm">
      
      {/* Card */}
      <div className="relative w-full max-w-lg bg-white border border-[#E5E7EB] rounded-3xl shadow-xl overflow-hidden">
        
        <div className="p-6 sm:p-8">
          {/* Welcome header */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-black text-[#111827]">
              Welcome to <span className="text-[#88C315]">Flowdesk</span>!
            </h1>
            <p className="text-sm font-medium text-[#6B7280] mt-1">
              {userEmail}
            </p>
          </div>

          {/* Step indicator */}
          <StepIndicator current={step} total={3} />

          {/* Step content */}
          <div className="min-h-[340px]">
            {step === 0 && (
              <Step1Designation value={designation} onChange={setDesignation} />
            )}
            {step === 1 && (
              <Step2Avatar value={avatar} onChange={setAvatar} userName={userName} />
            )}
            {step === 2 && (
              <Step3Password value={password} onChange={setPassword} />
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#EAEDF2]">
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-all disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext}
                className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm ${
                  canNext
                    ? "bg-[#111827] hover:bg-[#374151] text-white"
                    : "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
                }`}
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canNext || saving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm ${
                  canNext && !saving
                    ? "bg-[#88C315] hover:bg-[#77AB12] text-white"
                    : "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
                }`}
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Enter Flowdesk
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
      `}</style>
    </div>
  );
}
