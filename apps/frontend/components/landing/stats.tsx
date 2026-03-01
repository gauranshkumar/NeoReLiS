import { useTranslations } from "next-intl";

export function Stats() {
    const t = useTranslations("landing.stats");
    const stats = [
        { label: t("papersProcessed"), value: t("papersProcessedValue") },
        { label: t("timeSaved"), value: t("timeSavedValue") },
        { label: t("aiAccuracy"), value: t("aiAccuracyValue") },
        { label: t("institutions"), value: t("institutionsValue") },
    ];

    return (
        <section className="border-y border-[#262626] bg-[#050505] py-16">
            <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {stats.map((stat, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                        <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">{stat.value}</span>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{stat.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
