import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { api } from '../lib/api.js';
import { Avatar } from '../components/Avatar.jsx';
import { PostCard } from '../components/PostCard.jsx';

export function Profile({ current }) {
  const { username } = useParams(),
    [data, setData] = useState(null),
    [err, setErr] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get(`/users/${username}`)
      .then(({ data }) => setData(data))
      .catch((e) => setErr(e.response?.data?.message || "Profile unavailable"))
      .finally(() => setLoading(false));
  }, [username]);
  async function follow() {
    try {
      await api({
        method: data.isFollowing ? "delete" : "post",
        url: `/users/${data.user.id}/follow`,
      });
      setData({
        ...data,
        isFollowing: !data.isFollowing,
        user: {
          ...data.user,
          followersCount:
            data.user.followersCount + (data.isFollowing ? -1 : 1),
        },
      });
    } catch (e) {
      setErr(e.response?.data?.message);
    }
  }
  if (loading)
    return (
      <div className="loading">
        <LoaderCircle className="spin" />
      </div>
    );
  if (err && !data)
    return (
      <div className="empty">
        <h3>{err}</h3>
        <Link to="/explore" className="btn primary">
          Back to explore
        </Link>
      </div>
    );
  const own = data.user.username === current.username;
  return (
    <div className="content-wrap">
      <div className="profile-cover">
        <div className="profile-avatar">
          <Avatar user={data.user} size="lg" />
        </div>
        <div className="profile-actions">
          {own ? (
            <Link to="/settings" className="btn outline small">
              Edit profile
            </Link>
          ) : (
            <button
              onClick={follow}
              className={`btn ${data.isFollowing ? "soft" : "primary"} small`}
            >
              {data.isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>
      </div>
      <div className="profile-info">
        <h1>
          {data.user.displayName}
          <span className="heading-dot">.</span>
        </h1>
        <span className="username">@{data.user.username}</span>
        <p>{data.user.bio || "Still finding the words. ✳"}</p>
        <div className="profile-stats">
          <span>
            <b>{data.posts.length}</b> posts
          </span>
          <span>
            <b>{data.user.followersCount}</b> followers
          </span>
          <span>
            <b>{data.user.followingCount}</b> following
          </span>
        </div>
      </div>
      <div className="section-title profile-post-title">
        <div>
          <span className="eyebrow">THEIR CORNER OF CONNECTHUB</span>
          <h2>Posts</h2>
        </div>
      </div>
      {data.posts.map((p) => (
        <PostCard key={p._id} post={p} user={current} />
      ))}
      {!data.posts.length && (
        <div className="empty">
          <div>✳</div>
          <h3>No posts here just yet.</h3>
        </div>
      )}
    </div>
  );
}

