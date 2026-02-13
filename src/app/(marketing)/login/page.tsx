import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign in - Actant",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <LoginForm />
    </div>
  );
}
