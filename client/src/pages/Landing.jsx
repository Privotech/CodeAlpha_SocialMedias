import { Link } from 'react-router-dom';
import { ArrowUpRight, MoreHorizontal, Sparkles } from 'lucide-react';
import { Avatar } from '../components/Avatar.jsx';

export function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Sparkles size={18} />
          </span>
          connecthub
        </Link>
        <div>
          <Link to="/login" className="login-link">
            Log in
          </Link>
          <Link to="/register" className="btn primary small">
            Join the community <ArrowUpRight size={15} />
          </Link>
        </div>
      </nav>
      <main className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="live-dot" /> A little more connected
          </span>
          <h1>
            Your people.
            <br />
            <em>Your place.</em>
          </h1>
          <p>
            Good things happen when we show up for each other. Find your corner
            of the internet and make it feel like home.
          </p>
          <Link to="/register" className="btn primary">
            Create your account <ArrowUpRight size={17} />
          </Link>
          <div className="social-proof">
            <div className="avatar-stack">
              <Avatar user={{ displayName: "Maya" }} />
              <Avatar user={{ displayName: "Jordan" }} />
              <Avatar user={{ displayName: "Amara" }} />
            </div>
            <span>
              <b>Good people,</b>
              <br />
              building something together
            </span>
          </div>
        </div>
        <div className="hero-art">
          <div className="sun-disc" />
          <div className="hero-card card-a">
            <div className="mini-person">
              <Avatar user={{ displayName: "Maya" }} />
              <span>
                <b>Maya Chen</b>
                <small>2 hours ago</small>
              </span>
              <MoreHorizontal size={16} />
            </div>
            <p>Found my new favorite little coffee spot ☕️</p>
            <div className="coffee-art">☕</div>
            <div className="reaction-row">
              <span>♥ 24</span>
              <span>♡ 8 replies</span>
            </div>
          </div>
          <div className="hero-card card-b">
            <div className="mini-person">
              <Avatar user={{ displayName: "Amara" }} />
              <span>
                <b>Amara O.</b>
                <small>just now</small>
              </span>
            </div>
            <p>this made my whole day ✨</p>
          </div>
          <div className="float-note">✳&nbsp; here for the good stuff</div>
        </div>
      </main>
      <div className="hero-bottom">
        <span>Made for meaningful moments</span>
        <span>Be kind. Be curious. Be here.</span>
        <span>Scroll less, connect more ↘</span>
      </div>
    </div>
  );
}

