import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { authClient } from "../../auth-client";
import { AuthFields, AuthLayout } from "./login";

export const Route = createFileRoute("/_public/signup")({
  component: SignupPage,
});

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await authClient.signUp.email({ email, password, name });
      if (result.error) {
        setError(result.error.message ?? "Your account could not be created.");
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
      <p className="eyebrow">Set the table</p>
      <h2>Create your account</h2>
      <p className="auth-subtitle">
        Then create a household or join someone you cook with.
      </p>
      <form onSubmit={submit}>
        <label htmlFor="name">Your name</label>
        <input
          id="name"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Alex Parker"
        />
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
          {submitting ? "Creating account..." : "Create account"}{" "}
          <ChevronRight />
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
