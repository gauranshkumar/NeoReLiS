import { Search, Filter, ArrowUp, Grid, List, Bell, User, Plus, FileText, Bookmark, MessageSquare, Check, X } from "lucide-react";

export default function LibraryPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Library Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#262626]">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <span className="hover:text-white cursor-pointer">Home</span>
                        <span className="text-gray-600">›</span>
                        <span className="text-white font-medium">Library</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Thesis Research</h1>
                    <p className="text-sm text-gray-500 mt-1">128 Papers stored in this collection</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search papers, authors, or citations..."
                            className="w-full bg-[#1A1D21] border border-[#333] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500"
                        />
                    </div>
                    <button className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
                        <ArrowUp className="w-4 h-4" /> Bulk Import
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0A0A0A]"></span>
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold border border-[#333]">
                        <User className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="px-6 py-4 flex justify-end gap-3 border-b border-[#262626] bg-[#0F1115]">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1D21] border border-[#333] rounded text-xs font-bold text-gray-400 hover:text-white">
                    <Filter className="w-3 h-3" /> Filter
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1D21] border border-[#333] rounded text-xs font-bold text-gray-400 hover:text-white">
                    <List className="w-3 h-3" /> Sort by Year
                </button>
                <div className="flex bg-[#1A1D21] rounded border border-[#333] p-0.5">
                    <button className="p-1.5 rounded bg-[#262626] text-cyan-500"><Grid className="w-4 h-4" /></button>
                    <button className="p-1.5 rounded hover:bg-[#262626] text-gray-500 hover:text-white"><List className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 p-6 overflow-y-auto bg-[#0A0A0A]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <PaperCard
                        status="INCLUDED" statusColor="bg-green-500/20 text-green-500"
                        title="Neural Network Architectures for Advanced..."
                        meta="Chen, L. et al • 2023 • Nature Genetics"
                        added="2d ago"
                        bg="bg-gradient-to-br from-slate-800 to-slate-900"
                    />
                    <PaperCard
                        status="TO READ" statusColor="bg-yellow-500/20 text-yellow-500"
                        title="Quantum Supremacy in High-Performance..."
                        meta="Williams, R. • 2024 • Science Robotics"
                        added="5d ago"
                        bg="bg-gradient-to-br from-cyan-900/40 to-blue-900/40"
                    />
                    <PaperCard
                        status="EXCLUDED" statusColor="bg-red-500/20 text-red-500"
                        title="Methods for Large-Scale Data Visualization in Soci..."
                        meta="Garcia, M. • 2021 • IEEE Xplore"
                        added="1w ago"
                        bg="bg-gradient-to-br from-emerald-900/40 to-teal-900/40"
                    />
                    <PaperCard
                        status="INCLUDED" statusColor="bg-green-500/20 text-green-500"
                        title="The Impact of Climate Variability on Global Crop..."
                        meta="Sato, H. et al • 2022 • Environmental Science"
                        added="2w ago"
                        bg="bg-[#1A1D21]" // Simplified
                    />

                    {/* Add New Card */}
                    <div className="border-2 border-dashed border-[#333] rounded-xl flex flex-col items-center justify-center p-8 bg-[#0F1115] hover:bg-[#1A1D21] transition-colors cursor-pointer group min-h-[320px]">
                        <div className="w-12 h-12 rounded-full bg-[#1A1D21] border border-[#333] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-gray-500 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-bold text-white mb-1">Drop PDF here</span>
                        <span className="text-xs text-gray-500">or click to browse</span>
                    </div>
                </div>

                <div className="mt-8 flex justify-between items-center text-xs text-gray-500 border-t border-[#262626] pt-4">
                    <span>Showing 1-12 of 128 results</span>
                    <div className="flex gap-1">
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1A1D21] border border-[#333] hover:text-white">‹</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-cyan-500 text-black font-bold">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#1A1D21] hover:text-white">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#1A1D21] hover:text-white">3</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1A1D21] border border-[#333] hover:text-white">›</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PaperCard({ status, statusColor, title, meta, added, bg }: any) {
    return (
        <div className="bg-[#0F1115] border border-[#262626] rounded-xl overflow-hidden hover:border-cyan-500/30 transition-colors group flex flex-col h-[320px]">
            {/* Visual Header */}
            <div className={`h-40 ${bg} relative p-4`}>
                <span className={`text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md ${statusColor}`}>{status}</span>
                {/* Abstract visual elements */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-tl-full"></div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-base font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-cyan-400 transition-colors">{title}</h3>
                    <p className="text-xs text-gray-400 mb-4">{meta}</p>
                </div>

                <div className="flex justify-between items-end border-t border-[#262626] pt-4">
                    <div className="flex gap-2">
                        <FileText className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer" />
                        <Bookmark className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer" />
                        {/* Comment icon proxy */}
                        <MessageSquare className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer" />
                    </div>
                    <span className="text-[10px] text-gray-600 font-mono">Added {added}</span>
                </div>
            </div>
        </div>
    )
}
