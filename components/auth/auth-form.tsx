"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCsrfToken } from "@/hooks/use-csrf";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const csrf = useCsrfToken();
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password")
    };
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-csrf-token": csrf },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (response.ok) router.push("/dashboard");
    else setMessage(data.error ?? "Authentication failed.");
  }

  return (
    <form action={submit} className="mx-auto grid max-w-md gap-4 rounded-lg border bg-card p-6">
      {mode === "register" ? <div className="grid gap-2"><Label htmlFor="name">Name</Label><Input id="name" name="name" required /></div> : null}
      <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
      <div className="grid gap-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required /></div>
      <Button type="submit">{mode === "login" ? "Sign in" : "Create account"}</Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </form>
  );
}
