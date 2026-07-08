/**
 * Universitet joylashuvi — pin ishonchliligi.
 * Seed ma'lumotlar ko'pincha shahar markazi + offset; kampus deb ko'rsatish mumkin emas.
 */

function firstCityLabel(detail) {
  const city = String(detail?.city || "").trim();
  if (city) {
    return city;
  }
  const fromLocation = String(detail?.location || "")
    .split(",")[0]
    .trim();
  return fromLocation || "";
}

function looksLikePreciseCampusAddress(address, cityLabel) {
  const text = String(address || "").trim();
  if (!text) {
    return false;
  }

  const lowered = text.toLowerCase();
  const hasStreetSignal =
    /\d/.test(text) ||
    /(ko['ʻ’`]?cha|str\.|street|улица|проспект|майдон|mavze|mfy|massiv|д\.)/i.test(lowered);

  if (!hasStreetSignal) {
    return false;
  }

  const city = String(cityLabel || "").trim().toLowerCase();
  const onlyCityCountry =
    city &&
    (lowered === city ||
      lowered === `${city}, o'zbekiston` ||
      lowered === `${city}, oʻzbekiston` ||
      lowered === `${city}, uzbekistan`);

  return !onlyCityCountry;
}

/**
 * @returns {{
 *   precision: "none" | "city" | "campus",
 *   latitude: number | null,
 *   longitude: number | null,
 *   cityLabel: string,
 *   addressLabel: string,
 *   showMap: boolean,
 *   showMarker: boolean,
 *   honestyLabel: string,
 * }}
 */
export function resolveUniversityLocationDisplay(detail) {
  const latitude = Number(detail?.latitude);
  const longitude = Number(detail?.longitude);
  const cityLabel = firstCityLabel(detail);
  const addressLabel = String(detail?.address || detail?.location || "").trim();
  const hasCoords = Number.isFinite(latitude) && Number.isFinite(longitude);

  if (!hasCoords && !addressLabel && !cityLabel) {
    return {
      precision: "none",
      latitude: null,
      longitude: null,
      cityLabel: "",
      addressLabel: "",
      showMap: false,
      showMarker: false,
      honestyLabel: "",
    };
  }

  if (!hasCoords) {
    return {
      precision: "city",
      latitude: null,
      longitude: null,
      cityLabel,
      addressLabel,
      showMap: false,
      showMarker: false,
      honestyLabel: "Xarita pin yo'q — faqat matnli manzil. Aniq kampus koordinatasi tasdiqlanmagan.",
    };
  }

  const campusGrade = looksLikePreciseCampusAddress(detail?.address, cityLabel);
  if (campusGrade) {
    return {
      precision: "campus",
      latitude,
      longitude,
      cityLabel,
      addressLabel,
      showMap: true,
      showMarker: true,
      honestyLabel: "Manzil xaritasi — tarqatilgan koordinata asosida (taxminiy pin).",
    };
  }

  return {
    precision: "city",
    latitude,
    longitude,
    cityLabel,
    addressLabel,
    showMap: true,
    showMarker: false,
    honestyLabel:
      "Taxminiy shahar darajasi — bu aniq kampus nuqtasi emas. Pin ko'rsatilmaydi.",
  };
}
