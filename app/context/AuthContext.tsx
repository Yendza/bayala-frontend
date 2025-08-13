'use client'

import { createContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface User {
    id: number
    username: string
    email: string
}

interface AuthContextType {
    user: User | null
    isLoggedIn: boolean
    login: (user: User, token: string) => void
    logout: () => void
    loading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken') // <-- chave unificada
        if (accessToken) {
            axios
                .get('/api/usuario-logado/', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                })
                .then(response => setUser(response.data))
                .catch(() => setUser(null))
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [])

    const login = (user: User, token: string) => {
        localStorage.setItem('accessToken', token)
        setUser(user)
    }

    const logout = () => {
        localStorage.removeItem('accessToken')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}
