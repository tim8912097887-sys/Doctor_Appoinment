import FormRoot from "./Form";
import FormButton from "./FormButton";
import FormField from "./FormField";

export const FormObject = Object.assign(FormRoot,{
    Field: FormField,
    Button: FormButton
})