import type { LoginUserType } from "@/validations/login";
import type { CreateUserType } from "@/validations/signup";
import type { VerifyAccountType } from "@/validations/verify";

const BASE_URL = "http://localhost:3000/api/v1/auth"

export const login = async(userInfo: LoginUserType) => {
    const response = await fetch(`${BASE_URL}/login`,{
        method: "POST",
        body: JSON.stringify(userInfo),
        headers: {
            "Content-Type": "application/json"
        },
    });
    const data = await response.json();
    if(!response.ok) {
         throw new Error(data.error.detail);
    }
    return data.data;
}

export const signup = async(userInfo: CreateUserType) => {
    const response = await fetch(`${BASE_URL}/signup`,{
        method: "POST",
        body: JSON.stringify(userInfo),
        headers: {
            "Content-Type": "application/json"
        },
    });
    const data = await response.json();
    if(!response.ok) {
         throw new Error(data.error.detail);
    }
    return data.data;
}

export const verifyAccount = async(verifyInfo: VerifyAccountType) => {
    const response = await fetch(`${BASE_URL}/verification`,{
        method: "POST",
        body: JSON.stringify(verifyInfo),
        headers: {
            "Content-Type": "application/json"
        },
    });
    const data = await response.json();
    if(!response.ok) {
         throw new Error(data.error.detail);
    }
    return data.data;
}