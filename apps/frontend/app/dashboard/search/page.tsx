import { Search, Filter, BookOpen, Users, FileText, ChevronRight, Share2, Bell, Bookmark, MoreHorizontal } from "lucide-react";

export default function GlobalSearchPage() {
    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Search className="w-5 h-5 text-cyan-500" />
                    <h1 className="text-lg font-medium text-white">Machine Learning in Genomics</h1>
                    <span className="ml-auto text-xs text-gray-500 bg-[#1A1D21] px-2 py-1 rounded border border-[#333]">CMD + K</span>
                </div>

                {/* Filters Bar */}
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#262626]">
                    <button className="bg-cyan-500 rounded px-3 py-1.5 text-xs font-bold text-black flex items-center gap-2">
                        All Time <ChevronRight className="w-3 h-3 rotate-90" />
                    </button>
                    <button className="bg-[#1A1D21] border border-[#333] rounded px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white flex items-center gap-2">
                        <BookOpen className="w-3 h-3" /> Journal <ChevronRight className="w-3 h-3 rotate-90" />
                    </button>
                    <button className="bg-[#1A1D21] border border-[#333] rounded px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white flex items-center gap-2">
                        <Users className="w-3 h-3" /> Author <ChevronRight className="w-3 h-3 rotate-90" />
                    </button>
                    <button className="bg-[#1A1D21] border border-[#333] rounded px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white flex items-center gap-2">
                        DOI
                    </button>
                    <span className="ml-auto text-xs text-gray-500">8,245 results found</span>
                </div>

                {/* Results List */}
                <div className="space-y-4">
                    <SearchResult
                        journal="NATURE GENETICS"
                        year="2023"
                        doi="10.1038/s41588-023-01452-1"
                        title="Deep Learning for Genomic Discovery: A Comprehensive Review of Emerging Architectures"
                        snippet="Genomic sequencing has reached an unprecedented scale, necessitating the development of novel deep learning..."
                        authors="A. Chen, M. Rodriguez, +4 others"
                        citations="1,245"
                        impact="9.8"
                        image="/dna-helix.jpg" // Placeholder logic in component
                    />
                    <SearchResult
                        journal="BIOINFORMATICS JOURNAL"
                        year="2022"
                        doi="10.1101/2022.05.08"
                        title="Transformers for Protein Folding: Predicting 3D Structure from Sequence Alone"
                        snippet="The protein folding problem has been revolutionized by attention-based architectures. Here we evaluate the limits of..."
                        authors="L. Schmidt, S. Kim"
                        citations="842"
                        impact="8.4"
                        image="/protein.jpg"
                        color="text-blue-400"
                    />
                    <SearchResult
                        journal="SCIENCE ADVANCES"
                        year="2023"
                        doi="10.1126/sciadv.adf0242"
                        title="Automated Annotation of Genomic Sequences using Recurrent Neural Networks"
                        snippet="Current annotation pipelines often fail to capture long-range dependencies in non-coding regions. We introduce a gated RN..."
                        authors="P. Gupta, T. Müller, K. Sato"
                        citations="215"
                        impact="7.9"
                        image="/neural-grid.jpg"
                        color="text-purple-400"
                    />
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-8 gap-2 pb-8">
                    <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1A1D21] border border-[#333] text-gray-400 hover:text-white"><ChevronRight className="w-4 h-4 rotate-180" /></button>
                    <button className="w-8 h-8 flex items-center justify-center rounded bg-cyan-500 text-black font-bold">1</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded bg-transparent text-gray-400 hover:text-white">2</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded bg-transparent text-gray-400 hover:text-white">3</button>
                    <span className="w-8 h-8 flex items-center justify-center text-gray-500">...</span>
                    <button className="w-8 h-8 flex items-center justify-center rounded bg-transparent text-gray-400 hover:text-white">12</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1A1D21] border border-[#333] text-gray-400 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
                </div>

            </div>

            {/* Right Sidebar */}
            <div className="w-80 border-l border-[#262626] p-6 bg-[#0A0A0A]">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">REFINE RESULTS</h3>

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-white">Publication Date</span>
                        <span className="text-cyan-500 text-xs font-bold">2018-2023</span>
                    </div>
                    <div className="h-1 bg-[#333] rounded-full relative">
                        <div className="absolute left-1/4 right-0 h-full bg-cyan-500 rounded-full"></div>
                        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-cyan-500"></div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-cyan-500"></div>
                    </div>
                </div>

                <div className="mb-8">
                    <span className="text-sm font-bold text-white mb-4 block">Popular Journals</span>
                    <div className="space-y-2">
                        <Checkbox label="Nature Genetics" count="1.2k" checked />
                        <Checkbox label="Bioinformatics" count="842" checked />
                        <Checkbox label="Science Advances" count="612" />
                        <Checkbox label="Genome Biology" count="215" />
                        <button className="text-xs text-cyan-500 font-bold mt-2">View all 48 journals</button>
                    </div>
                </div>

                <div className="mb-8">
                    <span className="text-sm font-bold text-white mb-4 block">Minimum Impact Score</span>
                    <div className="flex gap-2">
                        <div className="bg-[#1A1D21] border border-cyan-500/50 text-cyan-500 text-xs font-bold px-3 py-1.5 rounded cursor-pointer">5.0+</div>
                        <div className="bg-cyan-500 text-black text-xs font-bold px-3 py-1.5 rounded cursor-pointer">7.5+</div>
                        <div className="bg-[#1A1D21] border border-[#333] text-gray-400 text-xs font-bold px-3 py-1.5 rounded hover:text-white cursor-pointer">9.0+</div>
                        <div className="bg-[#1A1D21] border border-[#333] text-gray-400 text-xs font-bold px-3 py-1.5 rounded hover:text-white cursor-pointer">Top</div>
                    </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-[#262626]">
                    <button className="w-full bg-white hover:bg-gray-200 text-black font-bold py-2.5 rounded flex items-center justify-center gap-2 transition-colors">
                        <Bell className="w-4 h-4" /> Set Search Alert
                    </button>
                    <button className="w-full bg-[#1A1D21] border border-[#333] hover:bg-[#222] text-white font-bold py-2.5 rounded flex items-center justify-center gap-2 transition-colors">
                        <Share2 className="w-4 h-4" /> Share Search
                    </button>
                </div>

            </div>
        </div>
    );
}

