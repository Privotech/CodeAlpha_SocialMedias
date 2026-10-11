import { Link, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Compass, House, UserRound, Settings, Bell, Search, Plus, LogOut, Sparkles, MessageCircle, Bookmark } from 'lucide-react';
import { api } from '../lib/api.js';
import { Avatar } from './Avatar.jsx';
import { Side } from './SideLink.jsx';
import { Feed } from '../pages/Feed.jsx';
import { Explore } from '../pages/Explore.jsx';
import { Profile } from '../pages/Profile.jsx';
import { SettingsPage } from '../pages/SettingsPage.jsx';
import { Notifications } from '../pages/Notifications.jsx';
import { PostPage } from '../pages/PostPage.jsx';
import { Messages } from '../pages/Messages.jsx';
import { SavedPosts } from '../pages/SavedPosts.jsx';

export function Shell({ user, onLogout }) {
  const [path, setPath] = useState(location.pathname),
    [search, setSearch] = useState("");
  useEffect(() => {
    const f = () => setPath(location.pathname);
    window.addEventListener("popstate", f);
    return () => window.removeEventListener("popstate", f);
  }, []);
  return (
    <div className="app-layout">
      <header className="topbar">
        <Link className="brand" to="/feed">
          <span className="brand-mark">
            <Sparkles size={17} />
          </span>
          <span>connecthub</span>
        </Link>
        <div className="top-search">
          <Search size={16} />
          <input
            placeholder="Find your peopleâ€¦"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <Link to={`/explore?q=${encodeURIComponent(search)}`}>Search</Link>
          )}
        </div>
        <div className="top-actions">
          <Link to="/notifications" className="icon-btn">
            <Bell size={18} />
            <i />
          </Link>
          <Link to={`/profile/${user.username}`}>
            <Avatar user={user} />
          </Link>
        </div>
      </header>
      <aside className="sidebar">
        <div className="side-label">YOUR SPACE</div>
        <Side
          to="/feed"
          icon={<House size={18} />}
          label="Home"
          active={path === "/feed" || path === "/"}
        />
        <Side
          to="/explore"
          icon={<Compass size={18} />}
          label="Explore"
          active={path === "/explore"}
        />
        <Side
          to="/messages"
          icon={<MessageCircle size={18} />}
          label="Messages"
          active={path.startsWith("/messages")}
        />
        <Side
          to="/saved"
          icon={<Bookmark size={18} />}
          label="Saved posts"
          active={path === "/saved"}
        />
        <Side
          to="/notifications"
          icon={<Bell size={18} />}
          label="Notifications"
          active={path === "/notifications"}
        />
        <div className="side-label side-gap">YOU</div>
        <Side
          to={`/profile/${user.username}`}
          icon={<UserRound size={18} />}
          label="My profile"
          active={path.includes("/profile")}
        />
        <Side
          to="/settings"
          icon={<Settings size={18} />}
          label="Settings"
          active={path === "/settings"}
        />
        <div className="sidebar-bottom">
          <div className="side-note">
            <span>âœ³</span>
            <b>Keep it kind.</b>
            <p>A little kindness goes a long way around here.</p>
          </div>
          <button className="user-mini" onClick={onLogout}>
            <Avatar user={user} />
            <span>
              <b>{user.displayName}</b>
              <small>@{user.username}</small>
            </span>
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Feed user={user} />} />
          <Route path="/feed" element={<Feed user={user} />} />
          <Route path="/explore" element={<Explore user={user} />} />
          <Route
            path="/profile/:username"
            element={<Profile current={user} />}
          />
          <Route
            path="/settings"
            element={
              <SettingsPage
                user={user}
                onUpdate={() =>
                  api.get("/auth/me").then(({ data }) => {
                    localStorage.setItem("ch_user", JSON.stringify(data.user));
                    location.reload();
                  })
                }
              />
            }
          />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages/:conversationId?" element={<Messages user={user} />} />
          <Route path="/saved" element={<SavedPosts user={user} />} />
          <Route path="/post/:id" element={<PostPage user={user} />} />
          <Route path="*" element={<Feed user={user} />} />
        </Routes>
      </main>
      <nav className="mobile-nav">
        <Link to="/feed">
          <House />
        </Link>
        <Link to="/explore">
          <Compass />
        </Link>
        <Link to="/feed" className="mobile-create">
          <Plus />
        </Link>
        <Link to="/messages">
          <MessageCircle />
        </Link>
        <Link to="/notifications">
          <Bell />
        </Link>
        <Link to={`/profile/${user.username}`}>
          <Avatar user={user} size="sm" />
        </Link>
      </nav>
    </div>
  );
}


