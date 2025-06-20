'use client'

import { createContext, useContext } from 'react'
import { useAuth } from './AuthContext'

const UserContext = createContext({ user: null })

export function UserProvider({ children }) {
  const { user } = useAuth()
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext) 