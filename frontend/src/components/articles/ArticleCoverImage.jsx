import { useEffect, useState } from "react";
import { DEFAULT_OG_IMAGE, resolveArticleCoverImage } from "@/config/siteMeta.js";

export default function ArticleCoverImage({
  coverImage,
  slug = "",
  alt = "",
  className = "",
  loading = "lazy",
}) {
  const resolved = resolveArticleCoverImage(coverImage, DEFAULT_OG_IMAGE, slug);
  const [src, setSrc] = useState(resolved);

  useEffect(() => {
    setSrc(resolved);
  }, [resolved]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={() => {
        if (src !== DEFAULT_OG_IMAGE) {
          setSrc(DEFAULT_OG_IMAGE);
        }
      }}
    />
  );
}