function SearchResult({ journal, year, doi, title, snippet, authors, citations, impact, image, color }: any) {
    return (
        <div className="bg-[#0F1115] border border-[#262626] rounded-xl p-6 hover:border-cyan-500/20 transition-colors flex gap-6">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 text-xs">
                    <span className={`font-bold px-2 py-0.5 bg-cyan-950/30 text-cyan-400 rounded uppercase tracking-wider ${color === 'text-blue-400' ? 'text-blue-400 bg-blue-950/30' : color === 'text-purple-400' ? 'text-purple-400 bg-purple-950/30' : ''}`}>{journal}</span>
                    <span className="text-gray-500">{year} • DOI: {doi}</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2 leading-tight hover:text-cyan-400 cursor-pointer">{title}</h2>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">{snippet}</p>

                <div className="flex items-center gap-6 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {authors}</span>
                    <span className="flex items-center gap-1.5 font-bold text-cyan-500">❝ {citations} citations</span>
                    <span className="flex items-center gap-1.5 font-bold text-green-400">📊 {impact} Impact</span>
                </div>
            </div>

            <div className="flex flex-col justify-between items-end gap-4 min-w-[160px]">
                {/* Image Placeholder */}
                <div className="w-full h-24 rounded-lg bg-[#1A1D21] border border-[#333] overflow-hidden relative group">
                    <div className={`absolute inset-0 opacity-50 ${color ? color.replace('text-', 'bg-') : 'bg-cyan-500'} mix-blend-overlay`}></div>
                    {/* Simulating image content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border border-white/20 rounded-full"></div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors">
                        <Users className="w-3 h-3" /> Project
                    </button>
                    <button className="p-2 rounded bg-[#1A1D21] border border-[#333] text-gray-400 hover:text-white transition-colors">
                        <Bookmark className="w-3 h-3" />
                    </button>
                    <button className="p-2 rounded bg-[#1A1D21] border border-[#333] text-gray-400 hover:text-white transition-colors">
                        <MoreHorizontal className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    )
}

function Checkbox({ label, count, checked }: any) {
    return (
        <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${checked ? 'bg-cyan-500 border-cyan-500' : 'border-[#333] bg-[#1A1D21] group-hover:border-gray-500'}`}>
                    {checked && <div className="w-2 h-2 bg-black rounded-[1px]"></div>}
                </div>
                <span className={`text-sm ${checked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-300'}`}>{label}</span>
            </div>
            <span className="text-xs text-gray-600 font-mono">{count}</span>
        </div>
    )
}
