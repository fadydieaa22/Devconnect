import Projects from "./Projects";

export default function ProjectsCard({ className = "" }) {
  return (
    <div className={`card-surface p-6 rounded-xl lg:col-span-2 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold heading-gradient">My Projects</h3>
        <div className="w-10 h-10 rounded-lg bg-[#10b981]/20 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-[#10b981]"
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
      </div>
      <Projects />
    </div>
  );
}
