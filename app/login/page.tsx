'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '../hooks/useAuth'
import api from '@/lib/api'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()
    const { login } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            const res = await api.post('/token/', { username, password })

            const access = res.data.access
            const user = res.data.user

            if (!access || !user) {
                throw new Error('Token ou usuário inválido')
            }

            login(user, access)
            router.push('/')
        } catch (err) {
            setError('Credenciais inválidas. Tente novamente.')
            console.error('Erro no login:', err)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Login - Controller</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Usuário"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2"
                        required
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        type="submit"
                        className="bg-blue-600 text-white py-2 rounded hover:bg-red-700 font-semibold"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    )
}
