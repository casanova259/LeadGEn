import dynamic from "next/dynamic";
import Hero01 from "@/components/originkit/hero-01";
import Features01 from "@/components/originkit/features-01";
import { Footer } from "@/components/originkit/footer";

const Hero42 = dynamic(() => import("@/components/originkit/hero-42"));
const Pricing01 = dynamic(() => import("@/components/originkit/pricing-01"));
const FaqSection = dynamic(() =>
  import("@/components/originkit/faq-section").then((mod) => mod.FaqSection)
);

export default function LandingPage() {
  return (
    <>
      <Hero01 />
      <Features01 />
      <Hero42 />
      <Pricing01 />
      <FaqSection />
      <Footer />
    </>
  );
}
