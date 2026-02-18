import { Share2, Settings, Download, MoreHorizontal, ChevronDown, ChevronRight, Sliders, Activity } from "lucide-react";

export default function SynthesisPage() {
    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Left Sidebar (Studies List) */}
            <div className="w-80 border-r border-[#262626] bg-[#0A0A0A] flex flex-col">
                <div className="p-4 border-b border-[#262626]">
                    <div className="relative">
                        <input type="text" placeholder="Filter 24 studies..." className="w-full bg-[#1A1D21] border border-[#333] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <Settings className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <StudyItem
                        status="SELECTED"
                        id="#084"
                        title="Chen et al. (2023)"
                        desc="Neuro-plasticity in adolescent cohorts..."
                        progress={100}
                        active
                    />
                    <StudyItem
                        status="EXTRACTED"
                        id="#042"
                        title="Miller & Smith (2022)"
                        desc="Longitudinal study on memory retention..."
                        progress={90}
                        color="text-green-500"
                        progressColor="bg-green-500"
                    />
                    <StudyItem
                        status="IN PROGRESS"
                        id="#112"
                        title="Rodriguez (2021)"
                        desc="Comparative analysis of cognitive styles..."
                        progress={35}
                        color="text-yellow-500"
                        progressColor="bg-yellow-500"
                    />
                    <StudyItem
                        status="PENDING"
                        id="#056"
                        title="Sato et al. (2022)"
                        desc="Impact of environment on focus..."
                        progress={0}
                        color="text-gray-500"
                        progressColor="bg-gray-700"
                    />
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col bg-[#0F1115]">
                {/* Workspace Header */}
                <header className="h-14 border-b border-[#262626] flex items-center justify-between px-6 bg-[#0A0A0A]">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>Project Alpha</span>
                        <ChevronRight className="w-4 h-4" />
                        <span>Meta-Analysis</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-white font-medium">Synthesis Workspace</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-[#1A1D21] rounded p-1">
                            <button className="px-3 py-1 text-xs font-bold text-white bg-[#262626] rounded shadow-sm">Quantitative</button>
                            <button className="px-3 py-1 text-xs font-bold text-gray-400 hover:text-white">Qualitative</button>
                        </div>
                        <button className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors">
                            <Activity className="w-4 h-4" /> Generate Plot
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white transition-colors">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                {/* Statistics Bar */}
                <div className="h-12 border-b border-[#262626] bg-[#0F1115] px-6 flex items-center gap-8 text-sm">
                    <div className="flex flex-col justify-center border-r border-[#262626] pr-8 h-full">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">CURRENT STATISTICS</span>
                        <div className="flex gap-4">
                            <span className="text-gray-400 text-xs">Total N: <strong className="text-white">1,240</strong></span>
                            <span className="text-gray-400 text-xs">I²: <strong className="text-white">42%</strong></span>
                            <span className="text-gray-400 text-xs">P-value: <strong className="text-cyan-400">&lt; 0.001</strong></span>
                        </div>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">MODEL TYPE</span>
                        <button className="flex items-center gap-1 text-xs font-bold text-white hover:text-cyan-400">
                            Random Effects <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {/* Forest Plot Area */}
                <div className="flex-1 p-6 overflow-hidden flex flex-col">
                    <div className="flex-1 bg-[#0A0A0A] border border-[#262626] rounded-xl p-6 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-white">Forest Plot: Cognitive Outcome</h2>
                            <div className="flex gap-2">
                                <button className="flex items-center gap-1 bg-[#1A1D21] border border-[#333] text-gray-400 text-xs font-bold px-2 py-1 rounded hover:text-white">
                                    <Download className="w-3 h-3" /> SVG
                                </button>
                                <button className="flex items-center gap-1 bg-[#1A1D21] border border-[#333] text-gray-400 text-xs font-bold px-2 py-1 rounded hover:text-white">
                                    <Sliders className="w-3 h-3" /> Adjust
                                </button>
                            </div>
                        </div>

                        {/* Mock Forest Plot */}
                        <div className="relative h-[300px] w-full border-t border-[#262626] mt-4 pt-4">
                            {/* Vertical Line for Null Effect */}
                            <div className="absolute top-0 bottom-8 left-[60%] w-px bg-gray-700 border-l border-dashed border-gray-500 opacity-50"></div>
                            <div className="absolute  bottom-0 left-[60%] -translate-x-1/2 text-[10px] text-gray-500">Null</div>
                            <div className="absolute bottom-0 left-0 text-[10px] text-gray-500">Favors Control</div>
                            <div className="absolute bottom-0 right-0 text-[10px] text-gray-500">Favors Intervention</div>

                            {/* Study Lines */}
                            <PlotLine study="Chen (2023)" left="50%" width="20%" point="60%" weight="15.2%" top="10%" />
                            <PlotLine study="Miller (2022)" left="65%" width="15%" point="72%" weight="22.8%" top="30%" />
                            <PlotLine study="Rodriguez (2021)" left="55%" width="12%" point="61%" weight="11.1%" top="50%" />
                            <PlotLine study="Sato (2022)" left="58%" width="25%" point="70%" weight="18.4%" top="70%" />

                            {/* Diamond (RE Model) */}
                            <div className="absolute bottom-16 left-0 right-0 flex items-center">
                                <span className="text-sm font-bold text-white w-1/4">RE Model</span>
                                <div className="flex-1 relative h-8">
                                    {/* Diamond shape using borders */}
                                    <div className="absolute left-[66%] top-1/2 -translate-y-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-b-[10px] border-l-transparent border-r-transparent border-t-cyan-500 border-b-cyan-500 opacity-80 scale-x-150"></div>
                                </div>
                                <span className="text-sm font-bold text-white w-16 text-right">100.0%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Input Panel */}
                <div className="h-64 border-t border-[#262626] bg-[#0A0A0A] p-6 grid grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">EFFECT DATA (CHEN ET AL.)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-gray-500 block mb-1">Mean (Int)</label>
                                <input type="text" value="14.2" className="w-full bg-[#1A1D21] border border-[#333] rounded px-2 py-1.5 text-sm text-white" />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 block mb-1">Mean (Ctrl)</label>
                                <input type="text" value="12.1" className="w-full bg-[#1A1D21] border border-[#333] rounded px-2 py-1.5 text-sm text-white" />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 block mb-1">SD (Int)</label>
                                <input type="text" value="2.4" className="w-full bg-[#1A1D21] border border-[#333] rounded px-2 py-1.5 text-sm text-white" />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 block mb-1">SD (Ctrl)</label>
                                <input type="text" value="2.8" className="w-full bg-[#1A1D21] border border-[#333] rounded px-2 py-1.5 text-sm text-white" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">MODERATORS</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center bg-[#1A1D21] border border-[#333] rounded px-3 py-2 text-xs">
                                <span className="text-gray-400">Age Cohort</span>
                                <span className="font-bold text-white">Adolescent</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#1A1D21] border border-[#333] rounded px-3 py-2 text-xs">
                                <span className="text-gray-400">Geography</span>
                                <span className="font-bold text-white">Global North</span>
                            </div>
                            <button className="w-full border border-dashed border-[#333] rounded px-3 py-2 text-xs text-gray-500 hover:text-white hover:border-gray-500 transition-colors">
                                + Add Moderator
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">SYNTHESIS NOTES</h3>
                        <textarea
                            className="flex-1 bg-[#1A1D21] border border-[#333] rounded p-3 text-xs text-gray-300 resize-none focus:outline-none focus:border-cyan-500"
                            placeholder="Add observations for this study's contribution to the model..."
                        ></textarea>
                        <button className="bg-cyan-500 text-black font-bold text-xs py-2 rounded mt-3 hover:bg-cyan-400 transition-colors">
                            Save Study Synthesis
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StudyItem({ status, id, title, desc, progress, active, color = "text-cyan-500", progressColor = "bg-cyan-500" }: any) {
    return (
        <div className={`p-3 rounded-lg border ${active ? 'bg-[#1A1D21] border-cyan-500/30' : 'bg-transparent border-transparent hover:bg-[#1A1D21]'} transition-colors cursor-pointer group`}>
            <div className="flex justify-between items-center mb-1">
                <span className={`text-[10px] font-bold ${color}`}>{status}</span>
                <span className="text-[10px] text-gray-600 font-mono">ID: {id}</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-0.5 group-hover:text-cyan-400 transition-colors">{title}</h4>
            <p className="text-xs text-gray-500 mb-2 truncate">{desc}</p>
            <div className="h-1 bg-[#333] rounded-full overflow-hidden">
                <div className={`h-full ${progressColor}`} style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    )
}

function PlotLine({ study, left, width, point, weight, top }: any) {
    return (
        <div className="absolute left-0 right-0 flex items-center" style={{ top }}>
            <span className="text-xs text-gray-400 w-1/4 truncate pr-4">{study}</span>
            <div className="flex-1 relative h-4">
                {/* CI Line */}
                <div className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-gray-600" style={{ left, width }}></div>
                {/* Mean Point (Box) */}
                <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-500 transform -translate-x-1/2" style={{ left: point }}></div>
            </div>
            <span className="text-xs text-gray-500 w-16 text-right font-mono">{weight}</span>
        </div>
    )
}
