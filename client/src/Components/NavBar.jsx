import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api from "../api/axios.js";
import SearchBar from "./SearchBar";

// NavLink component for desktop
function NavLink({ to, isActive, children }) {
  return (
    <Link
      to={to}
      className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group ${
        isActive
          ? "text-[var(--text-primary)] bg-[var(--surface-hover)]"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]/50"
      }`}
    >
      <span className="relative z-10">{children}</span>
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] rounded-full"></span>
      )}
      <span
        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${
          isActive ? "scale-x-100" : ""
        }`}
      ></span>
      <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--accent)]/0 via-[var(--accent)]/5 to-[var(--accent)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
    </Link>
  );
}

// MobileNavLink component
function MobileNavLink({ to, isActive, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden group ${
        isActive
          ? "text-[var(--text-primary)] bg-[var(--surface-hover)] border-l-4 border-[var(--accent)]"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]/50 border-l-4 border-transparent"
      }`}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {isActive && (
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
        )}
      </span>
      <span className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/0 via-[var(--accent)]/5 to-[var(--accent)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
    </Link>
  );
}

export default function NavBar({ user: propUser, onLogout }) {
  const location = useLocation();
  const [isLight, setIsLight] = useState(() => {
    try {
      return localStorage.getItem("theme") === "light";
    } catch {
      return false;
    }
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(propUser || null);
  const hoverTimeoutRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.documentElement;
    if (isLight) {
      root.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      root.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
  }, [isLight]);

  useEffect(() => {
    const updateAuth = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    };
    updateAuth();
    // Update auth whenever the route changes
  }, [location]);

  // fetch current user if not passed as prop or auth changes
  useEffect(() => {
    if (propUser) {
      const t = setTimeout(() => setCurrentUser(propUser), 0);
      return () => clearTimeout(t);
    }

    const token = localStorage.getItem("token");
    if (!token) {
      const t = setTimeout(() => setCurrentUser(null), 0);
      return () => clearTimeout(t);
    }

    let mounted = true;
    api
      .get("/user/me")
      .then((res) => {
        if (mounted) setCurrentUser(res.data);
      })
      .catch(() => {
        if (mounted) setCurrentUser(null);
      });

    return () => {
      mounted = false;
    };
  }, [propUser, isAuthenticated]);

  // listen for user updates (e.g., after profile edit)
  useEffect(() => {
    const onUserUpdated = (e) => {
      if (e && e.detail) setCurrentUser(e.detail);
    };
    window.addEventListener("userUpdated", onUserUpdated);
    return () => window.removeEventListener("userUpdated", onUserUpdated);
  }, []);

  // cleanup any hover timeouts on unmount
  useEffect(() => {
    const timeoutId = hoverTimeoutRef.current;
    return () => clearTimeout(timeoutId);
  }, []);

  // close user menu on click/touch outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate("/");
    setIsMenuOpen(false);
    setUserMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;
  const dropdownClass = isLight
    ? "bg-[#0f1724] border border-[#0b0b0b] text-[#10b981]"
    : "bg-zinc-900 border border-zinc-800 text-white";

  return (
    <header className="sticky top-0 z-50 navbar-glass border-b border-[var(--border)] shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
            <div className="relative text-2xl font-heading font-bold heading-gradient transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(255,107,97,0.5)]">
              DevConnect
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <SearchBar placeholder="Search..." />
            <NavLink to="/" isActive={isActive("/")}>
              Home
            </NavLink>
            <NavLink to="/about" isActive={isActive("/about")}>
              About
            </NavLink>
            <NavLink to="/projects" isActive={isActive("/projects")}>
              Projects
            </NavLink>
            <NavLink to="/users" isActive={isActive("/users")}>
              Developers
            </NavLink>
            {currentUser && (
              <NavLink to="/feed" isActive={isActive("/feed")}>
                Feed
              </NavLink>
            )}
            <NavLink to="/contacts" isActive={isActive("/contacts")}>
              Contacts
            </NavLink>
            {currentUser ? (
              <div
                ref={userMenuRef}
                className="relative"
                onMouseEnter={() => {
                  clearTimeout(hoverTimeoutRef.current);
                  setUserMenuOpen(true);
                }}
                onMouseLeave={() => {
                  clearTimeout(hoverTimeoutRef.current);
                  hoverTimeoutRef.current = setTimeout(
                    () => setUserMenuOpen(false),
                    200
                  );
                }}
              >
                <button
                  onClick={() => {
                    clearTimeout(hoverTimeoutRef.current);
                    setUserMenuOpen((s) => !s);
                  }}
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-3 hover:bg-zinc-800 px-3 py-2 rounded-xl transition"
                >
                  {currentUser?.avatar ? (
                    <img
                      src={
                        currentUser.avatar.startsWith("http")
                          ? currentUser.avatar
                          : `http://localhost:5000${currentUser.avatar}`
                      }
                      alt="avatar"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">
                      {(currentUser?.name || "F").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:block">
                    {currentUser?.name || "F"}
                  </span>
                </button>

                {/* Dropdown (always present but animated) */}
                <div
                  aria-hidden={!userMenuOpen}
                  className={`absolute right-0 mt-3 w-48 ${dropdownClass} rounded-xl shadow-xl transform transition-all duration-150 ${
                    userMenuOpen
                      ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                      : "opacity-0 translate-y-1 scale-95 pointer-events-none"
                  }`}
                >
                  <Link
                    to="/dashboard"
                    className={`block px-4 py-3 ${
                      isLight
                        ? "text-[#10b981] hover:bg-zinc-800/60"
                        : "hover:bg-zinc-800"
                    }`}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    My Profile
                  </Link>

                  <button
                    onClick={() => {
                      if (onLogout) onLogout();
                      else handleLogout();
                      setUserMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 ${
                      isLight
                        ? "text-[#10b981] hover:bg-zinc-800/40"
                        : "hover:bg-zinc-800 text-red-400"
                    }`}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : isAuthenticated ? (
              <>
                <NavLink to="/dashboard" isActive={isActive("/dashboard")}>
                  Dashboard
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-white bg-red-500/0 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span>Logout</span>
                    <svg
                      className="w-4 h-4 transition-transform group-hover:rotate-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-hover)]/50 hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300 hover:scale-105 hover:shadow-md"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent)] bg-[length:200%_auto] bg-[position:0%_50%] hover:bg-[position:100%_50%] transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[var(--accent)]/30 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span>Sign Up</span>
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                </Link>
              </>
            )}
            <button
              aria-label="Toggle theme"
              onClick={() => setIsLight((s) => !s)}
              className="ml-2 px-3 py-2 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300 hover:scale-110 hover:rotate-12 hover:shadow-lg text-lg relative overflow-hidden group"
            >
              <span className="relative z-10 block transform transition-transform duration-500 group-hover:rotate-180">
                {isLight ? "🌞" : "🌙"}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/0 via-[var(--accent)]/20 to-[var(--accent)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              aria-label="Toggle theme"
              onClick={() => setIsLight((s) => !s)}
              className="px-3 py-2 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300 hover:scale-110 hover:rotate-12 hover:shadow-lg text-lg relative overflow-hidden group"
            >
              <span className="relative z-10 block transform transition-transform duration-500 group-hover:rotate-180">
                {isLight ? "🌞" : "🌙"}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/0 via-[var(--accent)]/20 to-[var(--accent)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300 hover:scale-110 relative overflow-hidden group ${
                isMenuOpen ? "bg-[var(--surface)]" : ""
              }`}
              aria-label="Toggle menu"
            >
              <svg
                className={`w-6 h-6 text-[var(--text-primary)] transition-transform duration-300 ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
              <span className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/0 via-[var(--accent)]/20 to-[var(--accent)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMenuOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-2 pt-4">
            <MobileNavLink
              to="/"
              isActive={isActive("/")}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </MobileNavLink>
            <MobileNavLink
              to="/about"
              isActive={isActive("/about")}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </MobileNavLink>
            <MobileNavLink
              to="/projects"
              isActive={isActive("/projects")}
              onClick={() => setIsMenuOpen(false)}
            >
              Projects
            </MobileNavLink>
            <MobileNavLink
              to="/users"
              isActive={isActive("/users")}
              onClick={() => setIsMenuOpen(false)}
            >
              Developers
            </MobileNavLink>
            <MobileNavLink
              to="/contacts"
              isActive={isActive("/contacts")}
              onClick={() => setIsMenuOpen(false)}
            >
              Contacts
            </MobileNavLink>
            {currentUser ? (
              <>
                <MobileNavLink
                  to="/profile"
                  isActive={isActive("/profile")}
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </MobileNavLink>
                <MobileNavLink
                  to="/dashboard"
                  isActive={isActive("/dashboard")}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </MobileNavLink>
                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    else handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-white bg-red-500/0 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/20 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span>Logout</span>
                    <svg
                      className="w-4 h-4 transition-transform group-hover:rotate-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                </button>
              </>
            ) : isAuthenticated ? (
              <>
                <MobileNavLink
                  to="/dashboard"
                  isActive={isActive("/dashboard")}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </MobileNavLink>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-white bg-red-500/0 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/20 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span>Logout</span>
                    <svg
                      className="w-4 h-4 transition-transform group-hover:rotate-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-hover)]/50 hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-semibold text-white text-center bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent)] bg-[length:200%_auto] bg-[position:0%_50%] hover:bg-[position:100%_50%] transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-[var(--accent)]/30 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span>Sign Up</span>
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
