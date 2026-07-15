export const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL?.trim() || "hello@myuni.uz";

/** Faqat VITE_SUPPORT_PHONE berilganda public sahifada ko'rsatiladi (placeholder yo'q). */
export const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE?.trim() || "";

export const SUPPORT_PHONE_DISPLAY =
  import.meta.env.VITE_SUPPORT_PHONE_DISPLAY?.trim() || SUPPORT_PHONE;

export const SHOW_SUPPORT_PHONE = Boolean(SUPPORT_PHONE);

export const OFFICE_NAME =
  import.meta.env.VITE_OFFICE_NAME?.trim() ||
  "TDIU Samarqand filiali (MyUni.uz ofisi)";

export const OFFICE_ADDRESS =
  import.meta.env.VITE_OFFICE_ADDRESS?.trim() ||
  "Samarqand sh., Professorlar ko'chasi, 51-uy";

export const OFFICE_LATITUDE = Number(
  import.meta.env.VITE_OFFICE_LATITUDE ?? 39.6389
);

export const OFFICE_LONGITUDE = Number(
  import.meta.env.VITE_OFFICE_LONGITUDE ?? 66.9482
);
