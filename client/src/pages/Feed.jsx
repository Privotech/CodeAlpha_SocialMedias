import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowUpRight, LoaderCircle, Feather } from 'lucide-react';
import { api } from '../lib/api.js';
import { Composer } from '../components/Composer.jsx';
import { PostCard } from '../components/PostCard.jsx';

export function Feed({ user }) {
  const [posts, setPosts] = useState([]),
    [loading, setLoading] = useState(true),
    [err, setErr] = useState(""),
    [page, setPage] = useState(1),
    [more, setMore] = useState(false),
    [source, setSource] = useState("following");
  async function load(p = 1, feed = source) {
    try {
      setErr("");
      const { data } = await api.get("/posts", { params: { page: p, feed } });
      setPosts((old) => (p === 1 ? data.posts : [...old, ...data.posts]));
      setMore(data.hasMore);
      setPage(p);
    } catch (e) {
      setErr(e.response?.data?.message || "Could not load your feed");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="content-wrap feed-wrap">
      <div className="page-heading">
        <div>
          <span className="eyebrow">MONDAY, YOUR WAY</span>
          <h1>
            Your feed<span className="heading-dot">.</span>
          </h1>
          <p>A little window into the lives of your people.</p>
        </div>
        <Link to={`/profile/${user.username}`} className="btn soft">
          <Feather size={15} /> Your profile
        </Link>
      </div>
      <Composer onCreated={(p) => setPosts([p, ...posts])} user={user} />
      <div className="feed-tabs">
        <button className={source === "for-you" ? "selected" : ""} onClick={() => { setSource("for-you"); load(1, "for-you"); }}>For you</button>
        <button className={source === "following" ? "selected" : ""} onClick={() => { setSource("following"); load(1, "following"); }}>Following</button>
        <span className="feed-tab-note">Your people, all in one place</span>
      </div>
      {err && (
        <div className="error-box">
          {err} <button onClick={() => load(1, source)}>Try again</button>
        </div>
      )}
      {loading ? (
        <div className="loading">
          <LoaderCircle className="spin" /> Finding your people…
        </div>
      ) : posts.length ? (
        posts.map((p) => (
          <PostCard
            key={p._id}
            post={p}
            user={user}
            onDelete={(id) => setPosts(posts.filter((x) => x._id !== id))}
          />
        ))
      ) : (
        <div className="empty">
          <div>✳</div>
          <h3>Your feed is taking a breath.</h3>
          <p>Follow a few people in Explore to see what they are sharing.</p>
          <Link to="/explore" className="btn primary">
            Find your people <ArrowUpRight size={16} />
          </Link>
        </div>
      )}
      {more && (
        <button className="btn soft load-more" onClick={() => load(page + 1, source)}>
          Show me more
        </button>
      )}
      <footer className="tiny-footer">
        A good place to be. <span>✳</span>
      </footer>
    </div>
  );
}

