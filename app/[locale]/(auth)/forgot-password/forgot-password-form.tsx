"use client";

import { useActionState, useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import {
  sendOtp,
  verifyOtp,
  resetPasswordByOtp,
} from "@/lib/actions/auth.actions";

type Step = "email" | "otp" | "password";

const initialState = {
  success: false,
  message: "",
  errors: undefined,
  values: undefined,
};

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendPending, startResendTransition] = useTransition();
  const router = useRouter();

  // Step 1: Send OTP
  const [emailState, emailAction, emailPending] = useActionState(
    sendOtp,
    initialState
  );

  // Step 2: Verify OTP
  const [otpState, otpAction, otpPending] = useActionState(
    verifyOtp,
    initialState
  );

  // Step 3: Reset Password
  const [passwordState, passwordAction, passwordPending] = useActionState(
    resetPasswordByOtp,
    initialState
  );

  // Handle step transitions
  useEffect(() => {
    if (emailState.success) {
      setStep("otp");
    }
  }, [emailState.success]);

  useEffect(() => {
    if (otpState.success) {
      setStep("password");
    }
  }, [otpState.success]);

  useEffect(() => {
    if (passwordState.success) {
      router.push("/");
    }
  }, [passwordState.success, router]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResendOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    const formData = new FormData();
    formData.append("email", email);
    startResendTransition(() => {
      sendOtp(initialState, formData);
    });
  };

  const renderStep = () => {
    switch (step) {
      case "email":
        return (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-normal text-neutral-950">
                نسيت كلمة المرور؟
              </h2>
              <p className="text-sm text-muted-foreground">
                أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق
              </p>
            </div>

            <form action={emailAction} className="flex flex-col gap-3">
              <div>
                <Input
                  type="email"
                  name="email"
                  placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`h-12 rounded-lg bg-[#f3f3f5] border-transparent text-start ${
                    emailState.errors?.email ? "border-red-500 border" : ""
                  }`}
                />
                {emailState.errors?.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {emailState.errors.email[0]}
                  </p>
                )}
              </div>

              {!emailState.success && emailState.message && !emailState.errors && (
                <p className="text-sm text-red-500 text-center">
                  {emailState.message}
                </p>
              )}

              <Button
                type="submit"
                disabled={!email.trim() || emailPending}
                className="w-full h-12 rounded-lg"
              >
                {emailPending ? (
                  <>
                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  "إرسال رمز التحقق"
                )}
              </Button>

              <div className="flex justify-center pt-4">
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ArrowRight className="w-4 h-4" />
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </form>
          </div>
        );

      case "otp":
        return (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-normal text-neutral-950">
                رمز التحقق
              </h2>
              <p className="text-sm text-muted-foreground">
                أدخل الرمز المكون من 6 أرقام المرسل إلى {email}
              </p>
            </div>

            <form action={otpAction} className="flex flex-col gap-3">
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="otp" value={otp.join("")} />

              <div className="flex gap-2 justify-center" dir="ltr">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={`w-12 h-12 text-center text-lg rounded-lg bg-[#f3f3f5] border-transparent ${
                      otpState.errors?.otp ? "border-red-500 border" : ""
                    }`}
                  />
                ))}
              </div>

              {otpState.errors?.otp && (
                <p className="text-sm text-red-500 text-center">
                  {otpState.errors.otp[0]}
                </p>
              )}

              {!otpState.success && otpState.message && !otpState.errors && (
                <p className="text-sm text-red-500 text-center">
                  {otpState.message}
                </p>
              )}

              <Button
                type="submit"
                disabled={!otp.every((digit) => digit !== "") || otpPending}
                className="w-full h-12 rounded-lg"
              >
                {otpPending ? (
                  <>
                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  "تأكيد"
                )}
              </Button>

              <div className="flex flex-col items-center gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendPending}
                  className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  {resendPending ? "جاري الإرسال..." : "لم تستلم الرمز؟ إعادة الإرسال"}
                </button>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ArrowRight className="w-4 h-4" />
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </form>
          </div>
        );

      case "password":
        return (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-normal text-neutral-950">
                كلمة المرور الجديدة
              </h2>
              <p className="text-sm text-muted-foreground">
                أدخل كلمة المرور الجديدة
              </p>
            </div>

            <form action={passwordAction} className="flex flex-col gap-3">
              <input type="hidden" name="email" value={email} />

              <div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="كلمة المرور الجديدة"
                    className={`h-12 rounded-lg bg-[#f3f3f5] border-transparent text-start pe-10 ${
                      passwordState.errors?.password ? "border-red-500 border" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {passwordState.errors?.password ? (
                  <p className="text-sm text-red-500 mt-1">
                    {passwordState.errors.password[0]}
                  </p>
                ) : (
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>8 أحرف على الأقل</li>
                    <li>حرف كبير واحد على الأقل (A-Z)</li>
                    <li>حرف صغير واحد على الأقل (a-z)</li>
                    <li>رقم واحد على الأقل (0-9)</li>
                  </ul>
                )}
              </div>

              <div>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="تأكيد كلمة المرور"
                    className={`h-12 rounded-lg bg-[#f3f3f5] border-transparent text-start pe-10 ${
                      passwordState.errors?.confirmPassword
                        ? "border-red-500 border"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {passwordState.errors?.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {passwordState.errors.confirmPassword[0]}
                  </p>
                )}
              </div>

              {!passwordState.success &&
                passwordState.message &&
                !passwordState.errors && (
                  <p className="text-sm text-red-500 text-center">
                    {passwordState.message}
                  </p>
                )}

              <Button
                type="submit"
                disabled={passwordPending}
                className="w-full h-12 rounded-lg"
              >
                {passwordPending ? (
                  <>
                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                    جاري التغيير...
                  </>
                ) : (
                  "تغيير كلمة المرور"
                )}
              </Button>

              <div className="flex justify-center pt-4">
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ArrowRight className="w-4 h-4" />
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </form>
          </div>
        );
    }
  };

  return renderStep();
}
