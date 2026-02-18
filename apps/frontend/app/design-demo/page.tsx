import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function DesignDemo() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
            <Header />
            <main className="flex h-[calc(100vh-4rem-12rem)] items-center justify-center p-8">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold">Design Implementation Demo</h1>
                    <p className="text-gray-500">
                        This page demonstrates the Header and Footer components derived from the Figma designs.
                    </p>
                    <div className="p-4 border rounded bg-white dark:bg-black shadow-sm inline-block">
                        <span className="text-sm font-mono text-cyan-600">Header: Header - Top Navigation Bar.png</span>
                        <br />
                        <span className="text-sm font-mono text-gray-400">Footer: Footer.png</span>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
