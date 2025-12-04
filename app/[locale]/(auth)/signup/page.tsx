import { AuthLayout } from "@/components/layout/auth-layout";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <AuthLayout headline="انضم إلينا وابدأ رحلتك">
      <SignupForm />
    </AuthLayout>
  );
}
