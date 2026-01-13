import { Link } from "react-router-dom";

export default function ProfileCard({ user, onLogout, projects = [] }) {
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("") || "U";

  return (
    <div className="card-surface p-6 rounded-xl lg:col-span-1">
      <div className="flex items-start gap-4 mb-6">
        {user.avatar ? (
          <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg">
            <img
              src={
                user.avatar.startsWith("http")
                  ? user.avatar
                  : `http://localhost:5000${user.avatar}`
              }
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#10b981] to-[#34d399] flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {initials}
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold heading-gradient mb-1">
            {user.name}
          </h2>
          <p className="text-sm text-secondary mb-2">{user.email}</p>
          {user.username && (
            <p className="text-xs text-muted">@{user.username}</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-secondary mb-2">Bio</h3>
        <p className="text-secondary leading-relaxed">
          {user.bio || "No bio yet. Add one to tell others about yourself!"}
        </p>
      </div>

      {user.skills && user.skills.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-secondary mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--surface-hover)] border border-[var(--border)] text-secondary"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-secondary mb-3">
            Projects
          </h3>
          <div className="flex flex-col gap-2">
            {projects.slice(0, 5).map((p) => (
              <Link
                key={p._id}
                to={`/projects/${p._id}`}
                className="text-sm text-secondary hover:text-primary transition"
              >
                {p.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Link
          to="/edit-profile"
          className={`block w-full text-center px-4 py-2 rounded-lg transition-all text-sm font-medium ${
            document.documentElement.classList.contains("light")
              ? "bg-white border border-[#d1fae5] text-[#10b981] hover:bg-[#f0fdf4]"
              : "bg-white/5 border border-white/10 hover:bg-white/10"
          }`}
        >
          Edit Profile
        </Link>
        <button
          onClick={onLogout}
          className="w-full px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all text-sm font-semibold"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
