import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiHome, FiUsers, FiBriefcase, FiUser, FiLogOut, 
  FiMenu, FiX, FiBell, FiSettings, FiSun, FiMoon,
  FiSearch, FiMessageCircle, FiBookmark, FiUserPlus
} from "react-icons/fi";
import { useAuthStore, useUIStore, useNotificationStore } from "../store/useStore";
import Avatar from "./ui/Avatar";
import Dropdown, { DropdownItem, DropdownDivider } from "./ui/Dropdown";
import SearchBar from "./SearchBar";
import NotificationCenter from "./NotificationCenter";
import AdvancedSearch from "./search/AdvancedSearch";

const EnhancedNavBar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    
    if (token) {
      // Fetch user data
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(() => {});
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login");
  };

  const navLinks = [
    { path: "/", label: "Home", icon: <FiHome size={20} />, public: true },
    { path: "/users", label: "Developers", icon: <FiUsers size={20} />, public: true },
    { path: "/projects", label: "Projects", icon: <FiBriefcase size={20} />, public: true },
    { path: "/feed", label: "Feed", icon: <FiMessageCircle size={20} />, protected: true },
    { path: "/messages", label: "Messages", icon: <FiMessageCircle size={20} />, protected: true },
    { path: "/dashboard", label: "Dashboard", icon: <FiUser size={20} />, protected: true },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav 
      className="sticky top-0 z-40 bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--border)] shadow-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/">
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#34d399] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                D
              </div>
              <span className="text-xl font-bold heading-gradient hidden sm:block">
                DevConnect
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.protected && !isAuthenticated) return null;
              if (link.protected === false && isAuthenticated) return null;
              
              return (
                <Link key={link.path} to={link.path}>
                  <motion.div
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                      isActive(link.path)
                        ? "bg-gradient-to-r from-[#10b981] to-[#34d399] text-white shadow-lg"
                        : "text-secondary hover:text-primary hover:bg-[var(--surface-hover)]"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {link.icon}
                    <span className="font-medium">{link.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <motion.button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-[var(--surface-hover)] transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiSearch size={20} />
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-[var(--surface-hover)] transition-all"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
            >
              {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
            </motion.button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <motion.button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg text-secondary hover:text-primary hover:bg-[var(--surface-hover)] transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiBell size={20} />
                  {unreadCount > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </motion.button>

                {/* User Menu */}
                <Dropdown
                  trigger={
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Avatar user={user} size="sm" />
                    </motion.div>
                  }
                  align="right"
                >
                  <div className="p-4 border-b border-[var(--border)]">
                    <p className="font-semibold text-primary">{user?.name}</p>
                    <p className="text-sm text-secondary">@{user?.username}</p>
                  </div>
                  
                  <DropdownItem 
                    icon={<FiUser />} 
                    onClick={() => navigate('/my-profile')}
                  >
                    My Profile
                  </DropdownItem>
                  
                  <DropdownItem 
                    icon={<FiBookmark />} 
                    onClick={() => navigate('/saved')}
                  >
                    Saved Posts
                  </DropdownItem>
                  
                  <DropdownItem 
                    icon={<FiUserPlus />} 
                    onClick={() => navigate('/follow-requests')}
                  >
                    Follow Requests
                  </DropdownItem>
                  
                  <DropdownItem 
                    icon={<FiSettings />} 
                    onClick={() => navigate('/edit-profile')}
                  >
                    Settings
                  </DropdownItem>
                  
                  <DropdownDivider />
                  
                  <DropdownItem 
                    icon={<FiLogOut />} 
                    onClick={handleLogout}
                    danger
                  >
                    Logout
                  </DropdownItem>
                </Dropdown>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login">
                  <motion.button
                    className="px-4 py-2 rounded-lg text-secondary hover:text-primary hover:bg-[var(--surface-hover)] font-medium transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign In
                  </motion.button>
                </Link>
                <Link to="/register">
                  <motion.button
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#10b981] to-[#34d399] text-white font-medium shadow-lg"
                    whileHover={{ scale: 1.05, shadow: "0 20px 25px -5px rgba(255, 107, 97, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-secondary hover:text-primary hover:bg-[var(--surface-hover)] transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            className="absolute top-full left-0 right-0 bg-[var(--surface)] border-b border-[var(--border)] shadow-2xl p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="max-w-3xl mx-auto">
              <SearchBar />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden border-t border-[var(--border)]"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                if (link.protected && !isAuthenticated) return null;
                
                return (
                  <Link key={link.path} to={link.path}>
                    <motion.div
                      className={`px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                        isActive(link.path)
                          ? "bg-gradient-to-r from-[#10b981] to-[#34d399] text-white"
                          : "text-secondary hover:text-primary hover:bg-[var(--surface-hover)]"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                      whileTap={{ scale: 0.95 }}
                    >
                      {link.icon}
                      <span className="font-medium">{link.label}</span>
                    </motion.div>
                  </Link>
                );
              })}

              {!isAuthenticated && (
                <>
                  <Link to="/login">
                    <motion.div
                      className="px-4 py-3 rounded-lg text-center text-secondary hover:text-primary hover:bg-[var(--surface-hover)] font-medium transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign In
                    </motion.div>
                  </Link>
                  <Link to="/register">
                    <motion.div
                      className="px-4 py-3 rounded-lg bg-gradient-to-r from-[#10b981] to-[#34d399] text-white text-center font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                      whileTap={{ scale: 0.95 }}
                    >
                      Get Started
                    </motion.div>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Search */}
      <AdvancedSearch 
        isOpen={showSearch} 
        onClose={() => setShowSearch(false)} 
      />

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </motion.nav>
  );
};

export default EnhancedNavBar;
