import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="container space-y-6 py-16">
      <div className="text-center">
        <p className="text-sm uppercase text-muted-foreground">Welcome back</p>
        <h1 className="font-serif text-4xl font-semibold">Sign in</h1>
      </div>
      <AuthForm mode="login" />
      <p className="text-center text-sm text-muted-foreground">New here? <Link className="underline" href="/register">Create an account</Link></p>
    </div>
  );
}
