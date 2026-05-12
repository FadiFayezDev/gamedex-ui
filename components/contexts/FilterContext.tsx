"use client";

import {
  createContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
  useCallback,
} from "react";
import { FilterModel, defaultFilterModel, fetchGenresData, fetchPlatformsData, fetchCompaniesData, fetchModManagersData, fetchTagsData } from "../models/filterModel";
import { Genre, Platform, Tag } from "@/lib/schemas/game";
import { Company } from "../models/ecosystem/Company";
import { ModManager } from "@/lib/services/mod-managers";

type FilterContextType = {
  filterModel: FilterModel | null;
  setFilterModel: Dispatch<SetStateAction<FilterModel | null>>;
  
  // Available options (Full Objects)
  options: {
    genres: Genre[];
    platforms: Platform[];
    companies: Company[];
    modManagers: ModManager[];
    tags: Tag[];
  };
  
  refreshOptions: (type?: "genres" | "platforms" | "companies" | "modManagers" | "tags") => Promise<void>;
};

type FilterOptions = FilterContextType["options"]
type FilterOptionKey = keyof FilterOptions

export const FilterContext = createContext<FilterContextType>({
  filterModel: defaultFilterModel,
  setFilterModel: () => { },
  options: {
    genres: [],
    platforms: [],
    companies: [],
    modManagers: [],
    tags: [],
  },
  refreshOptions: async () => { },
});

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filterModel, setFilterModel] = useState<FilterModel | null>(defaultFilterModel);
  const [options, setOptions] = useState<{
    genres: Genre[];
    platforms: Platform[];
    companies: Company[];
    modManagers: ModManager[];
    tags: Tag[];
  }>({
    genres: [],
    platforms: [],
    companies: [],
    modManagers: [],
    tags: [],
  });

  const refreshOptions = useCallback(async (type?: FilterOptionKey) => {
    try {
      if (!type) {
        const [g, p, c, m, t] = await Promise.all([
          fetchGenresData(),
          fetchPlatformsData(),
          fetchCompaniesData(),
          fetchModManagersData(),
          fetchTagsData(),
        ]);
        setOptions({
          genres: g,
          platforms: p,
          companies: c,
          modManagers: m,
          tags: t,
        });
      } else {
        switch (type) {
          case "genres": {
            const genres = await fetchGenresData();
            setOptions((prev) => ({ ...prev, genres }));
            break;
          }
          case "platforms": {
            const platforms = await fetchPlatformsData();
            setOptions((prev) => ({ ...prev, platforms }));
            break;
          }
          case "companies": {
            const companies = await fetchCompaniesData();
            setOptions((prev) => ({ ...prev, companies }));
            break;
          }
          case "modManagers": {
            const modManagers = await fetchModManagersData();
            setOptions((prev) => ({ ...prev, modManagers }));
            break;
          }
          case "tags": {
            const tags = await fetchTagsData();
            setOptions((prev) => ({ ...prev, tags }));
            break;
          }
        }
      }
    } catch (err) {
      console.error("Failed to refresh filter options:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let isActive = true;

    const loadInitialOptions = async () => {
      try {
        const [genres, platforms, companies, modManagers, tags] = await Promise.all([
          fetchGenresData(),
          fetchPlatformsData(),
          fetchCompaniesData(),
          fetchModManagersData(),
          fetchTagsData(),
        ]);

        if (!isActive) return;

        setOptions({
          genres,
          platforms,
          companies,
          modManagers,
          tags,
        });
      } catch (err) {
        console.error("Failed to refresh filter options:", err);
      }
    };

    void loadInitialOptions();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <FilterContext.Provider value={{ filterModel, setFilterModel, options, refreshOptions }}>
      {children}
    </FilterContext.Provider>
  );
}
