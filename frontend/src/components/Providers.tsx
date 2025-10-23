'use client'

import { BuilderProvider } from '@/contexts/BuilderContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return <BuilderProvider>{children}</BuilderProvider>
}
