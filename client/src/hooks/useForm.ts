import { useCallback, useState } from "react"

// T extends Record<string, any> ensures it's an object
const useForm = <T extends Record<string, any>>({ 
  initialValues, 
  onSubmit, 
  validate 
}: {
  initialValues: T
  onSubmit: (values: T) => Promise<void>
  validate: (values: T) => Partial<Record<keyof T | "submit", string>>
}) => {
    const [value, setValue] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T | "submit", string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback((name: keyof T, val: any) => {
        setValue(pre => ({ ...pre, [name]: val }));
        setErrors((pre) => {
            const newErrors = { ...pre };
            delete newErrors[name as any];
            return newErrors;
        });
    }, []);

    const handleBlur = useCallback((name: keyof T) => {
        setTouched(pre => ({ ...pre, [name]: true }));
        const fieldError = validate({ ...value });
        if (fieldError[name as keyof T]) {
            setErrors(pre => ({ ...pre, [name]: fieldError[name as keyof T] }));
        }
    }, [value, validate]);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        const validationErrors = validate(value);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).filter(k => k !== 'submit').length > 0) {
            const allTouched = Object.keys(value).reduce((acc, key) => ({ ...acc, [key]: true }), {});
            setTouched(allTouched);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(value);
        } catch (error) {
            setErrors(pre => ({ ...pre, submit: "Submit Fail" }));
        } finally {
            setIsSubmitting(false);
        }
    }

    return { handleChange, handleBlur, handleSubmit, isSubmitting, resetForm: () => setValue(initialValues), errors, touched, value };
}

export default useForm;