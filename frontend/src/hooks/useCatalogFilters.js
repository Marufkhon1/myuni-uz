import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebouncedValue } from "./useDebouncedValue.js";
import {
  buildCatalogSearchParams,
  catalogFiltersEqual,
  catalogFiltersKey,
  parseCatalogSearchParams,
} from "@/utils/universityCatalog.js";

export function useCatalogFilters(debounceMs = 350) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => parseCatalogSearchParams(searchParams));
  const debouncedFilters = useDebouncedValue(filters, debounceMs);

  useEffect(() => {
    const urlFilters = parseCatalogSearchParams(searchParams);
    setFilters((current) => (catalogFiltersEqual(current, urlFilters) ? current : urlFilters));
  }, [searchParams]);

  useEffect(() => {
    const nextParams = buildCatalogSearchParams(debouncedFilters);
    const currentKey = catalogFiltersKey(parseCatalogSearchParams(searchParams));
    if (nextParams.toString() === currentKey) {
      return;
    }
    setSearchParams(nextParams, { replace: true });
  }, [debouncedFilters, setSearchParams, searchParams]);

  return {
    filters,
    debouncedFilters,
    setFilters,
  };
}
