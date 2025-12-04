"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { register, googleSignIn } from "@/lib/actions/auth.actions";
import { Link } from "@/i18n/navigation";

const initialState = {
  success: false,
  message: "",
  errors: undefined,
  values: undefined,
};

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [state, action, pending] = useActionState(register, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push("/");
    }
  }, [state.success, router]);

  // Create a unique key based on values to force re-render with new defaultValues
  const formKey = JSON.stringify(state.values || {});

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-3xl font-normal text-neutral-950">إنشاء حساب</h2>

      <form key={formKey} action={action} className="flex flex-col gap-3">
        {/* Google Sign Up Button */}
        <Button type="button" variant="outline" onClick={() => googleSignIn()} className="w-full h-12 rounded-lg border-gray-300 bg-white hover:bg-gray-50">
          <svg className="w-4 h-4 ms-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>التسجيل باستخدام Google</span>
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-muted-foreground">أو</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Name Input */}
        <div>
          <Input
            type="text"
            name="name"
            placeholder="الاسم الكامل"
            defaultValue={state.values?.name}
            className={`h-12 rounded-lg bg-[#f3f3f5] border-transparent text-start ${state.errors?.name ? "border-red-500 border" : ""}`}
          />
          {state.errors?.name && <p className="text-sm text-red-500 mt-1">{state.errors.name[0]}</p>}
        </div>

        {/* Email Input */}
        <div>
          <Input
            type="email"
            name="email"
            placeholder="البريد الإلكتروني"
            defaultValue={state.values?.email}
            className={`h-12 rounded-lg bg-[#f3f3f5] border-transparent text-start ${state.errors?.email ? "border-red-500 border" : ""}`}
          />
          {state.errors?.email && <p className="text-sm text-red-500 mt-1">{state.errors.email[0]}</p>}
        </div>

        {/* Password Input */}
        <div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="كلمة المرور"
              className={`h-12 rounded-lg bg-[#f3f3f5] border-transparent text-start pe-10 ${state.errors?.password ? "border-red-500 border" : ""}`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {state.errors?.password ? (
            <p className="text-sm text-red-500 mt-1">{state.errors.password[0]}</p>
          ) : (
            <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>8 أحرف على الأقل</li>
              <li>حرف كبير واحد على الأقل (A-Z)</li>
              <li>حرف صغير واحد على الأقل (a-z)</li>
            </ul>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="تأكيد كلمة المرور"
              className={`h-12 rounded-lg bg-[#f3f3f5] border-transparent text-start pe-10 ${state.errors?.confirmPassword ? "border-red-500 border" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {state.errors?.confirmPassword && <p className="text-sm text-red-500 mt-1">{state.errors.confirmPassword[0]}</p>}
        </div>

        {/* General Error Message */}
        {!state.success && state.message && !state.errors && <p className="text-sm text-red-500 text-center">{state.message}</p>}

        {/* Sign Up Button */}
        <Button type="submit" disabled={pending} className="w-full h-12 rounded-lg">
          {pending ? (
            <>
              <Loader2 className="w-4 h-4 me-2 animate-spin" />
              جاري إنشاء الحساب...
            </>
          ) : (
            "إنشاء حساب"
          )}
        </Button>

        {/* Links */}
        <div className="flex justify-center pt-4">
          <p className="text-sm text-muted-foreground">
            لديك حساب بالفعل؟{" "}
            <Link href="/" className="text-blue-600 hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
