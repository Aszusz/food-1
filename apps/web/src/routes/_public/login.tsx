import { createFileRoute, Link } from "@tanstack/react-router";
import { ChefHat, ChevronRight } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { appVersion } from "../../app-version";
import { authClient } from "../../auth-client";

export const Route = createFileRoute("/_public/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        setError("That email and password do not match.");
        return;
      }
      window.location.href = "/app";
    } catch {
      setError("The server did not respond. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <p className="eyebrow">Welcome back</p>
      <h2>Come to the table</h2>
      <p className="auth-subtitle">
        Sign in to see what your household is cooking.
      </p>
      <form onSubmit={submit}>
        <AuthFields
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
        />
        {error ? <p className="form-error auth-error">{error}</p> : null}
        <button
          className="primary-button auth-submit"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Signing in..." : "Sign in"} <ChevronRight />
        </button>
      </form>
      <p className="auth-switch">
        New to Household Cookbook? <Link to="/signup">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

export function AuthFields({
  email,
  password,
  setEmail,
  setPassword,
}: {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
}) {
  return (
    <>
      <label htmlFor="email">Email address</label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
      />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        minLength={8}
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="At least 8 characters"
      />
    </>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="brand light-brand">
          <span className="brand-mark">
            <ChefHat />
          </span>
          <div>
            <strong>Household</strong>
            <span className="brand-subtitle">Cookbook</span>
          </div>
        </div>
        <div className="auth-visual-copy">
          <p className="eyebrow">One shared kitchen notebook</p>
          <h1>Good food starts together.</h1>
          <p>
            Recipes, groceries, and cooking steps in one place for everyone at
            home.
          </p>
        </div>
      </section>
      <section className="auth-pane">
        <div className="auth-form">{children}</div>
        <span className="auth-version">v{appVersion}</span>
      </section>
    </main>
  );
}
