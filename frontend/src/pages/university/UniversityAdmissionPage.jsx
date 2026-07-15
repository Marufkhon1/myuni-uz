import { useOutletContext } from "react-router-dom";
import UniversityPublicAdmission from "@/components/catalog/UniversityPublicAdmission.jsx";
import { buildUniversitySiloPath } from "@/config/universitySilos.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import { getUniversityOgImagePath } from "@/utils/universityImage.js";

export default function UniversityAdmissionPage() {
  const { detail, slug } = useOutletContext();
  const isEmpty = !(detail?.admission_cycles?.length > 0);

  usePageMeta({
    title: detail ? `${detail.name} qabul | MyUni.uz` : "Qabul | MyUni.uz",
    description: detail
      ? `${detail.name} qabul ma'lumotlari — tsikllar, sanalar va ochiq ma'lumotlar.`
      : "Universitet qabul ma'lumotlari.",
    path: slug ? buildUniversitySiloPath(slug, "admission") : undefined,
    image: detail ? getUniversityOgImagePath(detail) : undefined,
    imageAlt: detail ? `${detail.name} qabul` : undefined,
    robots: isEmpty ? "noindex, follow" : "index, follow",
  });

  if (!detail) {
    return null;
  }

  return (
    <div className="min-h-[12rem]">
      <div className="border-b border-slate-100 px-5 pt-6 dark:border-white/10 sm:px-6">
        <h1 className="text-xl font-black text-slate-950 dark:text-white sm:text-2xl">
          Qabul ma&apos;lumotlari
        </h1>
      </div>
      <UniversityPublicAdmission cycles={detail.admission_cycles} />
    </div>
  );
}
