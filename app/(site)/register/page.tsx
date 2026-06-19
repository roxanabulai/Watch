import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <div className="container space-y-6 py-16">
      <div className="text-center">
        <p className="text-sm uppercase text-muted-foreground">Join the saleroom</p>
        <h1 className="font-serif text-4xl font-semibold">Create account</h1>
      </div>
      <AuthForm mode="register" />
      <p className="text-center text-sm text-muted-foreground">Already registered? <Link className="underline" href="/login">Sign in</Link></p>
    </div>
  );
}
