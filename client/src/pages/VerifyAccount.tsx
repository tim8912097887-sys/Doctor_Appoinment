import { verifyAccount } from "@/apis/auth";
import Form from "@/components/form/Form";
import FormButton from "@/components/form/FormButton";
import { VerifyAccountSchema, type VerifyAccountType } from "@/validations/verify";
import { Link, useNavigate, useSearchParams } from "react-router"

const VerifyAccount = () => {
    
    const navigation = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const userId = searchParams.get("uid");
    // UI for missing or malformed URL parameters
    if (!token || !userId) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center p-6">
                <div className="bg-red-50 text-red-500 p-4 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-zinc-800">Invalid Verification Link</h1>
                <p className="text-zinc-600 max-w-sm">
                    This link appears to be broken or incomplete. Please check your email again or request a new verification link.
                </p>
                <Link to="/signup" className="text-purple-500 underline font-medium mt-2">
                    Back to SignUp
                </Link>
            </div>
        );
    }
    const initialValues = {
        token,
        userId
    }
    const handleVerify = async(verifyInfo: VerifyAccountType) => {
         await verifyAccount(verifyInfo);
         navigation("/login");
    }
  return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Form initialValues={initialValues} onSubmit={handleVerify} schemaType={VerifyAccountSchema}>
                <div className="text-center mb-4">
                    <h1 className="text-2xl font-semibold text-zinc-800">Verify Your Account</h1>
                    <p className="text-zinc-500">Click the button below to activate your appointment booking account.</p>
                </div>
                <FormButton submitText="Confirm Verification" />
            </Form>
        </div>
  )
}

export default VerifyAccount