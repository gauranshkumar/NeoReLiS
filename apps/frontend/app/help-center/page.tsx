import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { Search, Rocket, ListChecks, Database, Users, MessageCircle } from "lucide-react";
import Link from "next/link";

function HelpHeader() {
    return (
        <div className="w-full bg-[#0A0A0A] py-16 flex flex-col items-center justify-center text-center px-6">
            <div className="relative w-full max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search for articles, guides, or FAQs..."
                    className="w-full bg-[#1A1D21] text-white border border-[#333] rounded-lg py-4 pl-12 pr-4 shadow-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
                <span className="font-bold text-gray-500 uppercase text-xs tracking-wide">POPULAR:</span>
                <Link href="#" className="text-cyan-500 hover:underline">SSO Setup</Link>
                <span className="text-gray-600">•</span>
                <Link href="#" className="text-cyan-500 hover:underline">Importing BibTeX</Link>
                <span className="text-gray-600">•</span>
                <Link href="#" className="text-cyan-500 hover:underline">PRISMA Flowcharts</Link>
            </div>
        </div>
    )
}

export default function HelpCenterPage() {
    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-white font-sans text-black">
            <LandingHeader />

            <div className="pt-20"> {/* Add padding for fixed header */}
                <HelpHeader />

                <main className="max-w-6xl mx-auto px-6 py-16">
                    <div className="flex justify-end mb-8">
                        <Link href="#" className="text-cyan-600 font-medium hover:underline text-sm flex items-center gap-1">
                            View all guides →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                        <HelpCard
                            icon={<Rocket className="w-6 h-6 text-cyan-500" />}
                            title="Getting Started"
                            desc="Account setup, project creation, and team onboarding to get your research moving."
                            links={["Creating your first project", "Inviting team members"]}
                        />
                        <HelpCard
                            icon={<ListChecks className="w-6 h-6 text-cyan-500" />}
                            title="Screening Workflow"
                            desc="Title/Abstract screening, full-text review, and efficiently resolving conflicts."
                            links={["Screening inclusion criteria", "Conflict resolution guide"]}
                        />
                        <HelpCard
                            icon={<Database className="w-6 h-6 text-cyan-500" />}
                            title="Data Extraction"
                            desc="Customizing forms, exporting data, and performing quality assessment."
                            links={["Form builder basics", "Exporting to Excel/CSV"]}
                        />
                        <HelpCard
                            icon={<Users className="w-6 h-6 text-cyan-500" />}
                            title="Collaborating"
                            desc="Managing permissions, shared comments, and real-time updates across your lab."
                            links={["Role-based access control", "Shared internal annotations"]}
                        />
                    </div>

                    <div className="border-t border-gray-200 pt-16 pb-16">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Automating Deduplication</h3>
                                <p className="text-sm text-gray-500">Learn how ReLiS handles duplicate records across multiple databases automatically.</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Setting up PRISMA 2020</h3>
                                <p className="text-sm text-gray-500">A step-by-step guide to generating compliant PRISMA flow diagrams for publication.</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Bulk Import from Zotero</h3>
                                <p className="text-sm text-gray-500">Directly sync your reference library with our new browser extension and API integration.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#415058] rounded-2xl p-16 text-center text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="w-12 h-12 mx-auto bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 mb-6">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
                            <p className="text-gray-300 max-w-lg mx-auto mb-8">
                                Our support team is available 24/5 to help you with your systematic review workflow and technical questions.
                            </p>
                            <button className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-8 rounded-md transition-colors">
                                Contact Support
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
