import Link from "next/link";

export function CTA() {
    return (
        <section className="bg-[#0A0A0A] py-32 px-6 md:px-12 text-center border-t border-[#262626]">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to accelerate your science?</h2>
                <p className="text-gray-400 text-lg mb-10">
                    Join 5,000+ researchers using ReLiS to push the boundaries of evidence-based medicine.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                        href="/signup"
                        className="rounded-md bg-cyan-500 px-8 py-3 text-base font-semibold text-black transition-all hover:bg-cyan-400 hover:scale-105"
                    >
                        Start Free Trial
                    </Link>
                    <Link
                        href="/sales"
                        className="rounded-md border border-[#333] bg-transparent px-8 py-3 text-base font-semibold text-white transition-all hover:bg-[#1a1a1a] hover:border-gray-500"
                    >
                        Talk to Sales
                    </Link>
                </div>
            </div>
        </section>
    );
}
