import { Genre } from "@/lib/schemas/game";
import { Platform } from "@/lib/schemas/game";

// models/filterModel.ts
import { ApiRoot } from "@/components/root/root";
import { useEffect, useState } from "react";
import { Company } from "./ecosystem/Company";
import { listModManagers, ModManager } from "@/lib/services/mod-managers";
import { getGenre, listCompanies, listGenres, listPlatforms } from "@/lib/services";

export type FilterModel = {
  checkboxes: Record<string, string[]>;
  range: {
    price: { min: number; max: number };
    size: { min: number; max: number };
  };
  sortBy: string;
  query: string;
};

// 👇 ده الـ static default
export const defaultFilterModel: FilterModel = {
  checkboxes: {
    genres: [],
    platforms: [],
    companies: [],
    modManagers: [],
    tags: ["Multiplayer", "Single Player", "Controller Support"],
  },
  range: {
    price: { min: 0, max: 100 },
    size: { min: 0, max: 100 },
  },
  sortBy: "name",
  query: "",
};

// 👇 functions بتجيب البيانات من الـAPI (يرجع الـobjects كاملة)
export const fetchGenresData = async (): Promise<Genre[]> => {
  try {
    return await listGenres();
  } catch (err) {
    console.error("Exception fetching genres:", err);
    return [];
  }
};

export const fetchPlatformsData = async (): Promise<Platform[]> => {
  try {
    return await listPlatforms();
  } catch (err) {
    console.error("Exception fetching platforms:", err);
    return [];
  }
};

export const fetchCompaniesData = async (): Promise<Company[]> => {
  try {
    return await listCompanies();
  } catch (err) {
    console.error("Exception fetching companies:", err);
    return [];
  }
};

export const fetchModManagersData = async (): Promise<ModManager[]> => {
  try {
    return await listModManagers();
  } catch (err) {
    console.error("Exception fetching mod managers:", err);
    return [];
  }
};

// 👇 hook بيرجعلك الموديل مع خيارات الفلتر محملة (مفيد لو لسه في حد بيستخدمه)
export const useFilterModel = () => {
  const [filterModel, setFilterModel] = useState<FilterModel>(defaultFilterModel);

  useEffect(() => {
    const loadMetadata = async () => {
      const [genres, platforms, companies, modManagers] = await Promise.all([
        fetchGenresData(),
        fetchPlatformsData(),
        fetchCompaniesData(),
        fetchModManagersData()
      ]);

      setFilterModel((prev) => ({
        ...prev,
        checkboxes: {
          ...prev.checkboxes,
          genres: genres.map(g => g.name),
          platforms: platforms.map(p => p.name),
          companies: companies.map(c => c.name),
          modManagers: modManagers.map(m => m.name)
        },
      }));
    };

    loadMetadata();
  }, []);

  return filterModel;
};

// بقية الدوال القديمة للتوافق (لو ضروري)
export const fetchGenres = async () => (await fetchGenresData()).map(g => g.name);
export const fetchPlatforms = async () => (await fetchPlatformsData()).map(p => p.name);
export const fetchCompanies = async () => (await fetchCompaniesData()).map(c => c.name);
export const fetchModManagers = async () => (await fetchModManagersData()).map(m => m.name);
