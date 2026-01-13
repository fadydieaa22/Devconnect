import { useState } from "react";
import { motion } from "framer-motion";
import { FiImage, FiX } from "react-icons/fi";
import Modal from "../ui/Modal";
import { Button, Input, TextArea, Badge } from "../ui";
import Avatar from "../ui/Avatar";
import api from "../../api/axios";
import toast from "react-hot-toast";

const CreateProjectModal = ({ isOpen, onClose, user, onProjectCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !techStack.includes(tag) && techStack.length < 20) {
        setTechStack([...techStack, tag]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTechStack(techStack.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("techStack", JSON.stringify(techStack));
      if (liveUrl) formData.append("liveUrl", liveUrl);
      if (githubUrl) formData.append("githubUrl", githubUrl);
      if (image) formData.append("image", image);

      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const { data } = await api.post("/projects", formData, config);
      toast.success("Project created!");
      if (onProjectCreated) onProjectCreated(data);
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setTechStack([]);
    setTagInput("");
    setLiveUrl("");
    setGithubUrl("");
    setImage(null);
    setImagePreview(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Project"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3">
          <Avatar user={user} size="md" />
          <div>
            <p className="font-semibold text-primary">{user?.name}</p>
            <p className="text-sm text-secondary">@{user?.username}</p>
          </div>
        </div>

        <Input
          label="Title"
          placeholder="Project title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <TextArea
          label="Description"
          placeholder="Briefly describe your project"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
        />

        {/* Tech Stack Tags */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Tech Stack
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {techStack.map((tag) => (
              <Badge
                key={tag}
                variant="primary"
                removable
                onRemove={() => removeTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
          <Input
            placeholder="Add tech (press Enter or comma)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            disabled={techStack.length >= 20}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Live URL"
            placeholder="https://example.com"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
          />
          <Input
            label="GitHub URL"
            placeholder="https://github.com/your/repo"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Cover Image
          </label>
          {imagePreview ? (
            <div className="relative w-full max-h-60 rounded overflow-hidden">
              <img
                src={imagePreview}
                alt="preview"
                className="w-full h-auto object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
              >
                <FiX />
              </button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="image/*"
                id="project-image"
                className="hidden"
                onChange={handleImageSelect}
              />
              <label htmlFor="project-image">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  leftIcon={<FiImage />}
                  onClick={() =>
                    document.getElementById("project-image").click()
                  }
                >
                  Add Cover Image
                </Button>
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <div></div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={!title.trim()}
            >
              Create Project
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
