"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { localDateString } from "@/lib/dates";

interface TodayDateValue { selectedDate: string; setSelectedDate: (date: string) => void; }
const TodayDateContext = createContext<TodayDateValue | null>(null);

export function TodayDateProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDate] = useState("");
  useEffect(() => { setSelectedDate(localDateString()); }, []);
  return <TodayDateContext.Provider value={{ selectedDate, setSelectedDate }}>{children}</TodayDateContext.Provider>;
}

export function useTodayDate() {
  const context = useContext(TodayDateContext);
  if (!context) throw new Error("Today widgets must be rendered inside TodayDateProvider.");
  return context;
}
