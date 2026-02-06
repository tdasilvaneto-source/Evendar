"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.get("username"), password: form.get("password") })
    });
    if (!res.ok) return setError("Identifiants invalides");
    window.location.href = "/";
  }

  return (
    <div className="card">
      <h2>Connexion interne</h2>
      <form onSubmit={onSubmit}>
        <input name="username" placeholder="Username" />
        <input name="password" placeholder="Password" type="password" />
        <button type="submit">Se connecter</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}
