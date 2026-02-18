import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface AuthLayoutProps {
    children: React.ReactNode;
    mode: "login" | "signup";
}

export function AuthLayout({ children, mode }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-cyan-50 to-white dark:from-[#050505] dark:via-[#0a1a1a] dark:to-[#050505] flex flex-col">
            <Header mode={mode} />
            <main className="flex-1 flex flex-col items-center justify-center p-6 pt-24 pb-12">
                {children}
            </main>
            <Footer />
        </div>
    );
}
