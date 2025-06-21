"use client"

import ErrorPage from "@/components/ErrorPage";
import { useParams } from "next/navigation";

export default function Unauthorized(){

    const { role } = useParams();   
    
    const error = {
        message : role === "educator" ? "Educators can't access this page. Only students can access it" : "Users can't access this page. Only Authorized users can access it"
    } 

    return(
        <ErrorPage error={error}></ErrorPage>
    )
}