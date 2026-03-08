import { useFormContext } from "@hooks/useFormContext";

type Props = {
   name: string
   label: string
   type?: string
   placeholder: string
   required?: boolean
}

const FormField = ({ name,label,type="text",placeholder,required=false }: Props) => {
  
  const { handleBlur,handleChange,touched,errors,value } = useFormContext();
  return (
    <div className="w-full">
       {
        label && 
        <label htmlFor={name}>
            {label}
            {required && <span>*</span>}
        </label>
       }
       <input
           id={name}
           type={type}
           name={name}
           placeholder={placeholder}
           value={value[name]}
           required={required}
           onChange={(e) => handleChange(e.target.name,e.target.value)}
           onBlur={(e) => handleBlur(e.target.name)}
           className="border border-zinc-300 rounded p-2 mt-1 w-full"
        />
        {touched[name] && errors[name] && <span className="text-red-500">{errors[name]}</span>}
    </div>
  )
}

export default FormField