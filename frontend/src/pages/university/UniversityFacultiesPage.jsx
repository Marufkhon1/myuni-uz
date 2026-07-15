import { useOutletContext } from "react-router-dom";
import UniversityPublicFaculties from "@/components/catalog/UniversityPublicFaculties.jsx";
import { buildUniversitySiloPath } from "@/config/universitySilos.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import { getUniversityOgImagePath } from "@/utils/universityImage.js";

export default function UniversityFacultiesPage() {
  const { detail, slug } = useOutletContext();
  const isEmpty = !(detail?.faculties?.length > 0);

  usePageMeta({
    title: detail ? `${detail.name} fakultetlari | MyUni.uz` : "Fakultetlar | MyUni.uz",
    description: detail
      ? `${detail.name} fakultetlari va yo'nalishlari — bakalavr, magistratura va boshqa darajalar.`
      : "Universitet fakultetlari.",
    path: slug ? buildUniversitySiloPath(slug, "faculties") : undefined,
    image: detail ? getUniversityOgImagePath(detail) : undefined,
    imageAlt: detail ? `${detail.name} fakultetlari` : undefined,
    robots: isEmpty ? "noindex, follow" : "index, follow",
  });

  if (!detail) {
    return null;
  }

  return (
    <div className="min-h-[12rem]">
      <div className="border-b border-slate-100 px-5 pt-6 dark:border-white/10 sm:px-6">
        <h1 className="text-xl font-black text-slate-950 dark:text-white sm:text-2xl">
          Fakultetlar va yo&apos;nalishlar
        </h1>
      </div>
      <UniversityPublicFaculties faculties={detail.faculties} />
    </div>
  );
}
