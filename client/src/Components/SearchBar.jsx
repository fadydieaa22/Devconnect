import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";

const SearchBar = ({ placeholder = "Search projects or users..." }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ projects: [], users: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = useCallback(async (searchQuery) => {
    if (searchQuery.trim().length < 2) {
      setResults({ projects: [], users: [] });
      return;
    }

    setIsLoading(true);
    try {
      const [projectsRes, usersRes] = await Promise.all([
        fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:5000"
          }/api/projects/search?q=${encodeURIComponent(searchQuery)}`
        ),
        fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:5000"
          }/api/user/search?q=${encodeURIComponent(searchQuery)}`
        ),
      ]);

      const projectsData = projectsRes.ok ? await projectsRes.json() : [];
      const usersData = usersRes.ok ? await usersRes.json() : [];

      setResults({
        projects: Array.isArray(projectsData) ? projectsData : [],
        users: Array.isArray(usersData) ? usersData : [],
      });
    } catch (error) {
      console.error("Search error:", error);
      setResults({ projects: [], users: [] });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, handleSearch]);

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
    setQuery("");
    setIsOpen(false);
  };

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="search-input"
        />
        <span className="search-icon">🔍</span>
      </div>

      {isOpen && query.trim().length > 0 && (
        <div className="search-results">
          {isLoading && <div className="search-loading">Searching...</div>}

          {!isLoading &&
            results.projects.length === 0 &&
            results.users.length === 0 && (
              <div className="search-empty">No results found</div>
            )}

          {results.projects.length > 0 && (
            <div className="search-section">
              <div className="search-section-title">Projects</div>
              {results.projects.map((project) => (
                <div
                  key={project._id}
                  className="search-result-item"
                  onClick={() => handleProjectClick(project._id)}
                >
                  <div className="search-result-content">
                    <div className="search-result-title">{project.title}</div>
                    <div className="search-result-desc">
                      {project.description?.substring(0, 50)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.users.length > 0 && (
            <div className="search-section">
              <div className="search-section-title">Developers</div>
              {results.users.map((user) => (
                <div
                  key={user._id}
                  className="search-result-item user-item"
                  onClick={() => handleUserClick(user.username)}
                >
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="search-result-avatar"
                    />
                  )}
                  <div className="search-result-content">
                    <div className="search-result-title">{user.name}</div>
                    <div className="search-result-desc">@{user.username}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <div className="search-overlay" onClick={() => setIsOpen(false)}></div>
      )}
    </div>
  );
};

export default SearchBar;
