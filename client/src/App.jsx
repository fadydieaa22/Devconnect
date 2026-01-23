import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { queryClient } from "./config/queryClient";
import { useSocket } from "./hooks/useSocket";
import { useAuthStore } from "./store/useStore";
import api from "./api/axios";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import ProtectedRoute from "./Components/ProtectedRoutes";
import PublicProfile from "./Pages/PublicProfile";
import About from "./Pages/About";
import ProjectsPage from "./Pages/ProjectsPage";
import Contacts from "./Pages/Contacts";
import Home from "./Pages/Home";
import EditProfile from "./Pages/EditProfile";
import Users from "./Pages/Users";
import ProjectDetail from "./Pages/ProjectDetail";
import EditProject from "./Pages/EditProject";
import Feed from "./Pages/Feed";
import Messages from "./Pages/Messages";
import Analytics from "./Pages/Analytics";
import SavedPosts from "./Pages/SavedPosts";
import MyProfile from "./Pages/MyProfile";
import FollowRequests from "./Pages/FollowRequests";
import EnhancedNavBar from "./Components/EnhancedNavBar";
import { ToastProvider } from "./Components/ToastProvider";

function AppContent() {
  const { user, setUser, token } = useAuthStore();

  // Fetch user data if token exists but user is not loaded
  useEffect(() => {
    const loadUser = async () => {
      if (token && !user) {
        try {
          const { data } = await api.get("/user/me");
          setUser(data);
        } catch (error) {
          // 401 handled by axios interceptor, don't log
          if (error.response?.status !== 401) {
            console.error("Failed to load user:", error);
          }
        }
      }
    };

    loadUser();
  }, [token, user, setUser]);

  // Initialize socket connection for authenticated users
  useSocket();

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <EnhancedNavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/users" element={<Users />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedPosts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:id/edit"
          element={
            <ProtectedRoute>
              <EditProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/follow-requests"
          element={
            <ProtectedRoute>
              <FollowRequests />
            </ProtectedRoute>
          }
        />
        <Route path="/profile/:username" element={<PublicProfile />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <AppContent />
        </Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--surface)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
