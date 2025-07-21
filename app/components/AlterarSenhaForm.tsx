'use client'

import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import useAuth from '../hooks/useAuth'

export default function AlterarSenhaForm() {
    const router = useRouter()
    const { logout } = useAuth()
    const [senhaAtual, setSenhaAtual] = useState('')
    const [novaSenha, setNovaSenha] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')
    const [mensagem, setMensagem] = useState('')
    const [erro, setErro] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (novaSenha !== confirmarSenha) {
            setErro('As senhas não coincidem')
            return
        }

        try {
            const token = localStorage.getItem('access')
            await axios.post('/alterar-senha/', {
                senha_actual: senhaAtual,
                nova_senha: novaSenha,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            // Mensagem de sucesso
            setMensagem('Senha alterada com sucesso! Redirecionando para login...')
            setErro('')

            // Espera 1 segundo para mostrar a mensagem antes de deslogar
            setTimeout(() => {
                logout()              // Limpa o token
                router.push('/login') // Redireciona para login
            }, 1000)

        } catch (err: any) {
            setErro(err?.response?.data?.detail || 'Erro ao alterar a senha')
            setMensagem('')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <div>
                <label>Senha atual</label>
                <input
                    type="password"
                    value={senhaAtual}
                    onChange={e => setSenhaAtual(e.target.value)}
                    className="border w-full p-2"
                    required
                />
            </div>

            <div>
                <label>Nova senha</label>
                <input
                    type="password"
                    value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    className="border w-full p-2"
                    required
                />
            </div>

            <div>
                <label>Confirmar nova senha</label>
                <input
                    type="password"
                    value={confirmarSenha}
                    onChange={e => setConfirmarSenha(e.target.value)}
                    className="border w-full p-2"
                    required
                />
            </div>

            {mensagem && <p className="text-green-600">{mensagem}</p>}
            {erro && <p className="text-red-600">{erro}</p>}

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Alterar senha
            </button>
        </form>
    )
}
