import { LandingFooter } from "@/components/landing/footer";
import { Search, Rocket, ListChecks, Database, Users, MessageCircle } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

async function HelpHeader() {
    const t = await getTranslations("help");
    return (
        <div className="w-full bg-[#0A0A0A] py-16 flex flex-col items-center justify-center text-center px-6">
            <div className="relative w-full max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    className="w-full bg-[#1A1D21] text-white border border-[#333] rounded-lg py-4 pl-12 pr-4 shadow-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
                <span className="font-bold text-gray-500 uppercase text-xs tracking-wide">{t("popular")}</span>
                <Link href="#" className="text-cyan-500 hover:underline">{t("ssoSetup")}</Link>
                <span className="text-gray-600">•</span>
                <Link href="#" className="text-cyan-500 hover:underline">{t("importingBibtex")}</Link>
                <span className="text-gray-600">•</span>
                <Link href="#" className="text-cyan-500 hover:underline">{t("prismaFlowcharts")}</Link>
            </div>
        </div>
    )
}

export default async function HelpCenterPage() {
    const t = await getTranslations("help");
    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-white font-sans text-black">
            <div className="pt-20"> {/* Add padding for fixed header */}
                <HelpHeader />

                <main className="max-w-6xl mx-auto px-6 py-16">
                    <div className="flex justify-end mb-8">
                        <Link href="#" className="text-cyan-600 font-medium hover:underline text-sm flex items-center gap-1">
                            {t("viewAllGuides")}
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                        <HelpCard
                            icon={<Rocket className="w-6 h-6 text-cyan-500" />}
                            title={t("gettingStarted")}
                            desc={t("gettingStartedDesc")}
                            links={[t("creatingFirstProject"), t("invitingTeamMembers")]}
                        />
                        <HelpCard
                            icon={<ListChecks className="w-6 h-6 text-cyan-500" />}
                            title={t("screeningWorkflow")}
                            desc={t("screeningWorkflowDesc")}
                            links={[t("screeningInclusionCriteria"), t("conflictResolutionGuide")]}
                        />
                        <HelpCard
                            icon={<Database className="w-6 h-6 text-cyan-500" />}
                            title={t("dataExtraction")}
                            desc={t("dataExtractionDesc")}
                            links={[t("formBuilderBasics"), t("exportingToExcelCsv")]}
                        />
                        <HelpCard
                            icon={<Users className="w-6 h-6 text-cyan-500" />}
                            title={t("collaborating")}
                            desc={t("collaboratingDesc")}
                            links={[t("roleBasedAccessControl"), t("sharedInternalAnnotations")]}
                        />
                    </div>

                    <div className="border-t border-gray-200 pt-16 pb-16">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">{t("automatingDeduplication")}</h3>
                                <p className="text-sm text-gray-500">{t("automatingDeduplicationDesc")}</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">{t("settingUpPrisma")}</h3>
                                <p className="text-sm text-gray-500">{t("settingUpPrismaDesc")}</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">{t("bulkImportFromZotero")}</h3>
                                <p className="text-sm text-gray-500">{t("bulkImportFromZoteroDesc")}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#415058] rounded-2xl p-16 text-center text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="w-12 h-12 mx-auto bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 mb-6">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4">{t("cantFindTitle")}</h2>
                            <p className="text-gray-300 max-w-lg mx-auto mb-8">
                                {t("cantFindDesc")}
                            </p>
                            <button className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-8 rounded-md transition-colors">
                                {t("contactSupport")}
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            <LandingFooter />
        </div>
    );
}

function HelpCard({ icon, title, desc, links }: any) {
    return (
        <div className="bg-[#1A2328] rounded-xl p-8 hover:shadow-lg transition-shadow border border-transparent hover:border-cyan-900/30">
            <div className="flex gap-4 mb-4">
                <div className="w-12 h-12 bg-[#202E36] rounded-lg flex items-center justify-center shrink-0">
                    {icon}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">{desc}</p>
                    <ul className="space-y-2">
                        {links.map((link: string, i: number) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-cyan-500 hover:text-cyan-400 cursor-pointer">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                                {link}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}
