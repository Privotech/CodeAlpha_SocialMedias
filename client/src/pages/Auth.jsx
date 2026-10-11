import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { api } from '../lib/api.js';

export function Auth({ mode, onAuth }) {
  const reg = mode === "register",
    [form, setForm] = useState({}),
    [err, setErr] = useState(""),
    [busy, setBusy] = useState(false),
    nav = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const { data } = await api.post(`/auth/${mode}`, form);
      onAuth(data.user, data.token);
      nav("/feed");
    } catch (x) {
      setErr(x.response?.data?.message || "Could not connect to ConnectHub");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <Link to="/" className="brand">
        <span className="brand-mark">
          <Sparkles size={18} />
        </span>
        connecthub
      </Link>
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">
          {reg ? "YOUR PEOPLE ARE HERE" : "WELCOME BACK"}
        </span>
        <h1>{reg ? "Make yourself at home." : "Good to see you."}</h1>
        <p>
          {reg
            ? "Create an account and find your community."
            : "Pick up right where you left off."}
        </p>
        {reg && (
          <>
            <label>
              Display name
              <input
                required
                maxLength="60"
                placeholder="Maya Chen"
                onChange={(e) =>
                  setForm({ ...form, displayName: e.target.value })
                }
              />
            </label>
            <label>
              Username
              <input
                required
                minLength="3"
                placeholder="maya"
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </label>
          </>
        )}
        <label>
          Email
          <input
            required
            type="email"
            placeholder="you@example.com"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Password
          <input
            required
            minLength="8"
            type="password"
            placeholder="At least 8 characters"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        {err && <div className="error-box">{err}</div>}
        <button className="btn primary full" disabled={busy}>
          {busy ? "One moment…" : reg ? "Join ConnectHub" : "Log in"}{" "}
          <ArrowUpRight size={16} />
        </button>
        <div className="auth-switch">
          {reg ? "Already part of the community?" : "New around here?"}{" "}
          <Link to={reg ? "/login" : "/register"}>
            {reg ? "Log in" : "Create an account"}
          </Link>
        </div>
      </form>
      <div className="auth-foot">A quieter corner of the internet. ✳</div>
    </div>
  );
}

