import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiArrowRight, FiUsers, FiBriefcase, FiTrendingUp, FiCode } from "react-icons/fi";
import { Button } from "../Components/ui";
import Card from "../Components/ui/Card";
import PageTransition from "../Components/ui/PageTransition";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  const features = [
    {
      icon: <FiBriefcase className="w-8 h-8" />,
      title: "Showcase Your Work",
      description: "Build a stunning portfolio and display your projects to the world",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "Connect & Collaborate",
      description: "Find and connect with talented developers worldwide",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: "Build Your Brand",
      description: "Create a professional online presence that stands out",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: <FiCode className="w-8 h-8" />,
      title: "Manage Skills",
      description: "Highlight your expertise and track your growth",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Developers" },
    { value: "50K+", label: "Projects Shared" },
    { value: "100+", label: "Countries" },
  ];

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-4rem)]">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/10 via-transparent to-[#34d399]/10 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold heading-gradient mb-6 leading-tight">
                  Welcome to DevConnect
                </h1>
              </motion.div>
              
              <motion.p
                className="text-xl md:text-2xl text-secondary max-w-3xl mx-auto mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                The ultimate platform for developers to showcase their work, connect with peers,
                and grow their professional network.
              </motion.p>
              
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button size="lg" rightIcon={<FiArrowRight />}>
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <Button size="lg" rightIcon={<FiArrowRight />}>
                        Get Started Free
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button size="lg" variant="secondary">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <div className="text-3xl md:text-4xl font-bold heading-gradient mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm md:text-base text-secondary">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center heading-gradient mb-4">
              Why Choose DevConnect?
            </h2>
            <p className="text-center text-secondary max-w-2xl mx-auto mb-16">
              Everything you need to build and showcase your developer portfolio
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full group cursor-pointer">
                  <motion.div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-primary mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card glass className="p-12 md:p-16 text-center relative overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/20 to-[#34d399]/20 pointer-events-none" />
              
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold heading-gradient mb-6">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-secondary mb-10 max-w-2xl mx-auto">
                  Join thousands of developers who are already building their portfolios and growing their careers on DevConnect.
                </p>
                {!isAuthenticated && (
                  <Link to="/register">
                    <Button size="xl" rightIcon={<FiArrowRight />}>
                      Create Your Account
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          </motion.div>
        </section>
      </div>
    </PageTransition>
  );
}

