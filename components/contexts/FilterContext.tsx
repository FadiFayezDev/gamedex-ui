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

  const refreshOptions = useCallback(async (type?: "genres" | "platforms" | "companies" | "modManagers" | "tags") => {
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
        let newData: any[] = [];
        switch (type) {
          case "genres": newData = await fetchGenresData(); break;
          case "platforms": newData = await fetchPlatformsData(); break;
          case "companies": newData = await fetchCompaniesData(); break;
          case "modManagers": newData = await fetchModManagersData(); break;
          case "tags": newData = await fetchTagsData(); break;
        }
        setOptions(prev => ({ ...prev, [type]: newData }));
      }
    } catch (err) {
      console.error("Failed to refresh filter options:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshOptions();
  }, [refreshOptions]);

  return (
    <FilterContext.Provider value={{ filterModel, setFilterModel, options, refreshOptions }}>
      {children}
    </FilterContext.Provider>
  );
}
