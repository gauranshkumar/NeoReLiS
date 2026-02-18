import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { LayoutGrid, Search, Layers, Library, Settings, User } from "lucide-react";

export function Sidebar() {
    return (
        <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-[#262626] bg-[#0A0A0A] flex flex-col">
            <div className="flex h-16 items-center border-b border-[#262626] px-6">
                <Logo className="scale-90 origin-left" />
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
                <nav className="space-y-1">
                    <Link href="#" className="flex items-center gap-3 rounded-lg bg-[#1A1D21] px-3 py-2 text-cyan-500 font-medium">
                        <LayoutGrid className="w-5 h-5" />
                        Projects
                    </Link>
                    <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 hover:bg-[#1A1D21] hover:text-white transition-colors">
                        <Search className="w-5 h-5" />
                        Global Search
                    </Link>
                    <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 hover:bg-[#1A1D21] hover:text-white transition-colors">
                        <Layers className="w-5 h-5" />
                        Synthesis
                    </Link>
                    <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 hover:bg-[#1A1D21] hover:text-white transition-colors">
                        <Library className="w-5 h-5" />
                        Library
                    </Link>
                </nav>

                <div>
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Workspace
                    </h3>
                    <nav className="space-y-1">
                        <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 hover:bg-[#1A1D21] hover:text-white transition-colors">
                            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                            Oncology Meta-Analysis
                        </Link>
                        <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 hover:bg-[#1A1D21] hover:text-white transition-colors">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            Neurology Review
                        </Link>
                    </nav>
                </div>
            </div>

            <div className="border-t border-[#262626] p-4">
                <button className="flex items-center w-full gap-3 p-2 rounded-lg hover:bg-[#1A1D21] transition-colors text-left group">
                    <div className="w-8 h-8 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-200">
                        <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white group-hover:text-cyan-400 truncate">Dr. Aris Thorne</p>
                        <p className="text-xs text-gray-500 truncate">Lead Researcher</p>
                    </div>
                    <Settings className="w-4 h-4 text-gray-500 group-hover:text-white" />
                </button>
            </div>
        </aside>
    );
}
