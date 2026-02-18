import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function LandingHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex h-20 w-full items-center justify-between border-b border-[#262626] bg-[#0A0A0A]/80 backdrop-blur-md px-6 md:px-12">
            <div className="flex items-center gap-2">
                <Logo />
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                <Link href="#platform" className="hover:text-white transition-colors">Platform</Link>
                <Link href="#methodology" className="hover:text-white transition-colors">Methodology</Link>
                <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
                <Link href="#resources" className="hover:text-white transition-colors">Resources</Link>
            </nav>

            <div className="flex items-center gap-4">
                <Link
                    href="/login"
                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                    Log In
                </Link>
                <Link
                    href="/signup"
                    className="rounded-md bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-cyan-400"
                >
                    Get Started
                </Link>
            </div>
        </header>
    );
}
