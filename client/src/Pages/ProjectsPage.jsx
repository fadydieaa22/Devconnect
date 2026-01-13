import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBriefcase, FiPlus, FiFilter, FiSearch, FiX } from "react-icons/fi";
import api from "../api/axios";
import PageTransition from "../Components/ui/PageTransition";
import { Card, Button, Badge, Avatar } from "../Components/ui";
import { LoadingPage } from "../Components/ui/LoadingSpinner";
import EmptyState from "../Components/ui/EmptyState";
import { formatRelativeTime, formatNumber } from "../utils/helpers";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    technology: "",
    sortBy: "recent", // recent, popular, likes
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, projects]);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data);
      setFilteredProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchLower) ||
          project.description?.toLowerCase().includes(searchLower) ||
          project.technologies?.some((tech) =>
            tech.toLowerCase().includes(searchLower)
          )
      );
    }

    // Technology filter
    if (filters.technology) {
      const techLower = filters.technology.toLowerCase();
      filtered = filtered.filter((project) =>
        project.technologies?.some((tech) =>
          tech.toLowerCase().includes(techLower)
        )
      );
    }

    // Sort
    switch (filters.sortBy) {
      case "popular":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "likes":
        filtered.sort(
          (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
        );
        break;
      case "recent":
      default:
        filtered.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
    }

    setFilteredProjects(filtered);
  };

  const clearFilters = () => {
    setFilters({ search: "", technology: "", sortBy: "recent" });
  };

  const hasActiveFilters =
    filters.search || filters.technology || filters.sortBy !== "recent";

  if (isLoading) {
    return <LoadingPage message="Loading projects..." />;
  }

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold heading-gradient mb-2 flex items-center gap-3">
                  <FiBriefcase className="text-[#10b981]" />
                  Developer Projects
                </h1>
                <p className="text-secondary">
                  Discover amazing projects from the community
                </p>
              </div>
              <Link to="/dashboard">
                <Button leftIcon={<FiPlus />}>Create Project</Button>
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <Card className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                  <input
                    type="text"
                    placeholder="Search projects by title, description, or technology..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                  />
                </div>

                {/* Technology Filter */}
                <input
                  type="text"
                  placeholder="Filter by technology..."
                  value={filters.technology}
                  onChange={(e) =>
                    setFilters({ ...filters, technology: e.target.value })
                  }
                  className="lg:w-48 px-4 py-2 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                />

                {/* Sort */}
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({ ...filters, sortBy: e.target.value })
                  }
                  className="lg:w-40 px-4 py-2 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-primary focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="likes">Most Liked</option>
                </select>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} leftIcon={<FiX />}>
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
                  {filters.technology && (
                    <Badge
                      variant="primary"
                      removable
                      onRemove={() =>
                        setFilters({ ...filters, technology: "" })
                      }
                    >
                      Tech: {filters.technology}
                    </Badge>
                  )}
                  {filters.sortBy !== "recent" && (
                    <Badge variant="primary">
                      Sort: {filters.sortBy === "popular" ? "Popular" : "Most Liked"}
                    </Badge>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-secondary">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <EmptyState
              icon="🚀"
              title="No projects found"
              description={
                hasActiveFilters
                  ? "Try adjusting your filters"
                  : "No projects available yet. Be the first to create one!"
              }
              actionLabel={hasActiveFilters ? "Clear Filters" : "Create Project"}
              onAction={
                hasActiveFilters
                  ? clearFilters
                  : () => (window.location.href = "/dashboard")
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/project/${project._id}`}>
                    <Card className="h-full overflow-hidden group">
                      {/* Project Image */}
                      {project.image && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                      )}

                      <div className="p-6">
                        {/* Author */}
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar user={project.user} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-primary">
                              {project.user?.name}
                            </p>
                            <p className="text-xs text-secondary">
                              {formatRelativeTime(project.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-[#10b981] transition-colors line-clamp-2">
                          {project.title}
                        </h3>

                        {/* Description */}
                        <p className="text-secondary text-sm mb-4 line-clamp-3">
                          {project.description}
                        </p>

                        {/* Technologies */}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.technologies.slice(0, 3).map((tech) => (
                              <Badge key={tech} variant="default" size="sm">
                                {tech}
                              </Badge>
                            ))}
                            {project.technologies.length > 3 && (
                              <Badge variant="default" size="sm">
                                +{project.technologies.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-secondary pt-4 border-t border-[var(--border)]">
                          <span>❤️ {formatNumber(project.likes?.length || 0)}</span>
                          <span>💬 {formatNumber(project.comments?.length || 0)}</span>
                          <span>👁️ {formatNumber(project.views || 0)}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
