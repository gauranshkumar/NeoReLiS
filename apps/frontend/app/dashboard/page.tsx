import { FileText, Database, Users, TrendingUp, MoreHorizontal, Bookmark, Sparkles } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Content Column */}
            <div className="xl:col-span-3 space-y-8">

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        icon={<FileText className="w-5 h-5 text-cyan-500" />}
                        value="1,240"
                        label="PAPERS SCREENED"
                        Badge={<span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded">+12.5%</span>}
                    />
                    <MetricCard
                        icon={<Database className="w-5 h-5 text-cyan-500" />}
                        value="450"
                        label="DATA POINTS EXTRACTED"
                        Badge={<span className="bg-[#222] text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded border border-[#333]">STABLE</span>}
                    />
                    <MetricCard
                        icon={<Users className="w-5 h-5 text-cyan-500" />}
                        value="12"
                        label="COLLABORATORS"
                        Badge={<span className="bg-cyan-500/10 text-cyan-500 text-[10px] font-bold px-2 py-0.5 rounded">ACTIVE</span>}
                    />
                    <MetricCard
                        icon={<TrendingUp className="w-5 h-5 text-cyan-500" />}
                        value="89.2%"
                        label="INTER-RATER RELIABILITY"
                        Badge={<span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded">HIGH</span>}
                    />
                </div>

                {/* Active Reviews */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-white">Active Reviews</h2>
                            <span className="bg-[#1A1D21] text-cyan-500 text-xs font-bold px-2 py-0.5 rounded border border-cyan-900/30">4 TOTAL</span>
                        </div>
                        <button className="text-sm text-gray-400 hover:text-white flex items-center gap-1">View all <span className="text-xs">›</span></button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ReviewCard
                            title="AI in Radiology: Systematic Mapping"
                            desc="Comparative analysis of DL algorithms in chest imaging"
                            time="2h ago"
                            members="4 members"
                            progress={65}
                            phase="SYNTHESIS"
                            active
                        />
                        <ReviewCard
                            title="Telemedicine Efficacy Post-2020"
                            desc="Review of remote patient outcomes in rural settings"
                            time="1d ago"
                            members="2 members"
                            progress={22}
                            phase="SCREENING"
                        />
                    </div>
                </div>

                {/* Recent Discoveries */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Recent Discoveries</h2>
                        <div className="flex gap-2">
                            <button className="bg-[#1A1D21] border border-[#333] text-gray-400 text-[10px] font-bold px-2 py-1 rounded hover:text-white">ALL SOURCES</button>
                            <button className="bg-[#1A1D21] border border-[#333] text-gray-400 text-[10px] font-bold px-2 py-1 rounded hover:text-white">PUBMED</button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <DiscoveryCard
                            impact="42"
                            title="Impact of AI on Clinical Trials for Rare Diseases"
                            desc="A comprehensive review of patient recruitment methodologies using natural language processing over EHR records..."
                            meta="JAMA Oncology • 2024"
                            doi="10.1038/s41591"
                            tags={["HIGH RELEVANCE"]}
                        />
                        <DiscoveryCard
                            impact="28"
                            title="Deep Learning in Genomics: A 5-Year Retrospective"
                            desc="Analyzing the shift from convolutional neural networks to transformer architecture in sequence mapping tasks..."
                            meta="Nature Methods • 2024"
                            doi="10.1126/science"
                            tags={["PEER REVIEWED"]}
                        />
                    </div>
                </div>

            </div>

            {/* Right Sidebar Column */}
            <div className="space-y-8">
                {/* Team Activity */}
                <div className="bg-[#0F1115] border border-[#262626] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">TEAM ACTIVITY</h3>
                        <MoreHorizontal className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white" />
                    </div>
                    <div className="space-y-6">
                        <ActivityItem
                            user="JD" bg="bg-blue-500"
                            name="John Doe"
                            action="screened 45 papers"
                            time="14 minutes ago"
                        />
                        <ActivityItem
                            user="MK" bg="bg-yellow-600"
                            name="Maria K."
                            action="resolved a conflict in Study #882"
                            time="1 hour ago"
                        />
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-transparent border border-[#333] flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white leading-tight">System updated search protocol v2.4</p>
                                <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-6 bg-[#1A1D21] border border-[#333] text-gray-400 text-xs font-bold py-2 rounded hover:bg-[#222] hover:text-white transition-colors">
                        VIEW AUDIT LOG
                    </button>
                </div>

                {/* AI Insights */}
                <div className="bg-gradient-to-b from-[#0F1520] to-[#0F1115] border border-cyan-900/30 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-2xl rounded-full pointer-events-none"></div>
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-sm font-bold text-cyan-400">AI Insights</h3>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed italic">
                        "Based on your current screening pattern in 'AI in Radiology', I recommend including 'Transformer Models' in your search criteria."
                    </p>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ icon, value, label, Badge }: any) {
    return (
        <div className="bg-[#0F1115] border border-[#262626] rounded-xl p-5 hover:border-[#444] transition-colors group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-[#1A1D21] rounded-lg group-hover:bg-cyan-900/20 transition-colors">
                    {icon}
                </div>
                {Badge}
            </div>
            <div>
                <div className="text-2xl font-bold text-white mb-1">{value}</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</div>
            </div>
        </div>
    )
}

function ReviewCard({ title, desc, time, members, progress, phase, active }: any) {
    return (
        <div className="bg-[#0F1115] border border-[#262626] rounded-xl p-6 hover:border-cyan-500/50 transition-colors group flex flex-col justify-between h-full">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">{title}</h3>
                    <div className="p-1.5 bg-[#1A1D21] rounded text-cyan-500">
                        <FileText className="w-4 h-4" />
                    </div>
                </div>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2 min-h-[40px]">{desc}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                    <span className="flex items-center gap-1">⏰ {time}</span>
                    <span className="flex items-center gap-1">👤 {members}</span>
                </div>
            </div>

            <div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-2">
                    <span>PHASE: {phase}</span>
                    <span className="text-cyan-500">{progress}%</span>
                </div>
                <div className="h-1 bg-[#222] rounded-full overflow-hidden mb-6">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#0F1115]"></div>
                        <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-[#0F1115]"></div>
                        {active && <div className="w-8 h-8 rounded-full bg-[#1A1D21] border-2 border-[#0F1115] flex items-center justify-center text-[10px] font-bold text-white">+2</div>}
                    </div>
                    <button className="bg-[#1A1D21] hover:bg-[#222] text-white text-xs font-bold px-4 py-2 rounded border border-[#333] transition-colors">
                        RESUME WORKSPACE
                    </button>
                </div>
            </div>
        </div>
    )
}

function DiscoveryCard({ impact, title, desc, meta, doi, tags }: any) {
    return (
        <div className="bg-[#0F1115] border border-[#262626] rounded-xl p-0 overflow-hidden hover:border-[#444] transition-colors flex">
            <div className="w-24 bg-[#0A0A0A] border-r border-[#262626] flex flex-col items-center justify-center p-4">
                <span className="text-[10px] font-bold text-gray-500 uppercase mb-1">IMPACT</span>
                <span className="text-3xl font-bold text-white">{impact}</span>
            </div>
            <div className="flex-1 p-5 relative">
                <Bookmark className="absolute top-5 right-5 w-5 h-5 text-gray-600 hover:text-cyan-500 cursor-pointer" />
                <h3 className="text-base font-bold text-white mb-2 pr-8">{title}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{desc}</p>

                <div className="flex flex-wrap items-center gap-3">
                    {tags.map((tag: string, i: number) => (
                        <span key={i} className="bg-[#1A1D21] text-cyan-500 text-[10px] font-bold px-2 py-1 rounded border border-cyan-900/20">{tag}</span>
                    ))}
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500 font-medium">{meta}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-600 font-mono">DOI: {doi}</span>
                </div>
            </div>
        </div>
    )
}

function ActivityItem({ user, bg, name, action, time }: any) {
    return (
        <div className="flex gap-3">
            <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                {user}
            </div>
            <div>
                <p className="text-sm font-medium text-white leading-tight">
                    <span className="font-bold">{name}</span> {action}
                </p>
                <p className="text-xs text-gray-500 mt-1">{time}</p>
            </div>
        </div>
    )
}
