"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { useAuth } from "@/lib/hooks/use-auth";
import { Lock, Mail, User, Eye, EyeOff, Info, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Generate username from email if not provided
    const finalUsername = username || email.split("@")[0];

    const result = await register({
      email,
      password,
      username: finalUsername,
      name,
    });

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Registration failed");
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout mode="signup">
      <div className="flex flex-col items-center w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-cyan-500">systematic</span> <br /> review
          </h1>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            Join ReLiS to streamline your literature reviews with AI-powered precision.
          </p>
        </div>

        <div className="w-full bg-[#0F1115] border border-[#262626] rounded-xl shadow-2xl p-8 relative overflow-hidden">

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider" htmlFor="fullname">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="fullname"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Jane Doe"
                  required
                  className="w-full bg-[#1A1D21] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider" htmlFor="email">
                Institutional Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  required
                  className="w-full bg-[#1A1D21] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Auto-generated from email"
                  className="w-full bg-[#1A1D21] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full bg-[#1A1D21] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength meter bar */}
              <div className="flex gap-1 h-1 mt-1">
                <div className={`flex-1 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                <div className={`flex-1 rounded-full ${password.length >= 12 ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                <div className={`flex-1 rounded-full ${password.length >= 16 ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                <div className="flex-1 bg-gray-700 rounded-full"></div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-700 disabled:cursor-not-allowed text-black font-bold uppercase tracking-wide rounded-lg py-3 transition-colors mt-4 shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Free Account"
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#333]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0F1115] px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 bg-[#1A1D21] border border-[#333] hover:bg-[#222] text-white rounded-lg py-3 text-sm font-medium transition-colors">
              <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-[10px] text-black font-bold">G</div>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 bg-[#1A1D21] border border-[#333] hover:bg-[#222] text-white rounded-lg py-3 text-sm font-medium transition-colors">
              <div className="w-4 h-4 bg-lime-500 rounded-full flex items-center justify-center text-[8px] text-black font-bold">ID</div>
              ORCID
            </button>
          </div>
        </div>

        <p className="text-gray-500 text-xs mt-8 text-center max-w-xs">
          By creating an account, you agree to our <Link href="#" className="underline hover:text-gray-300">Terms of Service</Link> and <Link href="#" className="underline hover:text-gray-300">Privacy Policy</Link>.
        </p>

        <p className="text-gray-500 text-sm text-center mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-500 hover:text-cyan-400 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
