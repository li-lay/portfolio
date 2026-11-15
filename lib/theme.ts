// Gruvbox theme switching, shared by the Konami listener and the command
// palette. Dark is the default and has no attribute; light is opt-in.
export const THEME_STORAGE_KEY = "theme";
export const LIGHT_THEME = "gruvbox-light";
export const DARK_THEME = "gruvbox-dark";

export type Theme = typeof LIGHT_THEME | typeof DARK_THEME;

const THEME_COLOR: Record<Theme, string> = {
  [LIGHT_THEME]: "#f9f5d7",
  [DARK_THEME]: "#1d2021",
};

function isTheme(value: string | null): value is Theme {
  return value === LIGHT_THEME || value === DARK_THEME;
}

/** Writes the theme to <html data-theme> (absent ⇒ dark) and the browser chrome. */
export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === LIGHT_THEME) root.dataset.theme = LIGHT_THEME;
  else delete root.dataset.theme;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLOR[theme]);
}

export function storedTheme(): Theme {
  if (typeof window === "undefined") return DARK_THEME;
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : DARK_THEME;
  } catch {
    return DARK_THEME;
  }
}

export function currentTheme(): Theme {
  if (typeof document === "undefined") return DARK_THEME;
  return document.documentElement.dataset.theme === LIGHT_THEME
    ? LIGHT_THEME
    : DARK_THEME;
}

export function applyStoredTheme(): Theme {
  const theme = storedTheme();
  applyTheme(theme);
  return theme;
}

export function toggleTheme(): Theme {
  const next: Theme =
    currentTheme() === LIGHT_THEME ? DARK_THEME : LIGHT_THEME;
  applyTheme(next);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Private mode / storage disabled: the toggle still works for this page.
  }
  return next;
}
