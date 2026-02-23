"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { useAuth } from "@/lib/hooks/use-auth";
import { Loader2, MailCheck } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, resendVerificationCode } = useAuth();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsVerifying(true);

    const trimmedCode = code.trim();
    const result = await verifyEmail(email.trim(), trimmedCode);

    if (result.success) {
      router.push("/dashboard");
      return;
    }

    setError(result.error || "Email verification failed");
    setIsVerifying(false);
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setIsResending(true);

    const result = await resendVerificationCode(email.trim());
    if (result.success) {
      setMessage("A new verification code has been sent. It expires in 30 minutes.");
    } else {
      setError(result.error || "Failed to resend verification code");
    }

    setIsResending(false);
  };

  return (
    <AuthLayout mode="login">
      <div className="w-full max-w-md bg-[#0F1115] border border-[#262626] rounded-xl shadow-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]" />

        <div className="flex flex-col items-center mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-900/30 bg-cyan-950/20 px-3 py-1 text-xs font-medium text-cyan-400 mb-4">
            <MailCheck className="w-3 h-3" /> EMAIL VERIFICATION
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Verify your email</h1>
          <p className="text-gray-400 text-sm mt-2">
            Enter the 6-digit code sent to your email. The code is valid for 30 minutes.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@institution.edu"
              required
              className="w-full bg-[#1A1D21] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300" htmlFor="code">
              Verification code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              required
              className="w-full bg-[#1A1D21] border border-[#333] rounded-lg px-4 py-2.5 text-sm tracking-[0.3em] text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying || code.trim().length !== 6 || email.trim().length === 0}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-700 disabled:cursor-not-allowed text-black font-semibold rounded-lg py-2.5 transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || email.trim().length === 0}
          className="w-full mt-3 bg-transparent border border-[#333] hover:bg-[#1A1D21] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2.5 transition-colors flex items-center justify-center gap-2"
        >
          {isResending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resending...
            </>
          ) : (
            "Resend code"
          )}
        </button>

        <p className="text-gray-500 text-sm text-center mt-6">
          Back to{" "}
          <Link href="/login" className="text-cyan-500 hover:text-cyan-400 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
