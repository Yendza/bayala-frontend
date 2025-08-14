"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function withAuth(Component: React.FC) {
    return function ProtectedComponent(props: any) {
        const router = useRouter();
        const [authorized, setAuthorized] = useState(false);

        useEffect(() => {
            const token = localStorage.getItem("accessToken"); // nome do token igual ao api.ts
            if (!token) {
                router.replace("/login"); // redireciona se não tiver token
            } else {
                setAuthorized(true); // permite renderizar o componente
            }
        }, [router]);

        if (!authorized) return <p>Carregando...</p>; // loader enquanto verifica
        return <Component {...props} />;
    };
}
