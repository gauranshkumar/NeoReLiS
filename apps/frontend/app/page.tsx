import { LandingFooter } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";
import { Features } from "@/components/landing/features";
import { Team } from "@/components/landing/team";
import { CTA } from "@/components/landing/cta";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans selection:bg-cyan-500/30 text-white">
      <main>
        <Hero />
        <Stats />
        <Features />
        <Team />
        <CTA />
      </main>
      <LandingFooter />
    </div>
  );
}
