import { FormContext } from "@/contexts"
import { useContext } from "react"
import type useForm from "./useForm";

export const useFormContext = <T extends Record<string,any>>() => {
    const context = useContext(FormContext);
    if(!context) throw new Error("Please use inside provider");
    return context as ReturnType<typeof useForm<T>>;
}