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
        setError(
          "Nie udało się utworzyć konta. Sprawdź dane i spróbuj ponownie.",
        );
        return;
      }
      window.location.href = "/app";
    } catch {
      setError("Serwer nie odpowiada. Spróbuj ponownie.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <p className="eyebrow">Nakryj do stołu</p>
      <h2>Utwórz konto</h2>
      <p className="auth-subtitle">
        Następnie utwórz grupę domowników albo dołącz do osób, z którymi
        gotujesz.
      </p>
      <form onSubmit={submit}>
        <label htmlFor="name">Imię</label>
        <input
          id="name"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Jan Kowalski"
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
          {submitting ? "Tworzenie konta..." : "Utwórz konto"} <ChevronRight />
        </button>
      </form>
      <p className="auth-switch">
        Masz już konto? <Link to="/login">Zaloguj się</Link>
      </p>
    </AuthLayout>
  );
}
