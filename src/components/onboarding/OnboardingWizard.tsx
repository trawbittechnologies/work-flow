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
  Sparkles,
  Shield,
  Zap,
  RefreshCw,
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
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  done
                    ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30"
                    : active
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 scale-110"
                    : "bg-[#1e2035] border border-[#2e3050]"
                }`}
              >
                {done ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <Icon className={`w-4 h-4 ${active ? "text-white" : "text-[#5a5f7a]"}`} />
                )}
              </div>
              <span
                className={`text-[10px] font-semibold tracking-wide ${
                  active ? "text-white" : done ? "text-emerald-400" : "text-[#5a5f7a]"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-14 h-0.5 mb-5 mx-1 transition-all duration-500 ${
                  done ? "bg-gradient-to-r from-emerald-500 to-indigo-500" : "bg-[#2e3050]"
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
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs text-indigo-300 font-medium">Step 1 of 3</span>
        </div>
        <h2 className="text-2xl font-bold text-white">What&apos;s your role?</h2>
        <p className="text-sm text-[#8892b0]">
          Select your designation or add a custom title
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
        {DESIGNATIONS.map((d) => (
          <button
            key={d}
            onClick={() => {
              onChange(d);
              setUseCustom(false);
            }}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all duration-200 border ${
              value === d && !useCustom
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/25"
                : "bg-[#1e2035] border-[#2e3050] text-[#8892b0] hover:border-indigo-500/50 hover:text-white hover:bg-[#252840]"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="border-t border-[#2e3050] pt-4">
        <button
          onClick={() => setUseCustom((v) => !v)}
          className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
        >
          <span className={`w-4 h-4 rounded border transition-all ${useCustom ? "bg-indigo-500 border-indigo-400" : "border-[#4a5070]"} flex items-center justify-center`}>
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
              className="w-full bg-[#1e2035] border border-[#2e3050] focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a5f7a] outline-none transition-all"
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
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-3">
          <Camera className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs text-purple-300 font-medium">Step 2 of 3</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Choose your avatar</h2>
        <p className="text-sm text-[#8892b0]">
          Pick a superhero or upload your own photo, {userName.split(" ")[0]}!
        </p>
      </div>

      {/* Preview */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-xl shadow-purple-500/20">
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
              <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
                <User className="w-10 h-10 text-white/60" />
              </div>
            )}
          </div>
          {value && (
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Superhero grid */}
      <div className="grid grid-cols-5 gap-2">
        {SUPERHERO_AVATARS.map((hero) => (
          <button
            key={hero.id}
            onClick={() => {
              onChange(hero.src);
              setCustomPreview(null);
            }}
            title={hero.name}
            className={`group relative rounded-xl overflow-hidden transition-all duration-200 aspect-square ${
              value === hero.src
                ? "ring-2 ring-purple-400 scale-95 shadow-lg"
                : "hover:scale-105 hover:ring-2 hover:ring-purple-500/50"
            }`}
          >
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `${hero.color}22` }}
            >
              <Image
                src={hero.src}
                alt={hero.name}
                width={64}
                height={64}
                unoptimized
                className="w-full h-full object-cover"
              />
            </div>
            {value === hero.src && (
              <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-white drop-shadow" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-[8px] text-white text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity font-medium truncate px-1">
              {hero.name}
            </div>
          </button>
        ))}
      </div>

      {/* Custom upload */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-[#2e3050] hover:border-purple-500/50 rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all group"
      >
        <div className="w-10 h-10 rounded-lg bg-[#1e2035] flex items-center justify-center group-hover:bg-purple-500/10 transition-colors flex-shrink-0">
          {uploading ? (
            <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
          ) : customPreview ? (
            <Image
              src={customPreview}
              alt="Custom"
              width={40}
              height={40}
              unoptimized
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <Upload className="w-5 h-5 text-[#5a5f7a] group-hover:text-purple-400 transition-colors" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">
            {uploading ? "Uploading..." : customPreview ? "Custom photo selected ✓" : "Upload custom photo"}
          </p>
          <p className="text-xs text-[#5a5f7a]">PNG, JPG, WEBP · Drop or click</p>
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
        <p className="text-xs text-red-400 text-center">{uploadError}</p>
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
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-3">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs text-emerald-300 font-medium">Step 3 of 3</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Secure your account</h2>
        <p className="text-sm text-[#8892b0]">
          Use the generated password or create your own
        </p>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-2 bg-[#141628] rounded-xl p-1.5 border border-[#2e3050]">
        <button
          onClick={() => switchMode(true)}
          className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
            useGenerated
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
              : "text-[#5a5f7a] hover:text-white"
          }`}
        >
          <Zap className="inline w-3.5 h-3.5 mr-1.5" />
          Auto-Generate
        </button>
        <button
          onClick={() => switchMode(false)}
          className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
            !useGenerated
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
              : "text-[#5a5f7a] hover:text-white"
          }`}
        >
          <Lock className="inline w-3.5 h-3.5 mr-1.5" />
          Custom Password
        </button>
      </div>

      {useGenerated ? (
        <div className="space-y-3">
          <div className="bg-[#1e2035] border border-[#2e3050] rounded-xl p-4 flex items-center justify-between gap-3">
            <code className="text-base font-mono text-emerald-300 tracking-widest flex-1 break-all">
              {generated}
            </code>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={refreshPassword}
                className="p-2 rounded-lg bg-[#252840] hover:bg-[#2e3050] text-[#5a5f7a] hover:text-white transition-all"
                title="Regenerate"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-[#252840] hover:bg-emerald-500/20 text-[#5a5f7a] hover:text-emerald-400 transition-all"
                title="Copy password"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-300 font-medium flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              Save this password! You&apos;ll need it to sign in next time.
            </p>
          </div>

          {/* Trigger onChange on mount for generated mode */}
          <input type="hidden" value={generated} onChange={() => {}} ref={(el) => { if (el && !value) onChange(generated); }} />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <label className="block text-xs font-semibold text-[#8892b0] mb-1.5">
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
              className={`w-full bg-[#1e2035] border rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a5f7a] outline-none transition-all pr-12 ${
                custom.length > 0 && !customValid
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-[#2e3050] focus:border-indigo-500"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-9 text-[#5a5f7a] hover:text-white transition-colors"
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
                      ? i < 2 ? "bg-red-400" : i === 2 ? "bg-amber-400" : "bg-emerald-400"
                      : "bg-[#2e3050]"
                  }`}
                />
              ))}
            </div>
          )}

          <div className="relative">
            <label className="block text-xs font-semibold text-[#8892b0] mb-1.5">
              Confirm Password
            </label>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`w-full bg-[#1e2035] border rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a5f7a] outline-none transition-all pr-12 ${
                confirm.length > 0 && !passwordsMatch
                  ? "border-red-500/50 focus:border-red-500"
                  : confirm.length > 0 && passwordsMatch
                  ? "border-emerald-500/50 focus:border-emerald-500"
                  : "border-[#2e3050] focus:border-indigo-500"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-9 text-[#5a5f7a] hover:text-white transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {confirm.length > 0 && !passwordsMatch && (
            <p className="text-xs text-red-400">Passwords don&apos;t match</p>
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: "rgba(8, 9, 26, 0.97)", backdropFilter: "blur(20px)" }}>
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-lg bg-[#0d0f1e] border border-[#1e2240] rounded-3xl shadow-2xl overflow-hidden">
        {/* Top gradient bar */}
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="p-8">
          {/* Welcome header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/30 mb-4">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Flowdesk</span>!
            </h1>
            <p className="text-xs text-[#5a6070] mt-1">
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
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 font-medium">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#1e2240]">
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#8892b0] hover:text-white hover:bg-[#1e2035] transition-all disabled:opacity-50"
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
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  canNext
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
                    : "bg-[#1e2035] text-[#3a4060] cursor-not-allowed"
                }`}
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canNext || saving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  canNext && !saving
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105"
                    : "bg-[#1e2035] text-[#3a4060] cursor-not-allowed"
                }`}
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
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
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2e3050; border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4a5080; }
      `}</style>
    </div>
  );
}
