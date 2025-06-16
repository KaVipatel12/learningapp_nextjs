'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";
import Cookies from "js-cookie";

export default function Logout() {
    const router = useRouter(); 
    const { fetchUserData } = useUser(); 

    useEffect(() => {
        Cookies.remove("token");      
        fetchUserData();               
        router.push("/");              
    }, []);

    return (
        <h1>Logging out...</h1>
    );
}
