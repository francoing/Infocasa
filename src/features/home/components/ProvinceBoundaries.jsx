import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import PROVINCE_BOUNDARIES from "../../../data/provincias.json";

const TARGET_PROVINCES = ["Tucumán", "Santiago del Estero"];

const TARGET_STYLE = {
  fillColor: "#2563eb",
  fillOpacity: 0.08,
  color: "#2563eb",
  weight: 1.5,
  opacity: 0.4,
};

const TARGET_HOVER = {
  fillOpacity: 0.2,
  weight: 3,
  opacity: 0.9,
};

const NEIGHBOR_STYLE = {
  fillColor: "#94a3b8",
  fillOpacity: 0.04,
  color: "#94a3b8",
  weight: 0.8,
  opacity: 0.15,
};

const NEIGHBOR_HOVER = {
  fillOpacity: 0.08,
  weight: 1.2,
  opacity: 0.3,
};

export default function ProvinceBoundaries() {
  const map = useMap();

  useEffect(() => {
    const geoLayer = L.geoJSON(PROVINCE_BOUNDARIES, {
      style: (feature) => {
        const name = feature?.properties?.nombre;
        return TARGET_PROVINCES.includes(name) ? TARGET_STYLE : NEIGHBOR_STYLE;
      },
      onEachFeature: (feature, layer) => {
        const name = feature?.properties?.nombre;
        const isTarget = TARGET_PROVINCES.includes(name);

        layer.on({
          mouseover: (e) => {
            e.target.setStyle(isTarget ? TARGET_HOVER : NEIGHBOR_HOVER);
            if (isTarget) e.target.bringToFront();
          },
          mouseout: (e) => {
            e.target.setStyle(isTarget ? TARGET_STYLE : NEIGHBOR_STYLE);
          },
        });
      },
    });

    geoLayer.addTo(map);

    return () => {
      map.removeLayer(geoLayer);
    };
  }, [map]);

  return null;
}
