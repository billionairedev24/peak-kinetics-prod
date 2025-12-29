"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface SchedulingContextType {
  isOpen: boolean
  open: () => void
  close: () => void
}

const SchedulingContext = createContext<SchedulingContextType | undefined>(undefined)

export function SchedulingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <SchedulingContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </SchedulingContext.Provider>
  )
}

export function useScheduling() {
  const context = useContext(SchedulingContext)
  if (context === undefined) {
    throw new Error("useScheduling must be used within a SchedulingProvider")
  }
  return context
}
