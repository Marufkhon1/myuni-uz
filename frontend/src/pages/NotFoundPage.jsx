import { Link, useLocation } from "react-router-dom";
import { PAGE_META } from "@/config/siteMeta.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import StatusPageLayout, {
  StatusPrimaryButton,
} from "@/components/ui/StatusPageLayout.jsx";

export default function NotFoundPage() {
  const { pathname } = useLocation();
  usePageMeta({ ...PAGE_META.notFound, path: pathname });

  return (
    <StatusPageLayout
      variant="notFound"
      eyebrow="404"
      title="Sahifa topilmadi"
      description="Havola noto'g'ri yoki sahifa o'chirilgan bo'lishi mumkin. Bosh sahifadan qayta boshlang."
      primaryAction={<StatusPrimaryButton to="/">Bosh sahifaga qaytish</StatusPrimaryButton>}
      secondaryAction={
        <Link
          to="/login"
          className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-black text-primary transition hover:underline"
        >
          Kirish
        </Link>
      }
    />
  );
}
