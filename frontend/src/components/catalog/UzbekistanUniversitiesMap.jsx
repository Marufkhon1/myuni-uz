import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const UZ_CENTER = [41.3775, 64.5853];
const DEFAULT_ZOOM = 6;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default function UzbekistanUniversitiesMap({ markers = [], onMarkerClick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const onMarkerClickRef = useRef(onMarkerClick);

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  const markerKey = useMemo(
    () => markers.map((item) => `${item.id}:${item.latitude}:${item.longitude}`).join("|"),
    [markers]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return undefined;
    }

    const map = L.map(containerRef.current, {
      center: UZ_CENTER,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) {
      return;
    }

    layer.clearLayers();
    const bounds = [];

    markers.forEach((university) => {
      if (university.latitude == null || university.longitude == null) {
        return;
      }
      const latLng = [university.latitude, university.longitude];
      bounds.push(latLng);
      const marker = L.marker(latLng).addTo(layer);
      const rating = university.average_rating != null ? `${university.average_rating}/5` : "—";
      const title = escapeHtml(university.short_name || university.name);
      const city = escapeHtml(university.city || "");
      marker.bindPopup(
        `<strong>${title}</strong><br/>${city}<br/>Reyting: ${escapeHtml(rating)}<br/>Sharhlar: ${university.review_count ?? 0}`
      );
      marker.on("click", () => onMarkerClickRef.current?.(university));
    });

    if (bounds.length === 1) {
      map.setView(bounds[0], 11);
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
    } else {
      map.setView(UZ_CENTER, DEFAULT_ZOOM);
    }

    window.requestAnimationFrame(() => {
      map.invalidateSize();
    });
  }, [markerKey, markers]);

  return (
    <div
      ref={containerRef}
      className="h-[28rem] w-full rounded-[1.75rem] border border-slate-200 dark:border-white/10 sm:h-[34rem]"
      role="application"
      aria-label="O'zbekiston universitetlari xaritasi"
    />
  );
}
