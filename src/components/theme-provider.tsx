import { createContext, useContext, useEffect, useState } from "react"
import { db, auth } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  // Initialize from localStorage immediately to avoid flash
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  // Apply theme to DOM
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  // Sync with Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Load from Firestore on login
          const docRef = doc(db, 'users', user.uid, 'preferences', 'theme');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const savedTheme = docSnap.data().theme as Theme;
            if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
              setThemeState(savedTheme);
              localStorage.setItem(storageKey, savedTheme); // Sync local
            }
          }
        } catch (error) {
          console.error("Error loading theme from Firestore:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [storageKey]);

  const setTheme = (theme: Theme) => {
    localStorage.setItem(storageKey, theme)
    setThemeState(theme)

    // Save to Firestore if logged in
    const user = auth.currentUser;
    if (user) {
      setDoc(doc(db, 'users', user.uid, 'preferences', 'theme'), {
        theme: theme,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(err => console.error("Error saving theme:", err));
    }
  }

  const value = {
    theme,
    setTheme,
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
