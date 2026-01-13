import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FiEdit, 
  FiMapPin, 
  FiLink, 
  FiGithub, 
  FiLinkedin,
  FiTwitter,
  FiMail,
  FiSettings,
  FiUsers,
  FiFileText,
  FiCode
} from "react-icons/fi";
import PageTransition from "../Components/ui/PageTransition";
import { Card, Button, Badge } from "../Components/ui";
import LoadingSpinner from "../Components/ui/LoadingSpinner";
import PostFeed from "../Components/posts/PostFeed";
import ProjectsCard from "../Components/ProjectsCard";
import EndorsementSection from "../Components/profile/EndorsementSection";
import { useAuthStore } from "../store/useStore";
import { getImageUrl } from "../utils/imageUtils";
import api from "../api/axios";

export default function MyProfile() {
  const currentUser = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    posts: 0,
    projects: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !currentUser) {
      navigate("/login");
      return;
    }
    loadProfileData();
  }, [currentUser, navigate]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user's projects
      const { data: projectsData } = await api.get(`/projects?userId=${currentUser._id}`);
      setProjects(projectsData);

      // Fetch posts count
      const { data: postsData } = await api.get(`/posts?userId=${currentUser._id}`);
      
      // Update stats
      setStats({
        followers: currentUser.followers?.length || 0,
        following: currentUser.following?.length || 0,
        posts: postsData.total || postsData.posts?.length || 0,
        projects: projectsData.length
      });
    } catch (error) {
      console.error("Failed to load profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentUser) return null;

  const initials = currentUser.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <PageTransition>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Cover & Profile Section */}
          <Card className="mb-6 overflow-hidden">
            {/* Cover Image */}
            <div className="h-48 bg-gradient-to-r from-[#10b981] via-[#059669] to-[#047857] relative">
              <div className="absolute inset-0 bg-black/10"></div>
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 relative">
                {/* Avatar */}
                {currentUser.avatar ? (
                  <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl border-4 border-[var(--surface)]">
                    <img
                      src={getImageUrl(currentUser.avatar)}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#10b981] to-[#34d399] flex items-center justify-center text-4xl font-bold text-white shadow-2xl border-4 border-[var(--surface)]">
                    {initials}
                  </div>
                )}

                {/* Name and Actions */}
                <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 sm:mt-0">
                  <div>
                    <h1 className="text-3xl font-bold text-primary mb-1">
                      {currentUser.name}
                    </h1>
                    <p className="text-lg text-secondary">@{currentUser.username}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate("/edit-profile")}
                      variant="primary"
                      leftIcon={<FiEdit />}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      onClick={() => navigate("/settings")}
                      variant="secondary"
                      leftIcon={<FiSettings />}
                    >
                      Settings
                    </Button>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {currentUser.bio && (
                <p className="text-primary mt-6 mb-4 leading-relaxed">
                  {currentUser.bio}
                </p>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                {currentUser.location && (
                  <div className="flex items-center gap-2 text-secondary">
                    <FiMapPin size={16} />
                    <span>{currentUser.location}</span>
                  </div>
                )}
                {currentUser.email && (
                  <div className="flex items-center gap-2 text-secondary">
                    <FiMail size={16} />
                    <span className="truncate">{currentUser.email}</span>
                  </div>
                )}
                {currentUser.website && (
                  <a
                    href={currentUser.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#10b981] hover:underline"
                  >
                    <FiLink size={16} />
                    <span>Website</span>
                  </a>
                )}
              </div>

              {/* Social Links */}
              {(currentUser.github || currentUser.linkedin || currentUser.twitter) && (
                <div className="flex gap-4 mt-4">
                  {currentUser.github && (
                    <a
                      href={`https://github.com/${currentUser.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface)] text-secondary hover:text-primary transition-colors"
                    >
                      <FiGithub size={20} />
                    </a>
                  )}
                  {currentUser.linkedin && (
                    <a
                      href={`https://linkedin.com/in/${currentUser.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface)] text-secondary hover:text-primary transition-colors"
                    >
                      <FiLinkedin size={20} />
                    </a>
                  )}
                  {currentUser.twitter && (
                    <a
                      href={`https://twitter.com/${currentUser.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface)] text-secondary hover:text-primary transition-colors"
                    >
                      <FiTwitter size={20} />
                    </a>
                  )}
                </div>
              )}

              {/* Skills */}
              {currentUser.skills && currentUser.skills.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-secondary mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.skills.map((skill, index) => (
                      <Badge key={`${skill}-${index}`} variant="primary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[var(--border)]">
                <Link
                  to="/contacts?tab=followers"
                  className="text-center p-3 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <div className="text-2xl font-bold text-primary">{stats.followers}</div>
                  <div className="text-sm text-secondary">Followers</div>
                </Link>
                <Link
                  to="/contacts?tab=following"
                  className="text-center p-3 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <div className="text-2xl font-bold text-primary">{stats.following}</div>
                  <div className="text-sm text-secondary">Following</div>
                </Link>
                <div className="text-center p-3 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{stats.posts}</div>
                  <div className="text-sm text-secondary">Posts</div>
                </div>
                <div className="text-center p-3 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{stats.projects}</div>
                  <div className="text-sm text-secondary">Projects</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 border-b border-[var(--border)]">
              <button
                onClick={() => setActiveTab("posts")}
                className={`px-4 py-3 font-medium transition-colors relative ${
                  activeTab === "posts"
                    ? "text-[#10b981]"
                    : "text-secondary hover:text-primary"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiFileText size={18} />
                  <span>Posts</span>
                </div>
                {activeTab === "posts" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10b981]"
                  />
                )}
              </button>

              <button
                onClick={() => setActiveTab("projects")}
                className={`px-4 py-3 font-medium transition-colors relative ${
                  activeTab === "projects"
                    ? "text-[#10b981]"
                    : "text-secondary hover:text-primary"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiCode size={18} />
                  <span>Projects</span>
                </div>
                {activeTab === "projects" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10b981]"
                  />
                )}
              </button>

              <button
                onClick={() => setActiveTab("endorsements")}
                className={`px-4 py-3 font-medium transition-colors relative ${
                  activeTab === "endorsements"
                    ? "text-[#10b981]"
                    : "text-secondary hover:text-primary"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiUsers size={18} />
                  <span>Endorsements</span>
                </div>
                {activeTab === "endorsements" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10b981]"
                  />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "posts" && (
              <PostFeed userId={currentUser._id} />
            )}

            {activeTab === "projects" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <ProjectsCard key={project._id} project={project} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-secondary mb-4">No projects yet</p>
                    <Button onClick={() => navigate("/dashboard")}>
                      Create Your First Project
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "endorsements" && (
              <EndorsementSection userId={currentUser._id} />
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
