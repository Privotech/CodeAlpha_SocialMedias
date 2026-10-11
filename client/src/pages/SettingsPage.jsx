import { useState } from 'react';
import { Settings, Check } from 'lucide-react';
import { api } from '../lib/api.js';
import { Avatar } from '../components/Avatar.jsx';

export function SettingsPage({ user, onUpdate }) {
  const [displayName, setName] = useState(user.displayName),
    [bio, setBio] = useState(user.bio || ""),
    [avatar, setAvatar] = useState(null),
    [msg, setMsg] = useState(""),
    [err, setErr] = useState(""),
    [busy, setBusy] = useState(false);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const f = new FormData();
      f.append("displayName", displayName);
      f.append("bio", bio);
      if (avatar) f.append("avatar", avatar);
      await api.put("/users/profile", f);
      setMsg("Your profile has been saved.");
      onUpdate();
    } catch (e) {
      setErr(e.response?.data?.message || "Could not save profile");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="content-wrap narrow">
      <div className="page-heading">
        <div>
          <span className="eyebrow">MAKE YOURSELF AT HOME</span>
          <h1>
            Settings<span className="heading-dot">.</span>
          </h1>
          <p>A few details about you.</p>
        </div>
      </div>
      <form className="settings-card" onSubmit={save}>
        <div className="settings-avatar">
          <Avatar user={user} size="lg" />
          <label className="btn soft small">
            Change photo
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files[0])}
            />
          </label>
        </div>
        <label>
          Display name
          <input
            value={displayName}
            maxLength="60"
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Bio
          <textarea
            value={bio}
            maxLength="240"
            onChange={(e) => setBio(e.target.value)}
            placeholder="A little about you…"
          />
          <small>{bio.length}/240</small>
        </label>
        {msg && <div className="success-box">{msg}</div>}
        {err && <div className="error-box">{err}</div>}
        <button className="btn primary">
          {busy ? "Saving…" : "Save changes"} <Check size={16} />
        </button>
      </form>
    </div>
  );
}

