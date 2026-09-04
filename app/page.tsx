import Hero01 from "@/components/originkit/hero-01";
import Features01 from "@/components/originkit/features-01";
import { FeaturesWhy } from "@/components/originkit/features-04";
import { ProductDeepDive } from "@/components/originkit/product-deep-dive";
import Pricing01 from "@/components/originkit/pricing-01";
import { FaqSection } from "@/components/originkit/faq-section";
import { Footer } from "@/components/originkit/footer";

export default function LandingPage() {
  return (
    <>
      <Hero01 />
      <Features01 />
      <FeaturesWhy />
      <ProductDeepDive />
      <Pricing01 />
      <FaqSection />
      <Footer />
    </>
  );
}
