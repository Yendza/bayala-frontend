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
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const accessToken = localStorage.getItem('access')
        if (accessToken) {
            axios.get('/api/usuario-logado/', {
                headers: { Authorization: `Bearer ${accessToken}` },
            })
                .then(response => setUser(response.data))
                .catch(() => setUser(null))
        }
    }, [])

    const login = (user: User, token: string) => {
        localStorage.setItem('access', token)
        setUser(user)
    }

    const logout = () => {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
