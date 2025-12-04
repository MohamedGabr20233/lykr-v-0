import { AuthLayout } from "@/components/layout/auth-layout";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout headline="استعادة كلمة المرور">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
