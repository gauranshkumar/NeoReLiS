"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
    const t = useTranslations("footer");
    return (
        <footer className="flex w-full flex-col items-center justify-center gap-6 bg-transparent py-8 text-sm">
            <div className="flex flex-wrap justify-center gap-8 text-gray-500 dark:text-gray-400">
                <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("privacyPolicy")}</Link>
                <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("termsOfService")}</Link>
                <Link href="/security" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("securityStandards")}</Link>
                <Link href="/help" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("helpCenter")}</Link>
            </div>

            <div className="text-xs text-gray-400 dark:text-gray-500">
                {t("copyright", { year: new Date().getFullYear() })}
            </div>
        </footer>
    );
}
