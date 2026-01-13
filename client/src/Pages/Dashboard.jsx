import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiEdit,
  FiPlus,
  FiTrendingUp,
  FiUsers,
  FiHeart,
  FiMessageCircle,
  FiBarChart2,
  FiBriefcase,
} from "react-icons/fi";
import api from "../api/axios";
import { useAuthStore } from "../store/useStore";
import PageTransition from "../Components/ui/PageTransition";
import { Card, Button, Avatar } from "../Components/ui";
import { LoadingPage } from "../Components/ui/LoadingSpinner";
import CreatePostModal from "../Components/posts/CreatePostModal";
import CreateProjectModal from "../Components/projects/CreateProjectModal";
import { formatNumber } from "../utils/helpers";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch user data
      const userRes = await api.get("/user/me", config);
      setUser(userRes.data);

      // Fetch user's projects
      const projectsRes = await api.get(
        `/projects/user/${userRes.data._id}/projects`,
        config
      );
      setProjects(projectsRes.data);

      // Fetch analytics
      try {
        const analyticsRes = await api.get(
          "/analytics/me?timeRange=30d",
          config
        );
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.log("Analytics not available");
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingPage message="Loading your dashboard..." />;
  }

  const stats = [
    {
      label: "Projects",
      value: projects.length,
      icon: <FiBriefcase />,
      color: "from-blue-500 to-blue-600",
      link: "/projects",
    },
    {
      label: "Followers",
      value: user?.followers?.length || 0,
      icon: <FiUsers />,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Following",
      value: user?.following?.length || 0,
      icon: <FiUsers />,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Total Likes",
      value: analytics?.overview?.totalLikes || 0,
      icon: <FiHeart />,
      color: "from-red-500 to-red-600",
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold heading-gradient mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-secondary">
              Here's what's happening with your profile
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="p-6 cursor-pointer"
                  onClick={() => stat.link && navigate(stat.link)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}
                    >
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-secondary text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatNumber(stat.value)}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar user={user} size="2xl" className="mb-4" />

                  <h3 className="text-xl font-bold text-primary mb-1">
                    {user?.name}
                  </h3>
                  <p className="text-secondary mb-4">@{user?.username}</p>

                  {user?.bio && (
                    <p className="text-secondary text-sm mb-6 line-clamp-3">
                      {user.bio}
                    </p>
                  )}

                  <div className="flex gap-2 w-full">
                    <Link to="/edit-profile" className="flex-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        leftIcon={<FiEdit />}
                      >
                        Edit Profile
                      </Button>
                    </Link>
                    <Link to={`/profile/${user?.username}`} className="flex-1">
                      <Button variant="ghost" size="sm" fullWidth>
                        View Profile
                      </Button>
                    </Link>
                  </div>

                  {/* Skills */}
                  {user?.skills && user.skills.length > 0 && (
                    <div className="mt-6 w-full">
                      <h4 className="text-sm font-semibold text-primary mb-3 text-left">
                        Top Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {user.skills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-[var(--surface-hover)] text-secondary text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="mt-6 w-full space-y-2">
                    <Link to="/analytics" className="block">
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        leftIcon={<FiBarChart2 />}
                      >
                        View Analytics
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      fullWidth
                      leftIcon={<FiMessageCircle />}
                      onClick={() => setShowCreatePost(true)}
                    >
                      Create Post
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      onClick={() => setShowCreateProject(true)}
                      className="p-4 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface)] cursor-pointer transition-colors text-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiPlus
                        className="mx-auto mb-2 text-[#10b981]"
                        size={24}
                      />
                      <p className="text-sm font-medium text-primary">
                        New Project
                      </p>
                    </motion.div>

                    <motion.div
                      onClick={() => setShowCreatePost(true)}
                      className="p-4 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface)] cursor-pointer transition-colors text-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiMessageCircle
                        className="mx-auto mb-2 text-[#10b981]"
                        size={24}
                      />
                      <p className="text-sm font-medium text-primary">
                        Create Post
                      </p>
                    </motion.div>

                    <Link to="/analytics">
                      <motion.div
                        className="p-4 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface)] cursor-pointer transition-colors text-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiBarChart2
                          className="mx-auto mb-2 text-[#10b981]"
                          size={24}
                        />
                        <p className="text-sm font-medium text-primary">
                          Analytics
                        </p>
                      </motion.div>
                    </Link>

                    <Link to="/users">
                      <motion.div
                        className="p-4 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface)] cursor-pointer transition-colors text-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiUsers
                          className="mx-auto mb-2 text-[#10b981]"
                          size={24}
                        />
                        <p className="text-sm font-medium text-primary">
                          Find Developers
                        </p>
                      </motion.div>
                    </Link>
                  </div>
                </Card>
              </motion.div>

              {/* Recent Projects */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-primary">
                      Your Projects
                    </h3>
                    <Link to="/projects">
                      <Button variant="ghost" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>

                  {projects.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-4xl mb-2">🚀</p>
                      <p className="text-secondary mb-4">No projects yet</p>
                      <Button
                        size="sm"
                        leftIcon={<FiPlus />}
                        onClick={() => setShowCreateProject(true)}
                      >
                        Create Your First Project
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {projects.slice(0, 3).map((project) => (
                        <Link
                          key={project._id}
                          to={`/project/${project._id}`}
                          className="block"
                        >
                          <motion.div
                            className="p-4 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface)] transition-colors"
                            whileHover={{ x: 4 }}
                          >
                            <h4 className="font-semibold text-primary mb-1">
                              {project.title}
                            </h4>
                            <p className="text-sm text-secondary line-clamp-2 mb-2">
                              {project.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-secondary">
                              <span className="flex items-center gap-1">
                                <FiHeart size={14} />
                                {project.likes?.length || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiMessageCircle size={14} />
                                {project.comments?.length || 0}
                              </span>
                            </div>
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>

              {/* Performance Insights */}
              {analytics && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                        <FiTrendingUp className="text-[#10b981]" />
                        Performance (Last 30 Days)
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-lg bg-[var(--surface-hover)]">
                        <p className="text-2xl font-bold text-primary mb-1">
                          {formatNumber(analytics.overview.profileViews)}
                        </p>
                        <p className="text-sm text-secondary">Profile Views</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-[var(--surface-hover)]">
                        <p className="text-2xl font-bold text-primary mb-1">
                          {formatNumber(analytics.overview.totalLikes)}
                        </p>
                        <p className="text-sm text-secondary">Total Likes</p>
                      </div>
                    </div>

                    <Link to="/analytics" className="block mt-4">
                      <Button variant="secondary" size="sm" fullWidth>
                        View Full Analytics
                      </Button>
                    </Link>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        user={authUser}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        user={authUser}
        onProjectCreated={(project) =>
          setProjects((prev) => [project, ...prev])
        }
      />
    </PageTransition>
  );
}
