import { signup } from "@/apis/auth"
import { FormObject } from "@/components/form"
import Form from "@/components/form/Form"
import { CreateUserSchema, type CreateUserType } from "@/validations/signup"
import { Link, useNavigate } from "react-router"

const Signup = () => {
  const initialValues: CreateUserType = { 
    firstName: "", 
    lastName: "", 
    email: "", 
    password: "" 
  };
  const navigation = useNavigate();
  const handleSignup = async(userInfo: CreateUserType) => {
      await signup(userInfo);
      navigation("/login");
  }
  return (
    <div className="">
      <Form initialValues={initialValues} onSubmit={handleSignup} schemaType={CreateUserSchema}>
         <p className="text-2xl font-semibold">Create Account</p>
         <p>Please signup to book appointment</p>
         <FormObject.Field name="firstName" placeholder="ex: John..." required={false} type="text" label="FirstName" />
         <FormObject.Field name="lastName" placeholder="ex: Doe..." required={false} type="text" label="LastName" />
         <FormObject.Field name="email" placeholder="ex: johndoe@gmail.com..." required={false} type="email" label="Email" />
         <FormObject.Field name="password" placeholder="ex: 123456..." required={false} type="password" label="Password" />
         <FormObject.Button submitText="Submit" cancelText="Cancel" />
         <p>Already have an account? <Link to="/login" className="text-purple-400 underline cursor-pointer">Login here</Link></p>
      </Form>
    </div>
  )
}

export default Signup