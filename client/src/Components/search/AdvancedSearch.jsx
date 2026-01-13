import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiFilter, 
  FiX, 
  FiUser, 
  FiBriefcase, 
  FiFileText,
  FiTag,
  FiCalendar,
  FiTrendingUp
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { debounce } from '../../utils/helpers';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';

const AdvancedSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], projects: [], posts: [], total: 0 });
  const [suggestions, setSuggestions] = useState([]);
  const [trending, setTrending] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    tags: [],
    skills: [],
    dateFrom: '',
    dateTo: '',
  });
  
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      loadTrending();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length >= 2) {
      debouncedSearch(query);
      debouncedSuggest(query);
    } else {
      setResults({ users: [], projects: [], posts: [], total: 0 });
      setSuggestions([]);
    }
  }, [query, filters, activeTab]);

  const loadTrending = async () => {
    try {
      const { data } = await api.get('/search/trending');
      setTrending(data.trending);
    } catch (error) {
      console.error('Failed to load trending:', error);
    }
  };

  const performSearch = async (searchQuery) => {
    setIsLoading(true);
    try {
      const params = {
        q: searchQuery,
        type: activeTab,
        ...filters,
      };

      const { data } = await api.get('/search', { params });
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuggestions = async (searchQuery) => {
    try {
      const { data } = await api.get('/search/suggest', {
        params: { q: searchQuery, type: activeTab },
      });
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error('Suggestions failed:', error);
    }
  };

  const debouncedSearch = useRef(debounce(performSearch, 300)).current;
  const debouncedSuggest = useRef(debounce(loadSuggestions, 200)).current;

  const handleSelectSuggestion = (suggestion) => {
    if (suggestion.type === 'user') {
      navigate(`/profile/${suggestion.data.username}`);
      onClose();
    } else if (suggestion.type === 'tag') {
      setQuery(suggestion.text);
    }
  };

  const handleSelectResult = (type, item) => {
    if (type === 'user') {
      navigate(`/profile/${item.username}`);
    } else if (type === 'project') {
      navigate(`/project/${item._id}`);
    } else if (type === 'post') {
      navigate(`/posts/${item._id}`);
    }
    onClose();
  };

  const tabs = [
    { id: 'all', label: 'All', icon: <FiSearch /> },
    { id: 'users', label: 'Users', icon: <FiUser /> },
    { id: 'projects', label: 'Projects', icon: <FiBriefcase /> },
    { id: 'posts', label: 'Posts', icon: <FiFileText /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Search Modal */}
          <motion.div
            className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-3xl z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-[var(--surface)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--border)]">
              {/* Search Input */}
              <div className="p-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <FiSearch className="text-secondary" size={20} />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search users, projects, posts..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent text-primary placeholder-secondary outline-none text-lg"
                  />
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 rounded-lg transition-colors ${
                      showFilters ? 'bg-[#10b981] text-white' : 'hover:bg-[var(--surface-hover)] text-secondary'
                    }`}
                  >
                    <FiFilter size={18} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-secondary"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-4">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-[#10b981] to-[#34d399] text-white'
                          : 'bg-[var(--surface-hover)] text-secondary hover:text-primary'
                      }`}
                    >
                      {tab.icon}
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-[var(--border)] bg-[var(--surface-hover)] p-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-secondary mb-2 block">Date From</label>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-secondary mb-2 block">Date To</label>
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-primary"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Content Area */}
              <div className="max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : query.length < 2 ? (
                  /* Trending */
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <FiTrendingUp className="text-[#10b981]" />
                      <h3 className="font-semibold text-primary">Trending Topics</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {trending.map((item) => (
                        <Badge
                          key={item.tag}
                          variant="primary"
                          className="cursor-pointer"
                          onClick={() => setQuery(item.tag)}
                        >
                          #{item.tag} ({item.count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : suggestions.length > 0 && query.length >= 2 ? (
                  /* Suggestions */
                  <div className="p-2">
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full px-4 py-3 rounded-lg hover:bg-[var(--surface-hover)] text-left flex items-center gap-3 transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        {suggestion.type === 'user' && suggestion.data && (
                          <>
                            <Avatar user={suggestion.data} size="sm" />
                            <div className="flex-1">
                              <p className="text-primary font-medium">{suggestion.text}</p>
                              <p className="text-sm text-secondary">{suggestion.subtitle}</p>
                            </div>
                          </>
                        )}
                        {suggestion.type === 'tag' && (
                          <>
                            <FiTag className="text-secondary" />
                            <div className="flex-1">
                              <p className="text-primary font-medium">#{suggestion.text}</p>
                              <p className="text-sm text-secondary">Tag</p>
                            </div>
                          </>
                        )}
                      </motion.button>
                    ))}
                  </div>
                ) : results.total > 0 ? (
                  /* Results */
                  <div className="p-4 space-y-6">
                    {/* Users */}
                    {results.users.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                          <FiUser /> Users ({results.users.length})
                        </h3>
                        <div className="space-y-2">
                          {results.users.map((user) => (
                            <motion.button
                              key={user._id}
                              onClick={() => handleSelectResult('user', user)}
                              className="w-full p-3 rounded-lg hover:bg-[var(--surface-hover)] text-left flex items-center gap-3"
                              whileHover={{ x: 4 }}
                            >
                              <Avatar user={user} size="md" />
                              <div className="flex-1">
                                <p className="font-medium text-primary">{user.name}</p>
                                <p className="text-sm text-secondary">@{user.username}</p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {results.projects.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                          <FiBriefcase /> Projects ({results.projects.length})
                        </h3>
                        <div className="space-y-2">
                          {results.projects.map((project) => (
                            <motion.button
                              key={project._id}
                              onClick={() => handleSelectResult('project', project)}
                              className="w-full p-3 rounded-lg hover:bg-[var(--surface-hover)] text-left"
                              whileHover={{ x: 4 }}
                            >
                              <p className="font-medium text-primary">{project.title}</p>
                              <p className="text-sm text-secondary mt-1 line-clamp-1">{project.description}</p>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Posts */}
                    {results.posts.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                          <FiFileText /> Posts ({results.posts.length})
                        </h3>
                        <div className="space-y-2">
                          {results.posts.map((post) => (
                            <motion.button
                              key={post._id}
                              onClick={() => handleSelectResult('post', post)}
                              className="w-full p-3 rounded-lg hover:bg-[var(--surface-hover)] text-left"
                              whileHover={{ x: 4 }}
                            >
                              <p className="font-medium text-primary">{post.title || 'Untitled Post'}</p>
                              <p className="text-sm text-secondary mt-1 line-clamp-2">{post.content}</p>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : query.length >= 2 ? (
                  <div className="p-12 text-center text-secondary">
                    <p className="text-4xl mb-2">🔍</p>
                    <p>No results found for "{query}"</p>
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              {results.total > 0 && (
                <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-hover)]">
                  <p className="text-sm text-secondary text-center">
                    Found {results.total} result{results.total !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdvancedSearch;
