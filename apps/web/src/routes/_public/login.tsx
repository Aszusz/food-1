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
        setError("Nieprawidłowy adres e-mail lub hasło.");
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
      <p className="eyebrow">Witaj ponownie</p>
      <h2>Zapraszamy do stołu</h2>
      <p className="auth-subtitle">
        Zaloguj się i sprawdź, co gotują twoi domownicy.
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
          {submitting ? "Logowanie..." : "Zaloguj się"} <ChevronRight />
        </button>
      </form>
      <p className="auth-switch">
        Nie masz jeszcze konta? <Link to="/signup">Utwórz konto</Link>
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
      <label htmlFor="email">Adres e-mail</label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
      />
      <label htmlFor="password">Hasło</label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        minLength={8}
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Co najmniej 8 znaków"
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
            <strong>Domowa</strong>
            <span className="brand-subtitle">książka kucharska</span>
          </div>
        </div>
        <div className="auth-visual-copy">
          <p className="eyebrow">Jeden wspólny zeszyt kuchenny</p>
          <h1>Dobre jedzenie zaczyna się od wspólnego gotowania.</h1>
          <p>
            Przepisy, zakupy i instrukcje gotowania w jednym miejscu dla
            wszystkich domowników.
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
