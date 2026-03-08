import useForm from "@/hooks/useForm"
import { schemaValidator } from "@/utils/schemaValidator"
import { FormContext } from "@contexts/index"
import type { PropsWithChildren } from "react"
import type { ZodObject } from "zod"


interface FormProviderProps<T extends Record<string, any>> extends PropsWithChildren {
    initialValues: T
    onSubmit: (values: T) => Promise<void>
    schemaType: ZodObject<any>
}

const FormContextProvider = <T extends Record<string, any>>({ children,initialValues,onSubmit,schemaType }: FormProviderProps<T>) => {

  const validate = (value: T) => schemaValidator(schemaType)(value);
  const formState = useForm<T>({ initialValues,onSubmit,validate })

  return (
    <FormContext value={formState}>
        {children}
    </FormContext>
  )
}

export default FormContextProvider