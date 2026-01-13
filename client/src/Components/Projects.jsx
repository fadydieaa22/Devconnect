import { useEffect, useState, useRef } from "react";
import api from "../api/axios.js";
import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api
      .get("/projects/me")
      .then((res) => setProjects(res.data))
      .catch(() => setProjects([]))
      .finally(() => setIsLoading(false));
  }, []);

  const addProject = async () => {
    if (!title.trim()) {
      setError("Please enter a project title");
      inputRef.current?.focus();
      return;
    }
    setIsAdding(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description);
      formData.append("liveUrl", liveUrl);
      formData.append("githubUrl", githubUrl);
      formData.append(
        "techStack",
        JSON.stringify(
          techStack
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        )
      );
      if (imageFile) formData.append("image", imageFile);

      const res = await api.post("/projects", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProjects([...projects, res.data]);
      setTitle("");
      setDescription("");
      setTechStack("");
      setLiveUrl("");
      setGithubUrl("");
      setImageFile(null);
    } catch (err) {
      console.error("Failed to add project:", err.response || err);
      setError(
        err.response?.data?.message || err.message || "Failed to add project"
      );
    } finally {
      setIsAdding(false);
    }
  };

  const deleteProject = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-secondary text-sm">Loading projects...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && !isAdding && addProject()}
          className="col-span-2 w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all"
          placeholder="Project title"
        />
        <input
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none transition-all"
          placeholder="GitHub URL"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="col-span-2 w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none transition-all"
          placeholder="Short description"
        />
        <input
          value={liveUrl}
          onChange={(e) => setLiveUrl(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none transition-all"
          placeholder="Live / demo URL"
        />

        <input
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          className="col-span-2 w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none transition-all"
          placeholder="Tech stack (comma separated)"
        />

        <div className="col-span-1 flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="hidden"
            aria-label="Choose project image"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded-lg bg-[var(--surface-hover)] text-sm text-white hover:bg-[var(--surface)] transition"
          >
            Choose image
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary max-w-[140px] truncate">
              {imageFile ? imageFile.name : "No file chosen"}
            </span>

            {imageFile && (
              <button
                type="button"
                onClick={() => setImageFile(null)}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded"
                aria-label="Remove selected image"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={addProject}
            className={`px-4 py-2 rounded-lg bg-gradient-to-r from-[#10b981] to-[#34d399] text-white font-semibold hover:shadow-lg hover:shadow-[#10b981]/20 transition-all duration-200 ${
              !title.trim() && !isAdding ? "opacity-50" : ""
            }`}
            disabled={isAdding}
          >
            {isAdding ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      {projects.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <p className="text-secondary text-sm mb-2">No projects yet</p>
          <p className="text-muted text-xs">Add your first project above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p._id} className="relative group">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex justify-between items-center overflow-hidden">
                <div className="flex items-center gap-3">
                  {p.image ? (
                    <div className="w-16 h-16 rounded-md overflow-hidden">
                      <img
                        src={getImageUrl(p.image)}
                        alt={p.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Failed to load project image:', p.image);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-white/5 flex items-center justify-center text-sm text-secondary">
                      {p.title.substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="text-primary font-medium">{p.title}</div>
                    <div className="text-sm text-secondary">
                      {p.description}
                    </div>
                    <div className="flex gap-3 mt-2 text-sm">
                      {p.liveUrl && (
                        <a
                          href={p.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Live
                        </a>
                      )}
                      {p.githubUrl && (
                        <a
                          href={p.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/project/${p._id}`}
                    className="px-3 py-1 rounded-lg bg-[var(--surface-hover)] text-sm hover:bg-[var(--surface)] transition"
                  >
                    View
                  </Link>
                  <Link
                    to={`/project/${p._id}/edit`}
                    className="px-3 py-1 rounded-lg bg-[var(--surface-hover)] text-sm hover:bg-[var(--surface)] transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteProject(p._id)}
                    className="px-3 py-1 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                <div className="text-center text-white pointer-events-auto">
                  <div className="font-semibold text-lg">{p.title}</div>
                  <div className="text-sm mt-2 max-w-xs mx-auto">
                    {p.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}{" "}
    </div>
  );
}
