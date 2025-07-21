"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function withAuth(Component: React.FC) {
    return function ProtectedComponent(props: any) {
        const router = useRouter();

        useEffect(() => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.replace("/login");
            }
        }, [router]);

        return <Component {...props} />;
    };
}
