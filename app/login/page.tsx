"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@adminlte/react";
import { loginAdmin } from "@/lib/auth";
import { useAuth } from "@/components/auth/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { authorized, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && authorized) router.replace("/dashboard");
  }, [loading, authorized, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await loginAdmin(email.trim(), password);
      router.replace("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign in.";
      setError(message.includes("auth/") ? "Invalid email or password." : message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout authType="login" logo={<strong>Seedlings</strong>} logoHref="/login">
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={submit}>
        <div className="input-group mb-3">
          <input className="form-control" type="email" placeholder="Email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required />
          <span className="input-group-text"><i className="bi bi-envelope" /></span>
        </div>
        <div className="input-group mb-3">
          <input className="form-control" type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
          <span className="input-group-text"><i className="bi bi-lock" /></span>
        </div>
        <button className="btn btn-success w-100" disabled={submitting}>{submitting ? "Signing in..." : "Sign in"}</button>
      </form>
    </AuthLayout>
  );
}
