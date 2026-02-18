import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Search, Plus, User, Filter } from "lucide-react";

export default function ProjectsPage() {
    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0A0A0A] font-sans">
            {/* Top Header matching my-projects.png */}
            <header className="flex h-16 items-center justify-between border-b border-[#262626] bg-[#0A0A0A] px-6">
                <div className="flex items-center gap-4">
                    <div className="bg-cyan-500 rounded p-1">
                        {/* Simple icon proxy */}
                        <div className="w-4 h-4 bg-black"></div>
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">ReLiS</span>
                </div>

                <div className="flex-1 max-w-xl mx-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="w-full bg-[#1A1D21] border border-[#333] rounded-md py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold px-4 py-2 rounded flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Project
                    </button>
                    <div className="w-8 h-8 rounded-full bg-[#D9D9D9] border border-white/10"></div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto p-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-gray-500 text-lg mb-1">Manage, monitor, and execute your systematic literature reviews with precision.</h1>
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-cyan-50 text-cyan-600 px-4 py-1.5 rounded text-sm font-medium border border-cyan-100">All Projects</button>
                        <button className="bg-[#1A1D21] text-gray-400 px-4 py-1.5 rounded text-sm font-medium border border-[#333] hover:text-white">In Progress</button>
                        <button className="bg-[#1A1D21] text-gray-400 px-4 py-1.5 rounded text-sm font-medium border border-[#333] hover:text-white">Completed</button>
                        <button className="bg-[#1A1D21] text-white px-4 py-1.5 rounded text-sm font-medium border border-[#333] flex items-center gap-2">
                            <Filter className="w-3 h-3" /> Filters
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <ProjectCard
                        title="Impact of AI on Clinical Trials"
                        desc="Meta-analysis investigating the efficacy of machine learning models in optimizing phase III recruitment phases."
                        progress={37}
                        screened="450 / 1,200"
                        members={3}
                        label="ACTIVE"
                        labelColor="bg-cyan-500/20 text-cyan-500"
                        image="/project-bg-1.jpg" // Placeholder color used in style
                    />
                    {/* Card 2 */}
                    <ProjectCard
                        title="Genomics Data Analysis Review"
                        desc="Comprehensive review of NGS pipelines for somatic mutation calling in cancer diagnostics."
                        progress={100}
                        screened="890 / 890"
                        members={2}
                        label="COMPLETED"
                        labelColor="bg-green-500/20 text-green-500"
                        image="/project-bg-2.jpg"
                    />
                    {/* Card 3 */}
                    <ProjectCard
                        title="CRISPR Ethics Review 2024"
                        desc="Systematic appraisal of global ethical frameworks governing human germline editing."
                        progress={12}
                        screened="120 / 2,000"
                        members={3}
                        label="SCREENING"
                        labelColor="bg-yellow-500/20 text-yellow-500"
                        image="/project-bg-3.jpg"
                    />
                    {/* Card 4 - Neuroimaging */}
                    <ProjectCard
                        title="Neuroimaging in Alzheimer's"
                        desc="Evaluating the diagnostic utility of tau-PET vs CSF biomarkers in early detection."
                        progress={5}
                        screened="0 / 4,500"
                        members={1}
                        label="PLANNING"
                        labelColor="bg-blue-500/20 text-blue-500"
                        image="/project-bg-4.jpg"
                    />

                    {/* New Project Card */}
                    <div className="border-2 border-dashed border-[#333] rounded-xl flex flex-col items-center justify-center p-12 min-h-[320px] bg-[#0A0A0A] hover:bg-[#111] transition-colors cursor-pointer group">
                        <div className="w-16 h-16 rounded-full bg-[#1A1D21] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Plus className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Start New Systematic Review</h3>
                        <p className="text-gray-500 text-center max-w-xs text-sm">
                            Protocol design, paper ingestion, and screening workflows await.
                        </p>
                    </div>
                </div>

                <div className="mt-16 border-t border-[#262626] pt-8 flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <div className="flex gap-8">
                        <span>TOTAL REVIEWS</span>
                        <span>PAPERS ANALYZED</span>
                        <span>ACTIVE COLLABS</span>
                    </div>
                    <div className="flex gap-4 normal-case font-normal text-xs text-gray-500">
                        <span>Documentation</span>
                        <span>•</span>
                        <span>Protocol Wizard</span>
                        <span>•</span>
                        <span>API Access</span>
                    </div>
                </div>
            </main>
        </div>
    );
}

function ProjectCard({ title, desc, progress, screened, members, label, labelColor, image }: any) {
    return (
        <div className="rounded-xl overflow-hidden bg-[#D9D9D9] relative group h-[340px] flex flex-col justify-end">
            {/* Background Image Placeholder simulation */}
            <div className="absolute inset-0 bg-gray-600 group-hover:scale-105 transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#8E9093] via-[#8E9093]/80 to-transparent"></div>

            <div className="absolute top-4 right-4">
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${labelColor} backdrop-blur-md`}>{label}</span>
            </div>

            <div className="relative p-6 z-10 text-white">
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-xs text-white/80 mb-6 line-clamp-2">{desc}</p>

                <div className="mb-4">
                    <div className="flex justify-between text-[10px] font-bold uppercase mb-1 text-white/70">
                        <span>{progress === 100 ? "ARCHIVED" : "OVERALL PROGRESS"}</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-[10px] font-bold uppercase text-white/60 mb-1">PAPERS SCREENED</div>
                        <div className="text-sm font-bold flex items-center gap-1">
                            {/* Icon placeholder */}
                            <span>📄 {screened}</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase text-white/60 mb-1">TEAM MEMBERS</div>
                        <div className="flex -space-x-2">
                            {[...Array(Math.min(members, 3))].map((_, i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-gray-300 border border-white"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
