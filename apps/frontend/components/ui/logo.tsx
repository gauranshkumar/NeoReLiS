import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
    return (
        <Link href="/" className={cn("flex items-center gap-2", className)}>
            <div className="relative flex shrink-0 items-center justify-center">
                {/* Simple geometric logo representation based on images: Two interlocking cyan shapes */}
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Cyan Square/Shape 1 */}
                    <rect x="4" y="8" width="12" height="12" className="fill-cyan-500" />
                    {/* Cyan Shape 2 (interlocked or offset) */}
                    <rect x="12" y="14" width="12" height="6" className="fill-cyan-500" />
                    <rect x="12" y="14" width="6" height="12" className="fill-cyan-500" />
                </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">RELIS</span>
        </Link>
    );
}
