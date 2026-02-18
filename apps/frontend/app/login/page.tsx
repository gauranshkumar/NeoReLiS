import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function LoginPage() {
    return (
        <AuthLayout mode="login">
            <div className="w-full max-w-md bg-[#0F1115] border border-[#262626] rounded-xl shadow-2xl p-8 relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]"></div>

                <div className="flex flex-col items-center mb-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-900/30 bg-cyan-950/20 px-3 py-1 text-xs font-medium text-cyan-400 mb-4">
                        <Lock className="w-3 h-3" /> ENCRYPTED SESSION
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Sign in to ReLiS</h1>
                    <p className="text-gray-400 text-sm mt-2">Secure research environment for professionals</p>
                </div>

                <form className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300" htmlFor="email">
                            Research Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                id="email"
                                type="email"
                                placeholder="name@institution.edu"
                                className="w-full bg-[#1A1D21] border border-[#333] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-300" htmlFor="password">
                                Password
                            </label>
                            <Link href="#" className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-[#1A1D21] border border-[#333] rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                            />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                <Eye className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg py-2.5 transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                        Sign In
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.66669 12.6667L11.3334 8.00001L6.66669 3.33334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
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
                    <button className="flex items-center justify-center gap-2 bg-[#1A1D21] border border-[#333] hover:bg-[#222] text-white rounded-lg py-2.5 text-sm font-medium transition-colors">
                        {/* Google Icon Proxy */}
                        <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-[10px] text-black font-bold">G</div>
                        Google
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-[#1A1D21] border border-[#333] hover:bg-[#222] text-white rounded-lg py-2.5 text-sm font-medium transition-colors">
                        {/* ORCID Icon Proxy */}
                        <div className="w-4 h-4 bg-lime-500 rounded-full flex items-center justify-center text-[8px] text-black font-bold">ID</div>
                        ORCID
                    </button>
                </div>
            </div>
        </AuthLayout>
    );
}
