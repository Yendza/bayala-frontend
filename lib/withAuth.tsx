"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function withAuth(Component: React.FC) {
  return function ProtectedComponent(props: any) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState<boolean | null>(null); // null = ainda não checou

    useEffect(() => {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.replace("/login"); // redireciona se não tiver token
      } else {
        setAuthorized(true); // permite renderizar o componente
      }
    }, [router]);

    // Enquanto não verificou, mostra loader
    if (authorized === null) return <p>Carregando...</p>;

    return authorized ? <Component {...props} /> : null;
  };
}
