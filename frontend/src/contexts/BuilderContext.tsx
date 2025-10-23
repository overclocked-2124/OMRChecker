'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface BuilderContextType {
  savedTemplate: any | null
  savedConfig: any | null
  savedEvaluation: any | null
  setSavedTemplate: (template: any) => void
  setSavedConfig: (config: any) => void
  setSavedEvaluation: (evaluation: any) => void
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined)

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [savedTemplate, setSavedTemplate] = useState<any | null>(null)
  const [savedConfig, setSavedConfig] = useState<any | null>(null)
  const [savedEvaluation, setSavedEvaluation] = useState<any | null>(null)

  return (
    <BuilderContext.Provider
      value={{
        savedTemplate,
        savedConfig,
        savedEvaluation,
        setSavedTemplate,
        setSavedConfig,
        setSavedEvaluation,
      }}
    >
      {children}
    </BuilderContext.Provider>
  )
}

export function useBuilder() {
  const context = useContext(BuilderContext)
  if (context === undefined) {
    throw new Error('useBuilder must be used within a BuilderProvider')
  }
  return context
}
