import { useEffect, useState } from 'react';
import { CheckCheck, LoaderCircle } from 'lucide-react';
import { api } from '../lib/api.js';
import { Avatar } from '../components/Avatar.jsx';

export function Notifications() {
  const [items, setItems] = useState([]),
    [loading, setLoading] = useState(true),
    [err, setErr] = useState("");
  useEffect(() => {
    api
      .get("/notifications")
      .then(({ data }) => setItems(data.notifications))
      .catch((e) =>
        setErr(e.response?.data?.message || "Could not load notifications"),
      )
      .finally(() => setLoading(false));
  }, []);
  async function readAll() {
    try { await api.put("/notifications/read-all"); setItems(cur => cur.map(item => ({ ...item, read: true }))); }
    catch (e) { setErr(e.response?.data?.message || "Could not mark all as read"); }
  }
  async function read(n) {
    if (n.read) return;
    try {
      await api.put(`/notifications/${n._id}/read`);
      setItems(cur => cur.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
    } catch (e) {
      setErr(e.response?.data?.message);
    }
  }
  return (
    <div className="content-wrap narrow">
      <div className="page-heading">
        <div>
          <span className="eyebrow">GOOD THINGS HAPPEN HERE</span>
          <h1>
            Notifications<span className="heading-dot">.</span>
          </h1>
          <p>Little reminders that you are part of something.</p>
          {items.some(item => !item.read) && <button className="btn soft small" onClick={readAll}><CheckCheck size={14}/> Mark all read</button>}
        </div>
      </div>
      {err && <div className="error-box">{err}</div>}
      {loading ? (
        <div className="loading">
          <LoaderCircle className="spin" /> Gathering the good news…
        </div>
      ) : items.length ? (
        items.map((n) => (
          <button
            key={n._id}
            className={`notification-item ${n.read ? "" : "unread"}`}
            onClick={() => read(n)}
          >
            <Avatar user={n.actor || { displayName: "C" }} />
            <span>
              <b>{n.message}</b>
              <small>{new Date(n.createdAt).toLocaleString()}</small>
            </span>
            {!n.read && <i />}
          </button>
        ))
      ) : (
        <div className="empty">
          <div>✳</div>
          <h3>All caught up.</h3>
          <p>When your people show up, you will hear about it here.</p>
        </div>
      )}
    </div>
  );
}

