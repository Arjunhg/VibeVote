"use client" //because context is a client side react hook

//provide our whole app with a context. We will wrap our layout with this provider. E:\WEB DEV\NextJsProject\Project\voting app\scalable-realtime\client\src\app\layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"

const client = new QueryClient() //super handy for caching

const Providers = ({ children }: { children: ReactNode }) => {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

export default Providers
