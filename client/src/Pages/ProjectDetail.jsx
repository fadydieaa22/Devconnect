import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    let mounted = true;
    api
      .get(`/projects/${id}`)
      .then((res) => {
        if (mounted) {
          setProject(res.data);
          setLikesCount(res.data.likes ? res.data.likes.length : 0);
        }
      })
      .catch(() => setProject(null))
      .finally(() => mounted && setLoading(false));

    api
      .get("/user/me")
      .then((res) => {
        if (mounted) setCurrentUser(res.data);
      })
      .catch(() => {});

    // load comments
    api
      .get(`/projects/${id}/comments`)
      .then((res) => {
        if (mounted) setComments(res.data);
      })
      .catch(() => setComments([]));

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!project || !currentUser) return;
    const likes = project.likes || [];
    const isLiked = likes.some((l) =>
      typeof l === "string"
        ? l === currentUser._id
        : l._id
        ? l._id === currentUser._id
        : l.toString() === currentUser._id
    );
    // avoid synchronous setState inside effect
    setTimeout(() => {
      setLiked(isLiked);
    }, 0);
  }, [project, currentUser]);

  if (loading) return <p className="text-secondary">Loading...</p>;
  if (!project) return <p className="text-secondary">Project not found.</p>;

  const isOwner =
    currentUser && project.user && currentUser._id === project.user._id;

  const toggleLike = async () => {
    if (!currentUser) return (window.location.href = "/login");
    try {
      const res = await api.post(`/projects/${id}/like`);
      setLikesCount(res.data.likesCount);
      setLiked(res.data.liked);
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  const postComment = async (e) => {
    e.preventDefault();
    if (!currentUser) return (window.location.href = "/login");
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/projects/${id}/comments`, {
        content: newComment,
      });
      setComments([res.data, ...comments]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await api.delete(`/projects/comments/${commentId}`);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {project.image ? (
          <img
            src={
              project.image.startsWith("http")
                ? project.image
                : `http://localhost:5000${project.image}`
            }
            alt={project.title}
            className="w-full h-72 object-cover"
          />
        ) : (
          <div className="w-full h-72 bg-white/5 flex items-center justify-center">
            <div className="text-xl font-semibold">{project.title}</div>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold heading-gradient">
                {project.title}
              </h1>
              <div className="text-sm text-secondary">
                by{" "}
                <Link
                  to={`/profile/${project.user.username}`}
                  className="text-[var(--accent)]"
                >
                  @{project.user.username}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleLike}
                className={`px-3 py-1 rounded-lg ${
                  liked
                    ? "bg-[#10b981] text-white"
                    : "bg-[var(--surface-hover)]"
                }`}
              >
                {liked ? "♥" : "♡"} {likesCount}
              </button>
              {isOwner && (
                <Link
                  to={`/project/${id}/edit`}
                  className="px-3 py-1 rounded-lg bg-[var(--surface-hover)]"
                >
                  Edit
                </Link>
              )}
            </div>
          </div>

          {project.description && (
            <p className="mt-4 text-secondary">{project.description}</p>
          )}

          {project.techStack && project.techStack.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {project.techStack.map((t, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-[var(--surface-hover)] rounded-full text-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                className="text-[var(--accent)]"
                target="_blank"
                rel="noreferrer"
              >
                Live
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                className="text-[var(--accent)]"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            )}
          </div>

          {/* Comments */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold mb-3">Comments</h3>
            <form onSubmit={postComment} className="flex gap-2 mb-4">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 rounded-lg bg-white/5"
              />
              <button className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white">
                Post
              </button>
            </form>

            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c._id} className="flex items-start gap-3">
                  {c.user?.avatar ? (
                    <img
                      src={
                        c.user.avatar.startsWith("http")
                          ? c.user.avatar
                          : `http://localhost:5000${c.user.avatar}`
                      }
                      alt={c.user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm">
                      {(c.user?.name || "U").charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">
                        {c.user?.name}{" "}
                        <span className="text-secondary">
                          @{c.user?.username}
                        </span>
                      </div>
                      {currentUser &&
                        c.user &&
                        currentUser._id === c.user._id && (
                          <button
                            onClick={() => deleteComment(c._id)}
                            className="text-sm text-red-400"
                          >
                            Delete
                          </button>
                        )}
                    </div>
                    <div className="text-sm text-secondary">{c.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
