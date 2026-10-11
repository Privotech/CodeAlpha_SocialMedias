import { Link } from 'react-router-dom';

export function Side({ to, icon, label, active }) {
  return (
    <Link to={to} className={`side-link ${active ? "active" : ""}`}>
      {icon}
      <span>{label}</span>
      {label === "Notifications" && <i className="side-pip" />}
    </Link>
  );
}

