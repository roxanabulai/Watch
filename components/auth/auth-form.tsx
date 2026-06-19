"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCsrfToken } from "@/hooks/use-csrf";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setMessage("");
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      password: String(formData.get("password") ?? "")
    };
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-csrf-token": getCsrfToken() },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setMessage(data.error ?? "Authentication failed.");
      }
    } catch {
      setMessage("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={submit} className="mx-auto grid max-w-md gap-4 rounded-lg border bg-card p-6">
      {mode === "register" ? <div className="grid gap-2"><Label htmlFor="name">Name</Label><Input id="name" name="name" required /></div> : null}
      <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
      <div className="grid gap-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required /></div>
      <Button type="submit" disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </form>
  );
}
