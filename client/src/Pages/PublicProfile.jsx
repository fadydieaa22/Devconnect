import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../Components/ToastProvider";
import { getImageUrl } from "../utils/imageUtils";
import toast from "react-hot-toast";
import { FiMessageCircle } from "react-icons/fi";

export default function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/user/me")
        .then((res) => setCurrentUser(res.data))
        .catch(() => setCurrentUser(null));
    }
  }, []);

  useEffect(() => {
    api
      .get(`/user/${username}`)
      .then((res) => {
        setUser(res.data);
        if (currentUser && res.data.followers) {
          setIsFollowing(
            res.data.followers.some((f) => f._id === currentUser._id)
          );
        }
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, [username, currentUser]);

  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    let mounted = true;
    // if username is not set, skip the request
    if (!username) {
      // avoid synchronous setState inside effect
      setTimeout(() => {
        if (mounted) {
          setProjects([]);
          setIsLoadingProjects(false);
        }
      }, 0);
      return () => {
        mounted = false;
      };
    }

    setTimeout(() => {
      if (!mounted) return;
      setIsLoadingProjects(true);
      api
        .get(`/projects/user/${username.toLowerCase()}`)
        .then((res) => {
          if (mounted) setProjects(res.data);
        })
        .catch(() => {
          if (mounted) setProjects([]);
        })
        .finally(() => {
          if (mounted) setIsLoadingProjects(false);
        });
    }, 0);

    return () => {
      mounted = false;
    };
  }, [username]);

  const handleFollow = async () => {
    if (!currentUser) {
      showToast("Please log in to follow", "warning");
      return;
    }

    setIsFollowingLoading(true);
    try {
      if (isFollowing) {
        await api.post(`/user/${user._id}/unfollow`);
        setIsFollowing(false);
        showToast("Unfollowed successfully", "success");
      } else {
        await api.post(`/user/${user._id}/follow`);
        setIsFollowing(true);
        showToast("Followed successfully", "success");
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error updating follow",
        "error"
      );
    } finally {
      setIsFollowingLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!currentUser) {
      toast.error("Please log in to send messages");
      return;
    }

    try {
      // Create or get conversation
      await api.post("/messages/conversations", {
        recipientId: user._id,
      });

      // Navigate to messages page
      navigate("/messages");
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-primary mb-2">
            User Not Found
          </h2>
          <p className="text-secondary">
            The user you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("") || "U";

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header */}
      <div className="card-surface p-8 rounded-2xl mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {user.avatar ? (
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg">
              <img
                src={getImageUrl(user.avatar)}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#10b981] to-[#34d399] flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {initials}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold heading-gradient mb-2">
              {user.name}
            </h1>
            {user.username && (
              <p className="text-secondary mb-2">@{user.username}</p>
            )}
            <p className="text-secondary">{user.email}</p>
            {currentUser && currentUser._id !== user._id && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleFollow}
                  disabled={isFollowingLoading}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    isFollowing
                      ? "bg-zinc-700/50 text-primary border border-zinc-600 hover:bg-zinc-700"
                      : "bg-[var(--accent)] text-white hover:bg-[var(--accent-2)]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isFollowingLoading
                    ? "Loading..."
                    : isFollowing
                    ? "Following ✓"
                    : "Follow"}
                </button>
                <button
                  onClick={handleMessage}
                  className="px-6 py-2 rounded-lg font-medium bg-zinc-700/50 text-primary border border-zinc-600 hover:bg-zinc-700 transition-all flex items-center gap-2"
                >
                  <FiMessageCircle size={18} />
                  Message
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        {(user.followers || user.following || projects.length > 0) && (
          <div className="mt-6 flex gap-8">
            {user.followers && (
              <div>
                <div className="text-2xl font-bold heading-gradient">
                  {user.followers.length}
                </div>
                <div className="text-secondary text-sm">Followers</div>
              </div>
            )}
            {user.following && (
              <div>
                <div className="text-2xl font-bold heading-gradient">
                  {user.following.length}
                </div>
                <div className="text-secondary text-sm">Following</div>
              </div>
            )}
            <div>
              <div className="text-2xl font-bold heading-gradient">
                {projects.length}
              </div>
              <div className="text-secondary text-sm">Projects</div>
            </div>
          </div>
        )}

        {user.bio && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-sm font-semibold text-secondary mb-2">About</h3>
            <p className="text-secondary leading-relaxed">{user.bio}</p>
          </div>
        )}
      </div>

      {/* Skills Section */}
      {user.skills && user.skills.length > 0 && (
        <div className="card-surface p-6 rounded-xl mb-8">
          <h2 className="text-2xl font-bold heading-gradient mb-4">Skills</h2>
          <div className="flex flex-wrap gap-3">
            {user.skills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 rounded-full bg-[var(--surface-hover)] border border-[var(--border)] text-secondary text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects Section */}
      <div className="card-surface p-6 rounded-xl">
        <h2 className="text-2xl font-bold heading-gradient mb-4">Projects</h2>
        {isLoadingProjects ? (
          <p className="text-secondary">Loading projects...</p>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {projects.map((project) => (
              <Link
                key={project._id}
                to={`/project/${project._id}`}
                className="relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group"
              >
                {project.image ? (
                  <img
                    src={getImageUrl(project.image)}
                    alt={project.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-40 bg-white/5 flex items-center justify-center text-center p-3">
                    <div>
                      <div className="font-semibold">{project.title}</div>
                      <div className="text-sm text-zinc-400 mt-1">
                        {project.description}
                      </div>
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="p-3 relative">
                  <div className="font-semibold text-sm">{project.title}</div>
                  <div className="flex gap-3 mt-2 text-sm">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--accent)]"
                      >
                        Live
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--accent)]"
                      >
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-secondary">No public projects yet.</p>
        )}
      </div>
    </div>
  );
}
