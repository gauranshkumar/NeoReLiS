import Link from "next/link";
import { Logo } from "@/components/ui/logo";

interface HeaderProps {
    mode?: "login" | "signup";
}

export function Header({ mode = "login" }: HeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#262626] bg-[#0A0A0A] px-6">
            <div className="flex items-center gap-2">
                <Logo />
            </div>

            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                    {mode === "login" ? "Need an account?" : "Already have an account?"}
                </span>
                <Link
                    href={mode === "login" ? "/signup" : "/login"}
                    className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-cyan-400"
                >
                    {mode === "login" ? "Create Account" : "Sign In"}
                </Link>
            </div>
        </header>
    );
}
