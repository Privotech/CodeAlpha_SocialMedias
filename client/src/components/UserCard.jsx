import { Link } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../lib/api.js';
import { Avatar } from './Avatar.jsx';

export function UserCard({ user }) {
  const [following, setFollowing] = useState(!!user.isFollowing);
  async function toggle() {
    try {
      await api({
        method: following ? "delete" : "post",
        url: `/users/${user.id || user._id}/follow`,
      });
      setFollowing(!following);
    } catch {}
  }
  return (
    <div className="user-card">
      <Link to={`/profile/${user.username}`} className="author-line">
        <Avatar user={user} />
        <span>
          <b>{user.displayName}</b>
          <small>
            @{user.username} · {user.followersCount || 0} followers
          </small>
        </span>
      </Link>
      <button
        onClick={toggle}
        className={`btn ${following ? "soft" : "outline"} small`}
      >
        {following ? "Following" : "Follow"}
      </button>
    </div>
  );
}

