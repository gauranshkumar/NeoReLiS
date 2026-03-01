import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Twitter, Linkedin, Github } from "lucide-react";
import { useTranslations } from "next-intl";

export function LandingFooter() {
    const t = useTranslations("landing.footer");
    return (
        <footer className="w-full bg-[#050505] pt-20 pb-10 px-6 md:px-12 border-t border-[#262626]">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                <div className="space-y-6">
                    <Logo />
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                        {t("tagline")}
                    </p>
                </div>

                <div>
                    <h3 className="text-white font-semibold mb-6">{t("product")}</h3>
                    <ul className="space-y-4 text-sm text-gray-400">
                        <li><Link href="#" className="hover:text-cyan-500 transition-colors">{t("screening")}</Link></li>
                        <li><Link href="#" className="hover:text-cyan-500 transition-colors">{t("extraction")}</Link></li>
                        <li><Link href="#" className="hover:text-cyan-500 transition-colors">{t("collaboration")}</Link></li>
                        <li><Link href="#" className="hover:text-cyan-500 transition-colors">{t("apiDocs")}</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-semibold mb-6">{t("company")}</h3>
                    <ul className="space-y-4 text-sm text-gray-400">
                        <li><Link href="#" className="hover:text-cyan-500 transition-colors">{t("about")}</Link></li>
                        <li><Link href="#" className="hover:text-cyan-500 transition-colors">{t("privacy")}</Link></li>
                        <li><Link href="#" className="hover:text-cyan-500 transition-colors">{t("terms")}</Link></li>
                        <li><Link href="#" className="hover:text-cyan-500 transition-colors">{t("contact")}</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-semibold mb-6">{t("stayUpdated")}</h3>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder={t("researcherEmail")}
                            className="bg-[#171717] border border-[#333] rounded px-4 py-2 text-sm text-white w-full focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                        <button className="bg-[#262626] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#333] transition-colors">
                            {t("join")}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-8 border-t border-[#262626] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                <p>{t("copyright", { year: new Date().getFullYear() })}</p>
                <div className="flex items-center gap-6">
                    <Link href="#" className="hover:text-white transition-colors flex items-center gap-2"><Twitter className="w-4 h-4" /> {t("twitterX")}</Link>
                    <Link href="#" className="hover:text-white transition-colors flex items-center gap-2"><Linkedin className="w-4 h-4" /> {t("linkedIn")}</Link>
                    <Link href="#" className="hover:text-white transition-colors flex items-center gap-2"><Github className="w-4 h-4" /> {t("gitHub")}</Link>
                </div>
            </div>
        </footer>
    );
}
