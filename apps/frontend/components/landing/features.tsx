import { Filter, Users, Database, ShieldCheck } from "lucide-react";

export function Features() {
    const features = [
        {
            icon: <Filter className="w-6 h-6 text-cyan-500" />,
            title: "Automated Screening",
            description: "Our proprietary Large Language Models filter thousands of papers in seconds based on your inclusion and exclusion criteria with near-human accuracy."
        },
        {
            icon: <Users className="w-6 h-6 text-cyan-500" />,
            title: "Real-time Sync",
            description: "A multiplayer workspace for teams to collaborate on screening and synthesis. See progress as it happens."
        },
        {
            icon: <Database className="w-6 h-6 text-cyan-500" />,
            title: "Precision Extraction",
            description: "Automated table generation directly from PDF data points. Export clean CSVs and JSON ready for analysis."
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-cyan-500" />,
            title: "Full Audit Trail",
            description: "Complete transparency for PRISMA reporting. Every AI decision is cited and reversible."
        }
    ];

    return (
        <section className="bg-[#0A0A0A] py-24 px-6 md:px-12" id="features">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">The Core Trio of Precision</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        ReLiS automates the tedious parts of systematic reviews so you can focus on the breakthrough science.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="bg-[#111] border border-[#262626] p-8 rounded-xl hover:border-cyan-500/50 transition-colors group">
                            <div className="bg-[#1a1a1a] w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-cyan-500/10 transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                    {/* If there are 4 items and sticking to "Trio", maybe the 4th is different or omitted. I'll include it as a separate full-width card or consistent card. */}
                    <div className="bg-[#111] border border-[#262626] p-8 rounded-xl hover:border-cyan-500/50 transition-colors group md:col-span-2 lg:col-span-1 lg:col-start-2 xl:col-auto">
                        <div className="bg-[#1a1a1a] w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-cyan-500/10 transition-colors">
                            {features[3].icon}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{features[3].title}</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            {features[3].description}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
