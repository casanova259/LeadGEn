import Hero01 from "@/components/originkit/hero-01";
import Features01 from "@/components/originkit/features-01";
import { FeaturesWhy } from "@/components/originkit/features-04";
import { ProductDeepDive } from "@/components/originkit/product-deep-dive";
import Pricing01 from "@/components/originkit/pricing-01";

export default function LandingPage() {
  return (
    <>
      <Hero01 />
      <Features01 />
      <FeaturesWhy />
      <ProductDeepDive />
      <Pricing01 />
    </>
  );
}
