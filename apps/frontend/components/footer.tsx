import Link from "next/link";

export function Footer() {
    return (
        <footer className="flex w-full flex-col items-center justify-center gap-6 bg-transparent py-8 text-sm">
            <div className="flex flex-wrap justify-center gap-8 text-gray-500 dark:text-gray-400">
                <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/security" className="hover:text-gray-900 dark:hover:text-white transition-colors">Security Standards</Link>
                <Link href="/help" className="hover:text-gray-900 dark:hover:text-white transition-colors">Help Center</Link>
            </div>

            <div className="text-xs text-gray-400 dark:text-gray-500">
                © 2024 ReLiS Research Systems. All rights reserved.
            </div>
        </footer>
    );
}
