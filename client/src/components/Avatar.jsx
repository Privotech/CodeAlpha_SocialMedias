import { apiOrigin } from '../lib/api.js';

export function Avatar({ user, size = "md" }) {
  return (
    <div
      className={`avatar ${size}`}
      style={
        user?.avatar
          ? { backgroundImage: `url(${apiOrigin}${user.avatar})` }
          : {}
      }
    >
      {!user?.avatar &&
        (user?.displayName || user?.username || "?").slice(0, 1).toUpperCase()}
    </div>
  );
}

