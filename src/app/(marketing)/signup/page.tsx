import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Sign up - Actant",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <SignupForm />
    </div>
  );
}
