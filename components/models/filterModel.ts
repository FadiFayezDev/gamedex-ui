import { Genre } from "@/components/models/ecosystem/genre";
import { Platform } from "@/components/models/ecosystem/platform";

// models/filterModel.ts
import { ApiRoot } from "@/components/root/root";
import { useEffect, useState } from "react";
import { Company } from "./ecosystem/Company";

export type FilterModel = {
  checkboxes: Record<string, string[]>;
  range: {
    price: { min: number; max: number };
    size: { min: number; max: number };
  };
  sortBy: string;
};

// 👇 ده الـ static default
export const defaultFilterModel: FilterModel = {
  checkboxes: {
    genres: [], // placeholder لحد ما نجيبها من الـ API
    platforms: [],
    companies: [],
    tags: ["Multiplayer", "Single Player", "Controller Support"],
  },
  range: {
    price: { min: 0, max: 100 },
    size: { min: 0, max: 100 },
  },
  sortBy: "name",
};

// 👇 function بتجيب الـgenres من الـAPI
export const fetchGenres = async (): Promise<string[]> => {
  try {
    const res = await fetch(`${ApiRoot}/api/v1/genres`); // ✨ غيّر الـURL حسب API عندك
    if (!res.ok) {
      console.error("Error fetching genres:", await res.text());
      return [];
    }
    const data = await res.json();
    // لو API بيرجع array من objects اعمل map للـname
    return data.map((g: Genre) => g.name ?? "");
  } catch (err) {
    console.error("Exception fetching genres:", err);
    return [];
  }
};

export const fetchPlatforms = async (): Promise<string[]> => {
  try {
    const res = await fetch(`${ApiRoot}/api/v1/platforms`); // ✨ غيّر الـURL حسب API عندك
    if (!res.ok) {
      console.error("Error fetching platforms:", await res.text());
      return [];
    }
    const data = await res.json();
    // لو API بيرجع array من objects اعمل map للـname
    return data.map((g: Platform) => g.name ?? "");
  } catch (err) {
    console.error("Exception fetching platforms:", err);
    return [];
  }
};

export const fetchCompanies = async (): Promise<string[]> => {
  try {
    const res = await fetch(`${ApiRoot}/api/v1/companies`); // ✨ غيّر الـURL حسب API عندك
    if (!res.ok) {
      console.error("Error fetching companies:", await res.text());
      return [];
    }
    const data = await res.json();
    // لو API بيرجع array من objects اعمل map للـname
    return data.map((g: Company) => g.name ?? "");
  } catch (err) {
    console.error("Exception fetching companies:", err);
    return [];
  }
};

// 👇 hook بيرجعلك الموديل مع الـgenres محملة
export const useFilterModel = () => {
  const [filterModel, setFilterModel] = useState<FilterModel>(defaultFilterModel);

  useEffect(() => {
    const loadGenres = async () => {
      const genres = await fetchGenres();
      setFilterModel((prev) => ({
        ...prev,
        checkboxes: {
          ...prev.checkboxes,
          genres,
        },
      }));
    };

    loadGenres();
  }, []);

  useEffect(() => {
    const loadPlatforms = async () => {
      const platforms = await fetchPlatforms();
      setFilterModel((prev) => ({
        ...prev,
        checkboxes: {
          ...prev.checkboxes,
          platforms,
        },
      }));
    };

    loadPlatforms();
  }, []);

  useEffect(() => {
    const loadCompanies = async () => {
      const companies = await fetchCompanies();
      setFilterModel((prev) => ({
        ...prev,
        checkboxes: {
          ...prev.checkboxes,
          companies,
        },
      }));
    };

    loadCompanies();
  }, []);

  return filterModel;
};
