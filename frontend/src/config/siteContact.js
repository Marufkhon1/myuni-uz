export const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL?.trim() || "hello@myuni.uz";

export const SUPPORT_PHONE =
  import.meta.env.VITE_SUPPORT_PHONE?.trim() || "+998901234567";

export const SUPPORT_PHONE_DISPLAY =
  import.meta.env.VITE_SUPPORT_PHONE_DISPLAY?.trim() || "+998 90 123 45 67";

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
