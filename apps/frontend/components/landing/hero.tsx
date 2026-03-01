import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function Hero() {
    const t = useTranslations("landing.hero");
    return (
        <section className="relative pt-32 pb-20 px-6 md:px-12 flex flex-col items-center text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-950/30 px-3 py-1 text-xs font-medium text-cyan-400">
                <span className="mr-2 h-2 w-2 rounded-full bg-cyan-500"></span>
                {t("badge")}
            </div>

            <h1 className="max-w-4xl text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
                {t("titleLine1")} <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">{t("titleLine2")}</span>
            </h1>

            <p className="max-w-2xl text-lg text-gray-400 mb-10 leading-relaxed">
                {t("subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-20">
                <Link
                    href="/signup"
                    className="rounded-md bg-cyan-500 px-8 py-3 text-base font-semibold text-black transition-all hover:bg-cyan-400 hover:scale-105"
                >
                    {t("ctaPrimary")}
                </Link>
                <Link
                    href="/demo"
                    className="rounded-md border border-[#333] bg-[#1a1a1a] px-8 py-3 text-base font-semibold text-white transition-all hover:bg-[#262626] hover:border-gray-600"
                >
                    {t("ctaSecondary")}
                </Link>
            </div>

            {/* Hero Image / Dashboard Preview */}
            <div className="relative w-full max-w-6xl aspect-video rounded-xl overflow-hidden border border-[#262626] shadow-2xl shadow-cyan-900/20">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-10 pointer-events-none"></div>
                <Image
                    src="/hero-dashboard.png"
                    alt={t("dashboardPreviewAlt")}
                    fill
                    className="object-cover object-top"
                    priority
                />
                <div className="absolute top-4 left-4 flex gap-2 z-20">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="absolute top-4 left-0 right-0 flex justify-center z-20">
                    <div className="bg-black/50 px-3 py-1 rounded-full text-[10px] text-gray-500 font-mono border border-white/5">
                        app.relis.ai/project/oncology-meta-analysis
                    </div>
                </div>
            </div>
        </section>
    );
}
