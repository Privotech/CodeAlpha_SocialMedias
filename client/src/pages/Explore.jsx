import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../lib/api.js';
import { PostCard } from '../components/PostCard.jsx';
import { UserCard } from '../components/UserCard.jsx';

export function Explore() {
  const [q, setQ] = useState(
      new URLSearchParams(location.search).get("q") || "",
    ),
    [users, setUsers] = useState([]),
    [posts, setPosts] = useState([]),
    [err, setErr] = useState("");
  useEffect(() => {
    api
      .get("/posts", { params: { explore: true } })
      .then(({ data }) => setPosts(data.posts))
      .catch((e) =>
        setErr(e.response?.data?.message || "Explore is unavailable"),
      );
  }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim())
        api
          .get("/users/search", { params: { q } })
          .then(({ data }) => setUsers(data.users))
          .catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <div className="content-wrap">
      <div className="page-heading">
        <div>
          <span className="eyebrow">A LITTLE INSPIRATION</span>
          <h1>
            Explore<span className="heading-dot">.</span>
          </h1>
          <p>New voices, bright ideas, and people worth knowing.</p>
        </div>
      </div>
      <div className="explore-search">
        <Search size={19} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search people by name or username"
        />
      </div>
      {q && (
        <section className="people-results">
          <h3>People to meet</h3>
          {users.length ? (
            users.map((u) => <UserCard key={u.id} user={u} />)
          ) : (
            <p className="muted-copy">No people found yet.</p>
          )}
        </section>
      )}
      <div className="section-title">
        <div>
          <span className="eyebrow">AROUND THE COMMUNITY</span>
          <h2>Fresh from the community</h2>
        </div>
        <span className="pill">{posts.length} conversations</span>
      </div>
      {err && <div className="error-box">{err}</div>}
      <div className="posts-grid">
        {posts.map((p) => (
          <PostCard key={p._id} post={p} user={{}} />
        ))}
        {!posts.length && !err && (
          <div className="loading">No posts to discover yet.</div>
        )}
      </div>
    </div>
  );
}

