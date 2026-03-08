import FormContextProvider from "@/providers/FormContextProvider"
import type { PropsWithChildren } from "react"
import type { ZodObject } from "zod"
import { useFormContext } from "@hooks/useFormContext";

interface FormProps<T extends Record<string,any>> extends PropsWithChildren {
    initialValues: T
    onSubmit: (value: T) => Promise<void>
    schemaType: ZodObject<any>
}

const InternalForm = ({ children }: PropsWithChildren) => {
  const { handleSubmit } = useFormContext(); // Now this works!

  return (
    <form onSubmit={handleSubmit} className="min-h-[80vh] flex items-center" noValidate>
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-85 sm:min-w-96 rounded-xl text-zinc-600 text-sm shadow-lg">
        {children}
      </div>
    </form>
  );
};

const Form = <T extends Record<string,any>>({ initialValues,onSubmit,children,schemaType }: FormProps<T>) => {
  return (
    <FormContextProvider initialValues={initialValues} onSubmit={onSubmit} schemaType={schemaType}>
        <InternalForm>
          {children}
        </InternalForm>
    </FormContextProvider>
  )
}

export default Form