import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    api
      .get(`/projects/${id}`)
      .then((res) => {
        if (!mounted) return;
        setProject(res.data);
        setTitle(res.data.title || "");
        setDescription(res.data.description || "");
        setTechStack((res.data.techStack || []).join(", "));
        setLiveUrl(res.data.liveUrl || "");
        setGithubUrl(res.data.githubUrl || "");
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, [id]);

  const validate = () => {
    if (!title.trim()) {
      setError("Title is required");
      inputRef.current?.focus();
      return false;
    }
    try {
      if (liveUrl && !new URL(liveUrl)) return false;
    } catch (err) {
      console.warn(err);
      setError("Live URL is invalid");
      return false;
    }
    return true;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
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

      await api.put(`/projects/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(`/project/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save project");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-secondary">Loading project...</p>;
  if (!project) return <p className="text-secondary">Project not found.</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Edit Project</h1>
      <div className="grid grid-cols-1 gap-3">
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none"
          placeholder="Title"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none"
          placeholder="Description"
        />
        <input
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none"
          placeholder="Tech stack (comma separated)"
        />
        <input
          value={liveUrl}
          onChange={(e) => setLiveUrl(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none"
          placeholder="Live / demo URL"
        />
        <input
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none"
          placeholder="GitHub URL"
        />
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          <button
            onClick={save}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#10b981] to-[#34d399] text-white"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
        {error && <p className="text-red-400">{error}</p>}
      </div>
    </div>
  );
}
