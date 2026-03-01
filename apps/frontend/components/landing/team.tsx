import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export function Team() {
    const t = useTranslations("landing.team");
    return (
        <section className="bg-[#050505] py-24 px-6 md:px-12 border-t border-[#262626]">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{t("title")}</h2>
                    <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                        {t("subtitle")}
                    </p>

                    <ul className="space-y-4">
                        {[
                            t("feature1"),
                            t("feature2"),
                            t("feature3")
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-3 text-gray-300">
                                <CheckCircle className="w-5 h-5 text-cyan-500 shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Mock UI for Team Activity */}
                <div className="bg-[#111] border border-[#262626] rounded-xl p-6 relative overflow-hidden">
                    {/* Mock Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">JD</div>
                                <span className="text-sm text-gray-200 font-medium">John Doe</span>
                            </div>
                            <span className="text-xs text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded">Screening #402</span>
                        </div>

                        <div className="flex items-center justify-between bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white">SM</div>
                                <span className="text-sm text-gray-200 font-medium">Sarah Miller</span>
                            </div>
                            <span className="text-xs text-purple-400 bg-purple-950/30 px-2 py-1 rounded">Extracting Data</span>
                        </div>

                        <div className="pt-4 border-t border-[#333]">
                            <div className="flex justify-between text-xs text-gray-400 mb-2">
                                <span>{t("overallProgress")}</span>
                                <span>72%</span>
                            </div>
                            <div className="h-2 bg-[#222] rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 w-[72%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
