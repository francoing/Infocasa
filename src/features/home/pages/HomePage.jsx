import React from "react";
import { useProperties } from "../../../hooks/useProperties";
import { useAuth } from "../../../hooks/useAuth";
import HomeHero from "../components/HomeHero";
import FeaturedProperties from "../components/FeaturedProperties";
import HomeNews from "../components/HomeNews";
import HomeBenefits from "../components/HomeBenefits";
import HomeCTA from "../components/HomeCTA";
import WelcomeModal from "../components/WelcomeModal";

export default function HomePage() {
  const { data: properties, loading, error } = useProperties();
  const { user } = useAuth();

  return (
      <div className="flex flex-col">
        <HomeHero />
        <FeaturedProperties properties={properties} loading={loading} error={error} />
        <HomeNews />
        <HomeBenefits />
        <HomeCTA />
        <WelcomeModal enabled={!user} />
      </div>
  );
}
