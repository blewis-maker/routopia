'use client'

import { useAuth } from "@/hooks/useAuth"
import { useEffect, useState } from "react"

interface Route {
  id: string
  name: string
  routeType: 'CAR' | 'BIKE' | 'SKI'
  // ... other fields
}

export default function RoutesPage() {
  const { session, status } = useAuth()
  const [routes, setRoutes] = useState<Route[]>([])

  useEffect(() => {
    if (status === "authenticated") {
      fetch('/api/routes')
        .then(res => res.json())
        .then(data => setRoutes(data))
    }
  }, [status])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Welcome {session?.user?.name}
      </h1>
      
      <div className="grid gap-4">
        {routes.map(route => (
          <div key={route.id} className="p-4 border rounded">
            <h2>{route.name}</h2>
            <p>Type: {route.routeType}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
