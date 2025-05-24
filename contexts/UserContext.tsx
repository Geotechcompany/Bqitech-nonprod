'use client'

import { createContext, useContext } from 'react'
import { useSession } from 'next-auth/react'

const UserContext = createContext({ user: null })

export function UserProvider({ children }) {
  const { data: session } = useSession()
  return (
    <UserContext.Provider value={{ user: session?.user }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext) 