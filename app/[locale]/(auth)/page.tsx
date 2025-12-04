import { AuthLayout } from "@/components/layout/auth-layout";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <AuthLayout headline="أتمتة عملية المبيعات الخاصة بك">
      <LoginForm />
    </AuthLayout>
  );
}
