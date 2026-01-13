export default function About() {
  const features = [
    {
      icon: "🚀",
      title: "Showcase Projects",
      description: "Display your best work and let others see what you've built",
    },
    {
      icon: "👥",
      title: "Connect with Developers",
      description: "Find and connect with other developers in the community",
    },
    {
      icon: "💼",
      title: "Build Your Portfolio",
      description: "Create a professional portfolio to share with employers",
    },
    {
      icon: "🔧",
      title: "Skill Management",
      description: "Highlight your skills and technologies you work with",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold heading-gradient mb-4">
          About DevConnect
        </h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
          A platform designed to help developers showcase their work, connect with peers, and build their professional presence.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {features.map((feature, index) => (
          <div
            key={index}
            className="card-surface p-6 rounded-xl hover:scale-[1.02] transition-transform duration-200"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              {feature.title}
            </h3>
            <p className="text-[var(--text-secondary)]">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Mission Section */}
      <div className="card-surface p-8 rounded-xl mb-12">
        <h2 className="text-3xl font-bold heading-gradient mb-4">Our Mission</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
          DevConnect was created to bridge the gap between developers and opportunities.
          We believe that every developer deserves a platform to showcase their work,
          share their knowledge, and connect with like-minded individuals.
        </p>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          Whether you're a seasoned professional or just starting your coding journey,
          DevConnect provides the tools you need to build your online presence and
          grow your network.
        </p>
      </div>

      {/* Tech Stack */}
      <div className="card-surface p-8 rounded-xl">
        <h2 className="text-3xl font-bold heading-gradient mb-6">Built With</h2>
        <div className="flex flex-wrap gap-3">
          {["React", "Node.js", "MongoDB", "Express", "Tailwind CSS", "Axios"].map(
            (tech) => (
              <span
                key={tech}
                className="px-4 py-2 rounded-full bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium"
              >
                {tech}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
