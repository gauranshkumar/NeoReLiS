import { getTranslations } from "next-intl/server";

export default async function DemoUserPage() {
    const t = await getTranslations("demo");
    return (
        <div className="flex min-h-screen items-center justify-center">
            <h1 className="text-2xl font-bold">{t("title")}</h1>
        </div>
    );
}
