// app/providers.tsx (or _app.tsx)
"use client"
import { ReactNode, createContext, useState, useEffect } from "react"
import { onIdTokenChanged, User } from "firebase/auth"
import { auth } from "@/lib/firebase"

export const AuthContext = createContext<{ user: User | null, getToken: () => Promise<string | null> }>({
  user: null,
  getToken: async () => null,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => onIdTokenChanged(auth, setUser), [])

  const getToken = () => user?.getIdToken() ?? Promise.resolve(null)

  return (
    <AuthContext.Provider value={{ user, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}
