import { login } from "@/apis/auth"
import { FormObject } from "@/components/form"
import Form from "@/components/form/Form"
import { LoginUserSchema, type LoginUserType } from "@/validations/login"
import { Link } from "react-router"

const Login = () => {

  const initialValues: LoginUserType = { 
      email: "", 
      password: "" 
  };
  const handleLogin = async(userInfo: LoginUserType) => {
      const data = await login(userInfo);
  }
  return (
    <div className="">
      <Form initialValues={initialValues} onSubmit={handleLogin} schemaType={LoginUserSchema}>
         <p className="text-2xl font-semibold">Login</p>
         <p>Please login to book appointment</p>
         <FormObject.Field name="email" placeholder="ex: johndoe@gmail.com..." required={false} type="email" label="Email" />
         <FormObject.Field name="password" placeholder="ex: 123456..." required={false} type="password" label="Password" />
         <FormObject.Button submitText="Submit" cancelText="Cancel" />
         <p>Create an new account? <Link to="/signup" className="text-purple-400 underline cursor-pointer">Click here</Link></p>
      </Form>
    </div>
  )
}

export default Login