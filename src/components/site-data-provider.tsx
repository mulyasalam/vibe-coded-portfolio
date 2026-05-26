"use client";

import * as React from "react";
import {
  profile as defaultProfile,
  projects as defaultProjects,
} from "@/lib/data";
import type { SiteData } from "@/lib/server/site-data";

const Ctx = React.createContext<SiteData>({
  profile: defaultProfile,
  projects: defaultProjects,
  cv: null,
});

export function SiteDataProvider({
  data,
  children,
}: {
  data: SiteData;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

export const useSiteData = () => React.useContext(Ctx);
