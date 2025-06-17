import { useTheme as useNextTheme } from "next-themes";

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  
  return {
    theme: theme || "system",
    setTheme,
    resolvedTheme,
    isDark: resolvedTheme === "dark",
    isLight: resolvedTheme === "light",
    isSystem: theme === "system"
  };
} 