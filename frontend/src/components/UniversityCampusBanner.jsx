import { useEffect, useState } from "react";
import { getUniversityBannerUrl, getUniversityBrandGradient } from "@/utils/universityImage.js";

function BannerFallback({ university, className }) {
  const label = university?.short_name || university?.name || "";
  const initials = label.slice(0, 2).toUpperCase() || "OTM";

  return (
    <div
      className={`relative overflow-hidden ${className} w-full`}
      style={{ background: getUniversityBrandGradient(university) }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,255,255,0.22),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,rgba(0,0,0,0.28),transparent_50%)]" />
      <div className="absolute -right-6 -top-8 text-[7rem] font-black leading-none text-white/10 sm:text-[9rem]">
        {initials}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-950/45 to-transparent" />
    </div>
  );
}

export default function UniversityCampusBanner({ university, className = "h-48" }) {
  const primaryUrl = getUniversityBannerUrl(university);
  const [imageUrl, setImageUrl] = useState(primaryUrl);
  const [useFallback, setUseFallback] = useState(!primaryUrl);
  const name = university?.name || university?.short_name || "Universitet";

  useEffect(() => {
    const nextUrl = getUniversityBannerUrl(university);
    setImageUrl(nextUrl);
    setUseFallback(!nextUrl);
  }, [university]);

  if (useFallback || !imageUrl) {
    return <BannerFallback university={university} className={className} />;
  }

  return (
    <div className={`relative ${className} w-full overflow-hidden`}>
      <img
        key={imageUrl}
        src={imageUrl}
        alt={`${name} kampus tasviri`}
        className="h-full w-full object-cover object-center"
        loading="lazy"
        onError={() => {
          setUseFallback(true);
          setImageUrl(null);
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}
