import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Twitter, Linkedin, Github } from "lucide-react";

export function LandingFooter() {
    return (
        <footer className="w-full bg-[#050505] pt-20 pb-10 px-6 md:px-12 border-t border-[#262626]">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                <div className="space-y-6">
                    <Logo />
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                        The next-generation platform for systematic reviews, meta-analyses, and living evidence synthesis.
                    </p>
                </div>

                <div>
                    <h3 className="text-white font-semibold mb-6">Product</h3>
                    <ul className="space-y-4 text-sm text-gray-400">
                        <li><Link href="#" className="hover:text-cyan-500 transition-colors">Screening</Link></li>
                        <li><Link href="#" className="hover:text-cyan-500 transition-colors">Extraction</Link></li>
                        <li><Link href="#" className="hover:text-cyan-500 transition-colors">Collaboration</Link></li>
                        <li><Link href="#" className="hover:text-cyan-500 transition-colors">API Docs</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-semibold mb-6">Company</h3>
                    <ul className="space-y-4 text-sm text-gray-400">
                        <li><Link href="#" className="hover:text-cyan-500 transition-colors">About</Link></li>
                        <li><Link href="#" className="hover:text-cyan-500 transition-colors">Privacy</Link></li>
                        <li><Link href="#" className="hover:text-cyan-500 transition-colors">Terms</Link></li>
                        <li><Link href="#" className="hover:text-cyan-500 transition-colors">Contact</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-semibold mb-6">Stay Updated</h3>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Researcher email"
                            className="bg-[#171717] border border-[#333] rounded px-4 py-2 text-sm text-white w-full focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                        <button className="bg-[#262626] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#333] transition-colors">
                            Join
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-8 border-t border-[#262626] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                <p>© 2024 ReLiS AI Inc. All rights reserved.</p>
                <div className="flex items-center gap-6">
                    <Link href="#" className="hover:text-white transition-colors flex items-center gap-2"><Twitter className="w-4 h-4" /> Twitter / X</Link>
                    <Link href="#" className="hover:text-white transition-colors flex items-center gap-2"><Linkedin className="w-4 h-4" /> LinkedIn</Link>
                    <Link href="#" className="hover:text-white transition-colors flex items-center gap-2"><Github className="w-4 h-4" /> GitHub</Link>
                </div>
            </div>
        </footer>
    );
}
