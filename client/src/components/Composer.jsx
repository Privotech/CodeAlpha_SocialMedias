import { useState } from 'react';
import { ImageIcon, Send } from 'lucide-react';
import { api } from '../lib/api.js';
import { Avatar } from './Avatar.jsx';

export function Composer({ user, onCreated }) {
  const [text, setText] = useState(""),
    [file, setFile] = useState(null),
    [busy, setBusy] = useState(false),
    [err, setErr] = useState("");
  async function send(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const body = new FormData();
      body.append("content", text);
      if (file) body.append("image", file);
      const { data } = await api.post("/posts", body);
      onCreated(data.post);
      setText("");
      setFile(null);
      e.target.reset();
    } catch (e) {
      setErr(e.response?.data?.message || "Could not share your post");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="composer" onSubmit={send}>
      <div className="composer-row">
        <Avatar user={user} />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength="2000"
          placeholder="What’s on your mind, {user.displayName.split(' ')[0]}?"
        />
      </div>
      {file && (
        <div className="file-chip">
          {file.name}
          <button type="button" onClick={() => setFile(null)}>
            ×
          </button>
        </div>
      )}
      {err && <div className="error-box">{err}</div>}
      <div className="composer-tools">
        <label className="attach-btn">
          <ImageIcon size={17} /> Add a photo
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>
        <span className="char-count">{text.length}/2000</span>
        <button
          className="btn primary small"
          disabled={busy || (!text.trim() && !file)}
        >
          {busy ? "Sharing…" : "Share a thought"}
          <Send size={14} />
        </button>
      </div>
    </form>
  );
}

