"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { createCoreSemanticCssVariables } from "@ooee/tokens";

export type StudioTheme = "light" | "dark";
export type StudioLocale = "ko" | "en";
export type StudioViewport = "desktop" | "tablet" | "mobile";

type StudioPreferences = {
  theme: StudioTheme;
  locale: StudioLocale;
  viewport: StudioViewport;
  setTheme: (theme: StudioTheme) => void;
  setLocale: (locale: StudioLocale) => void;
  setViewport: (viewport: StudioViewport) => void;
};

const THEME_KEY = "ooee-studio-theme";
const LOCALE_KEY = "ooee-studio-locale";
const VIEWPORT_KEY = "ooee-studio-viewport";
const CHANGE_EVENT = "ooee-studio-preferences-change";
const StudioPreferencesContext = createContext<StudioPreferences | null>(null);
let themeChangeSequence = 0;

export function StudioPreferencesProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, () => "light" as const);
  const locale = useSyncExternalStore(subscribe, getLocaleSnapshot, () => "ko" as const);
  const viewport = useSyncExternalStore(subscribe, getViewportSnapshot, () => "desktop" as const);
  const value = useMemo<StudioPreferences>(() => ({
    theme,
    locale,
    viewport,
    setTheme(nextTheme) {
      suppressTransitionsDuringThemeChange();
      window.localStorage.setItem(THEME_KEY, nextTheme);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
    setLocale(nextLocale) {
      window.localStorage.setItem(LOCALE_KEY, nextLocale);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
    setViewport(nextViewport) {
      window.localStorage.setItem(VIEWPORT_KEY, nextViewport);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
  }), [locale, theme, viewport]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.lang = "ko";
    Object.entries(createCoreSemanticCssVariables(theme)).forEach(([property, value]) => root.style.setProperty(property, value));
  }, [locale, theme]);

  return (
    <StudioPreferencesContext.Provider value={value}>
      <div className={theme === "dark" ? "dark min-h-screen bg-background text-foreground" : "min-h-screen bg-background text-foreground"} lang="ko">
        {children}
      </div>
    </StudioPreferencesContext.Provider>
  );
}

function suppressTransitionsDuringThemeChange() {
  const root = document.documentElement;
  const sequence = ++themeChangeSequence;
  root.dataset.oeThemeChanging = "";
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      if (sequence === themeChangeSequence) delete root.dataset.oeThemeChanging;
    });
  });
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

function getThemeSnapshot(): StudioTheme {
  return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

function getLocaleSnapshot(): StudioLocale {
  return window.localStorage.getItem(LOCALE_KEY) === "en" ? "en" : "ko";
}

function getViewportSnapshot(): StudioViewport {
  const stored = window.localStorage.getItem(VIEWPORT_KEY);
  return stored === "tablet" || stored === "mobile" ? stored : "desktop";
}

export function useStudioPreferences() {
  const context = useContext(StudioPreferencesContext);
  if (!context) throw new Error("useStudioPreferences must be used within StudioPreferencesProvider");
  return context;
}
