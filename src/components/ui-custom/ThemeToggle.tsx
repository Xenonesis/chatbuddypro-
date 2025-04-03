"use client";

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Only render the toggle after component has mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Render placeholder with same dimensions during SSR to avoid layout shift
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative overflow-hidden rounded-full w-9 h-9"
      >
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative overflow-hidden rounded-full w-9 h-9 transition-all duration-500 ease-in-out hover:bg-transparent"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"></div>
      <div className="relative z-10 transition-all duration-500 ease-in-out animate-float">
        <Sun className={`h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 ease-in-out ${theme === "dark" ? "rotate-90 scale-0" : ""}`} />
        <Moon className={`absolute h-[1.2rem] w-[1.2rem] top-0 left-0 rotate-90 scale-0 transition-all duration-300 ease-in-out ${theme === "dark" ? "rotate-0 scale-100" : ""}`} />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 