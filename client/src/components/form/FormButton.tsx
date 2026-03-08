import { useFormContext } from "@hooks/useFormContext";

type Props = {
   submitText?: string
   cancelText?: string
}

const FormButton = ({ submitText="Submit",cancelText="Cancel" }: Props) => {

  const { isSubmitting } = useFormContext();

  return (
    <button
     type="submit"
     disabled={isSubmitting}
     className="bg-purple-400 text-white w-full py-2 rounded-md text-base disabled:text-gray-300"
     >{isSubmitting?cancelText:submitText}</button>
  )
}

export default FormButton