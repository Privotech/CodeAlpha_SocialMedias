import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { api } from './lib/api.js';
import { Landing } from './pages/Landing.jsx';
import { Auth } from './pages/Auth.jsx';
import { Shell } from './components/Shell.jsx';

export default function App() {
  const [user, setUser] = useState(
      JSON.parse(localStorage.getItem("ch_user") || "null"),
    ),
    [boot, setBoot] = useState(!!localStorage.getItem("ch_token"));
  useEffect(() => {
    if (!localStorage.getItem("ch_token")) return;
    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("ch_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("ch_token");
        localStorage.removeItem("ch_user");
        setUser(null);
      })
      .finally(() => setBoot(false));
  }, []);
  function signed(u, t) {
    localStorage.setItem("ch_token", t);
    localStorage.setItem("ch_user", JSON.stringify(u));
    setUser(u);
  }
  function logout() {
    localStorage.removeItem("ch_token");
    localStorage.removeItem("ch_user");
    setUser(null);
  }
  if (boot)
    return (
      <div className="screen-center">
        <LoaderCircle className="spin" />
      </div>
    );
  return (
    <Routes>
      <Route path="/login" element={<Auth mode="login" onAuth={signed} />} />
      <Route
        path="/register"
        element={<Auth mode="register" onAuth={signed} />}
      />
      <Route
        path="*"
        element={user ? <Shell user={user} onLogout={logout} /> : <Landing />}
      />
    </Routes>
  );
}
