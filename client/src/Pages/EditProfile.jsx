import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    api
      .get("/user/me")
      .then((res) => {
        setUser(res.data);
        setName(res.data.name || "");
        setUsername(res.data.username || "");
        setBio(res.data.bio || "");
        if (res.data.avatar) {
          // show absolute url for preview
          const avatarUrl = res.data.avatar.startsWith("http")
            ? res.data.avatar
            : `http://localhost:5000${res.data.avatar}`;
          setPreview(avatarUrl);
        }
      })
      .catch(() => navigate("/login"))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  };

  const handleChooseFile = () => {
    document.getElementById("avatar-input")?.click();
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("username", username);
      formData.append("bio", bio);
      if (file) formData.append("avatar", file);

      // note: server expects PUT /user/profile for updates with file
      const res = await api.put("/user/profile", formData);
      setUser(res.data);
      setMessage({ type: "success", text: "Profile updated successfully!" });

      // notify other components (NavBar) about update
      window.dispatchEvent(
        new CustomEvent("userUpdated", { detail: res.data })
      );

      // update preview from server response if avatar changed
      if (res.data.avatar) {
        const avatarUrl = res.data.avatar.startsWith("http")
          ? res.data.avatar
          : `http://localhost:5000${res.data.avatar}`;
        setPreview(avatarUrl);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setIsSaving(false);
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

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold heading-gradient mb-2">
          Edit Profile
        </h1>
        <p className="text-secondary">Update your profile information</p>
      </div>

      <div className="card-surface p-8 rounded-xl">
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-500/10 border border-green-500/20"
                : "bg-red-500/10 border border-red-500/20"
            }`}
          >
            <p
              className={`text-sm text-center ${
                message.type === "success" ? "text-green-400" : "text-red-400"
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSave}>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-secondary mb-2"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-zinc-800 p-3 rounded-xl"
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-secondary mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your-username"
              className="w-full bg-zinc-800 p-3 rounded-xl"
            />
          </div>

          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-secondary mb-2"
            >
              Bio
            </label>
            <textarea
              id="bio"
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="w-full bg-zinc-800 p-3 rounded-xl"
            />
            <p className="mt-1 text-xs text-muted">
              Write a brief description about yourself
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Avatar
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                {preview ? (
                  <img
                    src={preview}
                    alt="avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-secondary">No image</div>
                )}
              </div>
              <div className="flex flex-col">
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleChooseFile}
                  className="px-4 py-2 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-sm"
                >
                  Change Picture
                </button>
                <p className="mt-1 text-xs text-muted">
                  Optional - upload a profile photo
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#10b981] to-[#34d399] text-white font-semibold hover:shadow-lg hover:shadow-[#10b981]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-secondary hover:bg-[var(--surface)] transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
