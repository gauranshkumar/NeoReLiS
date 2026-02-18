import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { Zap, Shield, Eye, Scale, FlaskConical, BrainCircuit, Cpu } from "lucide-react";
import Link from "next/link";

export default function AboutUsPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] font-sans text-white selection:bg-cyan-500/30">
            <LandingHeader />
            <main className="pt-20">

                {/* Hero */}
                <section className="py-24 px-6 text-center bg-[#0d0d0d]">
                    <div className="mb-6 inline-block px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                        Our Mission
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold max-w-4xl mx-auto leading-tight mb-8">
                        Accelerating scientific discovery through <span className="text-cyan-500">precision analytics</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        We bridge the gap between raw data and breakthrough insights with AI-driven precision, empowering researchers to focus on innovation.
                    </p>
                </section>

                {/* Bottleneck Section */}
                <section className="py-24 bg-[#050505] px-6 md:px-12">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-6">The Bottleneck in Research</h2>
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                Traditional research methods often struggle with the sheer volume and complexity of modern data. The manual processing of results creates a critical lag in the scientific lifecycle.
                            </p>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                At ReLiS, we identified this friction as the primary barrier to rapid innovation. Our platform automates the synthesis of multi-dimensional datasets without sacrificing the rigorous integrity scientific discovery demands.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#111] p-4 rounded-lg border border-[#262626]">
                                    <div className="text-3xl font-bold text-cyan-500">10x</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">FASTER ANALYSIS</div>
                                </div>
                                <div className="bg-[#111] p-4 rounded-lg border border-[#262626]">
                                    <div className="text-3xl font-bold text-cyan-500">99.9%</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">DATA ACCURACY</div>
                                </div>
                            </div>
                        </div>
                        {/* Abstract Visual */}
                        <div className="bg-[#0b1015] rounded-xl aspect-square flex items-center justify-center relative border border-[#262626]">
                            <div className="absolute inset-0 bg-cyan-900/5 rounded-xl"></div>
                            {/* Concentric circles simulation */}
                            <div className="w-[80%] h-[80%] rounded-full border border-cyan-500/10 flex items-center justify-center">
                                <div className="w-[70%] h-[70%] rounded-full border border-cyan-500/20 flex items-center justify-center">
                                    <div className="w-[40%] h-[40%] rounded-full border border-cyan-500/30 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="py-24 px-6 md:px-12 bg-[#0A0A0A]">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-[#262626] pb-8">
                            <p className="text-gray-400 max-w-lg mb-4 md:mb-0">
                                Our team consists of PhD researchers from world-class institutions and elite AI engineers dedicated to maintaining the highest standards of scientific integrity.
                            </p>
                            <Link href="#" className="text-cyan-500 font-bold text-sm hover:text-cyan-400 flex items-center gap-1">
                                MEET THE TEAM <span className="text-lg">→</span>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { icon: <FlaskConical />, text: "We ensure that every automated insight is traceable and verifiable, upholding the peer-review standards of global academia." },
                                { icon: <BrainCircuit />, text: "Proprietary neural architectures designed specifically for small-batch, high-value scientific datasets." },
                                { icon: <Cpu />, text: "A platform built for speed and reliability, processing petabytes of data with deterministic accuracy." },
                            ].map((item, i) => (
                                <div key={i} className="p-6">
                                    <div className="w-12 h-12 bg-cyan-950/30 rounded-lg flex items-center justify-center text-cyan-500 mb-6">
                                        {item.icon}
                                    </div>
                                    <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Core Values */}
                <section className="py-24 bg-[#050505] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/5 via-transparent to-transparent"></div>
                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                        <h2 className="text-3xl font-bold text-white mb-16">Core Values</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { title: "Precision", sub: "ACCURACY ABOVE ALL" },
                                { title: "Speed", sub: "ACCELERATED DISCOVERY" },
                                { title: "Transparency", sub: "EXPLAINABLE MODELS" },
                                { title: "Integrity", sub: "SCIENTIFIC ETHICS" },
                            ].map((val, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    {/* Icon placeholder (faded) */}
                                    <div className="w-16 h-16 bg-[#111] rounded-full mb-4 opacity-20"></div>
                                    <h3 className="text-white font-semibold">{val.title}</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{val.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Card */}
                <section className="py-24 px-6 md:px-12 bg-[#0A0A0A]">
                    <div className="max-w-5xl mx-auto bg-[#0F1115] border border-[#262626] rounded-2xl p-12 text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold text-white mb-4">Join the next frontier of scientific innovation</h2>
                            <p className="text-gray-400 max-w-xl mx-auto mb-8">
                                Whether you're a research institution or a corporate laboratory, ReLiS provides the tools to unlock insights faster than ever before.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-6 rounded-md transition-colors">
                                    Partner With Us
                                </button>
                                <button className="bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white font-bold py-3 px-6 rounded-md transition-colors">
                                    Explore Platform
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
            <LandingFooter />
        </div>
    );
}
