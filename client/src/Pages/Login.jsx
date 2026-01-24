import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiArrowLeft } from "react-icons/fi";
import api from "../api/axios";
import { Button, Input, Card } from "../Components/ui";
import PageTransition from "../Components/ui/PageTransition";
import { useAuthStore } from "../store/useStore";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", formData);

      // Set token in store and localStorage
      setToken(res.data.token);
      localStorage.setItem("token", res.data.token);

      // Fetch user data
      const userRes = await api.get("/user/me", {
        headers: { Authorization: `Bearer ${res.data.token}` },
      });

      // Set user in store
      setUser(userRes.data);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 via-transparent to-[#34d399]/5 pointer-events-none" />

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#34d399] flex items-center justify-center text-white font-bold text-2xl shadow-lg"
              >
                D
              </motion.div>
              <h2 className="text-3xl font-bold mb-2 heading-gradient">
                Welcome Back
              </h2>
              <p className="text-secondary">
                Sign in to continue to DevConnect
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <p className="text-red-400 text-sm text-center font-medium">
                  {error}
                </p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<FiMail />}
                required
              />

              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                leftIcon={<FiLock />}
                required
              />

              <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 space-y-3 text-center">
              <p className="text-sm text-secondary">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-[#10b981] hover:text-[#34d399] transition-colors"
                >
                  Create one now
                </Link>
              </p>

              <Link to="/">
                <motion.button
                  className="text-sm text-secondary hover:text-primary transition-colors flex items-center gap-2 mx-auto"
                  whileHover={{ x: -5 }}
                >
                  <FiArrowLeft />
                  Back to Home
                </motion.button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
