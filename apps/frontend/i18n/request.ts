import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale, locales, type Locale } from "./config";

export default getRequestConfig(async () => {
  // 1. Check NEXT_LOCALE cookie
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value as
    | Locale
    | undefined;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return {
      locale: cookieLocale,
      messages: (await import(`./messages/${cookieLocale}.json`)).default,
    };
  }

  // 2. Check Accept-Language header
  const headerStore = await headers();
  const acceptLang = headerStore.get("accept-language") ?? "";
  const preferred = acceptLang
    .split(",")
    .map((part) => part.split(";")[0]?.trim().slice(0, 2))
    .find((code) => locales.includes(code as Locale)) as Locale | undefined;

  const locale = preferred ?? defaultLocale;
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
