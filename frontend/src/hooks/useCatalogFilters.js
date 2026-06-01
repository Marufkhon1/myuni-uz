import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebouncedValue } from "./useDebouncedValue.js";
import {
  buildCatalogSearchParams,
  catalogFiltersEqual,
  catalogFiltersKey,
  parseCatalogSearchParams,
} from "../utils/universityCatalog.js";

export function useCatalogFilters(debounceMs = 350) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => parseCatalogSearchParams(searchParams));
  const debouncedFilters = useDebouncedValue(filters, debounceMs);

  useEffect(() => {
    const urlFilters = parseCatalogSearchParams(searchParams);
    if (catalogFiltersEqual(urlFilters, debouncedFilters)) {
      return;
    }
    setFilters(urlFilters);
  }, [searchParams, debouncedFilters]);

  useEffect(() => {
    const nextParams = buildCatalogSearchParams(debouncedFilters);
    if (nextParams.toString() === catalogFiltersKey(parseCatalogSearchParams(searchParams))) {
      return;
    }
    setSearchParams(nextParams, { replace: true });
  }, [debouncedFilters, searchParams, setSearchParams]);

  return {
    filters,
    debouncedFilters,
    setFilters,
  };
}
