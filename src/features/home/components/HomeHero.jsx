import React from "react";
import { motion } from "framer-motion";
import { useHomeSearch } from "../../../hooks/useHomeSearch";
import HomeSearchBox from "./HomeSearchBox";
import LocationGateModal from "./LocationGateModal";

/** Sección hero del Home: título y la caja de búsqueda (con su gate de ubicación). */
export default function HomeHero() {
  const s = useHomeSearch();

  return (
    <section className="hero-bg-mockup py-20 lg:py-32 px-6 lg:px-12 relative overflow-hidden flex items-center min-h-[620px]">
      <div className="max-w-7xl mx-auto relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
        <div className="lg:col-span-7 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-white leading-tight"
          >
            Encontrá tu próximo <br className="hidden md:block" /> hogar con <span className="text-white">Infocasa</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/90 max-w-xl"
          >
            La plataforma que conecta personas, empresas e inmobiliarias en un solo lugar.
          </motion.p>
        </div>

        <div className="lg:col-span-5 w-full">
          <HomeSearchBox s={s} />
        </div>
      </div>

      <LocationGateModal
        open={s.gate.open}
        status={s.gate.status}
        province={s.gate.province}
        error={s.gate.error}
        onAccept={s.gate.onAccept}
        onClose={s.gate.onClose}
      />
    </section>
  );
}
