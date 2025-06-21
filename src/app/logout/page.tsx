'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";
import Cookies from "js-cookie";
import { useEducator } from "@/context/educatorContext";

export default function Logout() {
    const router = useRouter(); 
    const { fetchUserData } = useUser(); 
    const { fetchEducatorData } = useEducator(); 

    useEffect(() => {
        Cookies.remove("token");      
        fetchUserData();
        fetchEducatorData();               
        router.push("/login");              
    }, [fetchUserData , fetchEducatorData , router]);

    return (
        <h1>Logging out...</h1>
    );
}
