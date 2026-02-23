import Link from 'next/link';
import { Microscope, ArrowLeft } from 'lucide-react';
import { LandingFooter } from "@/components/landing/footer";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
            <main className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-12 relative overflow-hidden">
                {/* Background Decorative Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full -z-10" />

                {/* Microscope Icon Section */}
                <div className="relative mb-12">
                    <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border border-cyan-500/20 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/30 animate-[spin_30s_linear_infinite]" />
                        <div className="relative">
                            <Microscope className="w-20 h-20 md:w-28 md:h-28 text-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                            <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 border-4 border-[#0A0A0A] shadow-lg shadow-red-500/20">
                                <div className="bg-black rounded-full text-white p-0.5">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </div>
                            </div>
                        </div>
                        {/* Pulsing particles */}
                        <div className="absolute top-4 left-4 w-2 h-2 bg-cyan-500/40 rounded-full blur-[2px] animate-pulse" />
                        <div className="absolute bottom-10 right-2 w-1.5 h-1.5 bg-cyan-500/30 rounded-full blur-[1px] animate-pulse delay-700" />
                        <div className="absolute top-1/4 -right-2 w-2.5 h-2.5 bg-cyan-500/20 rounded-full blur-[3px] animate-pulse delay-1000" />
                    </div>
                </div>

                {/* 404 Text */}
                <div className="relative">
                    <h1 className="text-8xl md:text-[12rem] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-500/20">
                        404
                    </h1>
                    <div className="absolute inset-0 blur-[60px] bg-cyan-500/10 -z-10 scale-150" />
                </div>

                {/* Content */}
                <div className="text-center max-w-2xl mx-auto space-y-6 mb-12">
                    <h2 className="text-3xl md:text-5xl font-semibold text-gray-200">Observation Failed</h2>
                    <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
                        This research path leads nowhere. The data point you are looking for has been moved, archived, or never existed in this coordinate.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-xl shadow-cyan-500/20"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Return to Dashboard
                        </Link>
                        <Link
                            href="/support"
                            className="text-gray-400 hover:text-white font-medium transition-colors"
                        >
                            Report Data Error
                        </Link>
                    </div>
                </div>

                {/* Metadata Footer */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-24 text-center">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Sequence ID</p>
                        <p className="text-xs font-mono text-cyan-500/60 transition-colors hover:text-cyan-500">NULL_REF_0x7E2</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Status</p>
                        <p className="text-xs font-mono text-red-500/60 uppercase transition-colors hover:text-red-500">Undefined_Variable</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Location</p>
                        <p className="text-xs font-mono text-cyan-500/60 uppercase transition-colors hover:text-cyan-500">Hidden_Sector</p>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
