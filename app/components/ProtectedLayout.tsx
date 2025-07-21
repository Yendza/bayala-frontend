'use client'

import useAuth from '../hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { isLoggedIn } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login')
        }
    }, [isLoggedIn])

    if (!isLoggedIn) return null

    return <>{children}</>
}
