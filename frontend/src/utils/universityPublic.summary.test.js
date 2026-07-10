import { describe, expect, it } from "vitest";
import {
  isLongUniversitySummary,
  truncateUniversitySummary,
} from "./universityPublic.js";

const LONG_SUMMARY =
  "A.I. Gersen nomidagi Rossiya davlat pedagogika universiteti Toshkent filiali (qisqacha: RGPU) – A.I. Gersen nomidagi Rossiya davlat pedagogika universiteti tarkibidagi xorijiy universitet filiali. Filial Toshkent shahrida joylashgan bo'lib, Toshkent va atrofdagi hududlar uchun pedagog kadrlar va ta'lim mutaxassislarini tayyorlash vazifasini bajaradi. Asosiy muassasa bilan bir xil o'quv-reja, diplom talablari va kadrlar siyosati qo'llaniladi; talabalar amaliyot va ilmiy resurslardan mahalliy sharoitda foydalanadi. Bakalavriat va magistratura bosqichlarida asosan boshlang'ich ta'lim, maxsus pedagogika, psixologiya va metodika yo'nalishlarida kadrlar tayyorlanadi.";

describe("truncateUniversitySummary", () => {
  it("keeps short text unchanged", () => {
    expect(truncateUniversitySummary("Qisqa matn.")).toBe("Qisqa matn.");
  });

  it("keeps about one sentence for long university blurbs", () => {
    const preview = truncateUniversitySummary(LONG_SUMMARY);
    expect(preview).toContain("xorijiy universitet filiali.");
    expect(preview).not.toContain("Filial Toshkent shahrida");
    expect(preview).not.toContain("Asosiy muassasa bilan");
    expect(preview.length).toBeLessThan(LONG_SUMMARY.length);
    expect(preview.startsWith("A.I. Gersen")).toBe(true);
  });

  it("marks long summaries for expand UI", () => {
    expect(isLongUniversitySummary(LONG_SUMMARY)).toBe(true);
    expect(isLongUniversitySummary("Qisqa.")).toBe(false);
  });
});
