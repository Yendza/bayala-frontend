"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function withAuth(Component: React.FC) {
  return function ProtectedComponent(props: any) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.replace("/login");
      } else {
        setAuthorized(true);
      }
    }, [router]);

    if (authorized === null) return <p>Carregando...</p>; // ainda não checou
    if (!authorized) return null; // redirecionando

    return <Component {...props} />;
  };
}
