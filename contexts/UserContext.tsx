'use client'

import { createContext, useContext } from 'react'
import { useUser as useClerkUser } from '@clerk/nextjs'

const UserContext = createContext({ user: null })

export function UserProvider({ children }) {
  const { user } = useClerkUser()
  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext) 