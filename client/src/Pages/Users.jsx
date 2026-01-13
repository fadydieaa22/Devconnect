import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUsers, FiX, FiMessageCircle } from "react-icons/fi";
import api from "../api/axios";
import PageTransition from "../Components/ui/PageTransition";
import { Card, Button, Avatar, Badge } from "../Components/ui";
import { LoadingPage } from "../Components/ui/LoadingSpinner";
import { UserListSkeleton } from "../Components/EnhancedSkeleton";
import EmptyState from "../Components/ui/EmptyState";
import { formatNumber } from "../utils/helpers";
import toast from "react-hot-toast";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    skill: "",
    search: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, users]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const { data } = await api.get("/user/me");
        setCurrentUser(data);
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/user");
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.username.toLowerCase().includes(searchLower) ||
          user.bio?.toLowerCase().includes(searchLower)
      );
    }

    // Skill filter
    if (filters.skill) {
      const skillLower = filters.skill.toLowerCase();
      filtered = filtered.filter((user) =>
        user.skills?.some((skill) => skill.toLowerCase().includes(skillLower))
      );
    }

    setFilteredUsers(filtered);
  };

  const handleFollow = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to follow users");
        return;
      }

      const isFollowing = currentUser?.following
        ?.map((id) => id.toString())
        .includes(userId);

      if (isFollowing) {
        // Unfollow
        await api.post(`/user/${userId}/unfollow`);

        // Update local state: remove current user from target's followers
        setUsers(
          users.map((user) => {
            if (user._id === userId) {
              return {
                ...user,
                followers: (user.followers || []).filter(
                  (id) => id.toString() !== currentUser._id
                ),
              };
            }
            return user;
          })
        );

        // Update current user
        setCurrentUser((prev) => ({
          ...prev,
          following: (prev.following || []).filter(
            (id) => id.toString() !== userId
          ),
        }));
      } else {
        // Send follow request
        await api.post(`/user/${userId}/follow`);

        // Update local state: add current user to target's followers (optimistic)
        setUsers(
          users.map((user) => {
            if (user._id === userId) {
              return {
                ...user,
                followers: [...(user.followers || []), currentUser._id],
              };
            }
            return user;
          })
        );

        // Update current user
        setCurrentUser((prev) => ({
          ...prev,
          following: [...(prev.following || []), userId],
        }));
      }
    } catch (error) {
      console.error("Failed to follow/unfollow:", error);
      toast.error(error.response?.data?.message || "Failed to follow/unfollow");
    }
  };

  const handleMessage = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to send messages");
        return;
      }

      // Create or get conversation
      const { data } = await api.post("/messages/conversations", {
        recipientId: userId,
      });

      // Navigate to messages page
      navigate("/messages");
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  const clearFilters = () => {
    setFilters({ skill: "", search: "" });
  };

  const hasActiveFilters = filters.skill || filters.search;

  if (isLoading) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UserListSkeleton />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold heading-gradient mb-2 flex items-center gap-3">
              <FiUsers className="text-[#10b981]" />
              Discover Developers
            </h1>
            <p className="text-secondary">
              Connect with talented developers from around the world
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-8">
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search by name, username, or bio..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="flex-1 px-4 py-2 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                />

                {/* Skill Filter */}
                <input
                  type="text"
                  placeholder="Filter by skill..."
                  value={filters.skill}
                  onChange={(e) =>
                    setFilters({ ...filters, skill: e.target.value })
                  }
                  className="sm:w-48 px-4 py-2 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                />

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    leftIcon={<FiX />}
                  >
                    Clear
                  </Button>
                )}
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--border)]">
                  {filters.search && (
                    <Badge
                      variant="primary"
                      removable
                      onRemove={() => setFilters({ ...filters, search: "" })}
                    >
                      Search: {filters.search}
                    </Badge>
                  )}
                  {filters.skill && (
                    <Badge
                      variant="primary"
                      removable
                      onRemove={() => setFilters({ ...filters, skill: "" })}
                    >
                      Skill: {filters.skill}
                    </Badge>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-secondary">
              {filteredUsers.length} developer
              {filteredUsers.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Users Grid */}
          {filteredUsers.length === 0 ? (
            <EmptyState
              icon="👥"
              title="No developers found"
              description={
                hasActiveFilters
                  ? "Try adjusting your filters"
                  : "No developers available at the moment"
              }
              actionLabel={hasActiveFilters ? "Clear Filters" : undefined}
              onAction={hasActiveFilters ? clearFilters : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-6 h-full flex flex-col">
                    {/* User Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <Link to={`/profile/${user.username}`}>
                        <Avatar user={user} size="lg" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/profile/${user.username}`}>
                          <h3 className="font-semibold text-primary hover:text-[#10b981] transition-colors truncate">
                            {user.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-secondary truncate">
                          @{user.username}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                      <p className="text-sm text-secondary mb-4 line-clamp-2">
                        {user.bio}
                      </p>
                    )}

                    {/* Skills */}
                    {user.skills && user.skills.length > 0 && (
                      <div className="mb-4 flex-1">
                        <div className="flex flex-wrap gap-2">
                          {user.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="default" size="sm">
                              {skill}
                            </Badge>
                          ))}
                          {user.skills.length > 3 && (
                            <Badge variant="default" size="sm">
                              +{user.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y border-[var(--border)]">
                      <div className="text-center">
                        <p className="text-xl font-bold text-primary">
                          {formatNumber(user.followers?.length || 0)}
                        </p>
                        <p className="text-xs text-secondary">Followers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-primary">
                          {formatNumber(user.following?.length || 0)}
                        </p>
                        <p className="text-xs text-secondary">Following</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link to={`/profile/${user.username}`} className="flex-1">
                        <Button variant="secondary" size="sm" fullWidth>
                          View Profile
                        </Button>
                      </Link>
                      {currentUser && currentUser._id !== user._id && (
                        <>
                          <Button
                            variant={
                              currentUser.following?.includes(user._id)
                                ? "ghost"
                                : "primary"
                            }
                            size="sm"
                            onClick={() => handleFollow(user._id)}
                          >
                            {currentUser.following?.includes(user._id)
                              ? "Unfollow"
                              : "Follow"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMessage(user._id)}
                            leftIcon={<FiMessageCircle />}
                          ></Button>
                        </>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
