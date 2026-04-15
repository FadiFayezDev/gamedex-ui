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
import { FilterModel, defaultFilterModel, fetchGenresData, fetchPlatformsData, fetchCompaniesData, fetchModManagersData } from "../models/filterModel";
import { Genre, Platform } from "@/lib/schemas/game";
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
  };
  
  refreshOptions: (type?: "genres" | "platforms" | "companies" | "modManagers") => Promise<void>;
};

export const FilterContext = createContext<FilterContextType>({
  filterModel: defaultFilterModel,
  setFilterModel: () => { },
  options: {
    genres: [],
    platforms: [],
    companies: [],
    modManagers: [],
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
  }>({
    genres: [],
    platforms: [],
    companies: [],
    modManagers: [],
  });

  const refreshOptions = useCallback(async (type?: "genres" | "platforms" | "companies" | "modManagers") => {
    try {
      if (!type) {
        const [g, p, c, m] = await Promise.all([
          fetchGenresData(),
          fetchPlatformsData(),
          fetchCompaniesData(),
          fetchModManagersData(),
        ]);
        setOptions({
          genres: g,
          platforms: p,
          companies: c,
          modManagers: m,
        });
      } else {
        let newData: any[] = [];
        switch (type) {
          case "genres": newData = await fetchGenresData(); break;
          case "platforms": newData = await fetchPlatformsData(); break;
          case "companies": newData = await fetchCompaniesData(); break;
          case "modManagers": newData = await fetchModManagersData(); break;
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
