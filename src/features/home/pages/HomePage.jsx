import React from "react";
import Layout from "../../../common/components/Layout";
import { useProperties } from "../../../hooks/useProperties";
import HomeHero from "../components/HomeHero";
import FeaturedProperties from "../components/FeaturedProperties";
import HomeNews from "../components/HomeNews";
import HomeBenefits from "../components/HomeBenefits";
import HomeCTA from "../components/HomeCTA";

export default function HomePage() {
  const { data: properties, loading, error } = useProperties();

  return (
    <Layout>
      <div className="flex flex-col">
        <HomeHero />
        <FeaturedProperties properties={properties} loading={loading} error={error} />
        <HomeNews />
        <HomeBenefits />
        <HomeCTA />
      </div>
    </Layout>
  );
}
