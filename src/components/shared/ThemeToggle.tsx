import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isDark, setIsDark] = useState(false)

  // Determine actual theme (handling 'system' preference)
  useEffect(() => {
    const checkTheme = () => {
      if (theme === 'system') {
        setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
      } else {
        setIsDark(theme === 'dark')
      }
    }
    
    checkTheme()
    
    // Listen for system changes if in system mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
        if (theme === 'system') checkTheme()
    }
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full overflow-hidden hover:bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0"
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            exit={{ rotate: 90, scale: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Moon 
              className="h-5 w-5 text-blue-500 fill-blue-500/10" 
              strokeWidth={2}
            />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            exit={{ rotate: -90, scale: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sun 
              className="h-5 w-5 text-amber-500 fill-amber-500/10" 
              strokeWidth={2}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}
