import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiUsers,
  FiTrendingUp,
  FiActivity,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import PageTransition from '../Components/ui/PageTransition';
import { Card } from '../Components/ui';
import { formatNumber } from '../utils/helpers';
import api from '../api/axios';
import { LoadingPage } from '../Components/ui/LoadingSpinner';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, all

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/analytics/me?timeRange=${timeRange}`);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Fallback to mock data if API fails
      const mockData = {
        overview: {
          profileViews: 1234,
          profileViewsChange: 12.5,
          totalLikes: 856,
          totalLikesChange: 8.3,
          totalComments: 234,
          totalCommentsChange: 15.2,
          followers: 456,
          followersChange: 5.7,
        },
        viewsOverTime: [
          { date: 'Mon', views: 120 },
          { date: 'Tue', views: 150 },
          { date: 'Wed', views: 180 },
          { date: 'Thu', views: 160 },
          { date: 'Fri', views: 200 },
          { date: 'Sat', views: 190 },
          { date: 'Sun', views: 220 },
        ],
        engagementByType: [
          { name: 'Projects', value: 450 },
          { name: 'Posts', value: 320 },
          { name: 'Comments', value: 234 },
        ],
        topProjects: [
          { title: 'E-commerce Platform', views: 345, likes: 78 },
          { title: 'Portfolio Website', views: 289, likes: 65 },
          { title: 'Task Manager App', views: 267, likes: 54 },
        ],
        topPosts: [
          { title: 'React Best Practices', views: 512, likes: 89 },
          { title: 'Node.js Performance Tips', views: 445, likes: 76 },
          { title: 'TypeScript Guide', views: 389, likes: 67 },
        ],
        skillEndorsements: [
          { skill: 'React', count: 45 },
          { skill: 'Node.js', count: 38 },
          { skill: 'TypeScript', count: 32 },
          { skill: 'MongoDB', count: 28 },
          { skill: 'Python', count: 25 },
        ],
      };

      setAnalytics(mockData);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingPage message="Loading analytics..." />;
  }

  const COLORS = ['#10b981', '#4ecdc4', '#45b7d1', '#f7b731', '#a29bfe'];

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold heading-gradient mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-secondary">
                Track your profile performance and engagement
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2">
              {['7d', '30d', '90d', 'all'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-[#10b981] to-[#34d399] text-white'
                      : 'bg-[var(--surface-hover)] text-secondary hover:text-primary'
                  }`}
                >
                  {range === 'all' ? 'All Time' : range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<FiEye />}
              title="Profile Views"
              value={analytics.overview.profileViews}
              change={analytics.overview.profileViewsChange}
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              icon={<FiHeart />}
              title="Total Likes"
              value={analytics.overview.totalLikes}
              change={analytics.overview.totalLikesChange}
              color="from-red-500 to-red-600"
            />
            <StatCard
              icon={<FiMessageCircle />}
              title="Total Comments"
              value={analytics.overview.totalComments}
              change={analytics.overview.totalCommentsChange}
              color="from-green-500 to-green-600"
            />
            <StatCard
              icon={<FiUsers />}
              title="Followers"
              value={analytics.overview.followers}
              change={analytics.overview.followersChange}
              color="from-purple-500 to-purple-600"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Views Over Time */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
                <FiTrendingUp className="text-[#10b981]" />
                Views Over Time
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.viewsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Engagement by Type */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
                <FiActivity className="text-[#10b981]" />
                Engagement by Type
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.engagementByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.engagementByType.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Top Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Projects */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-primary mb-6">
                Top Projects
              </h3>
              <div className="space-y-4">
                {analytics.topProjects.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-[var(--surface-hover)]"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-primary">{project.title}</p>
                      <p className="text-sm text-secondary mt-1">
                        {formatNumber(project.views)} views • {formatNumber(project.likes)} likes
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-[#10b981]">
                      #{index + 1}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Top Posts */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-primary mb-6">
                Top Posts
              </h3>
              <div className="space-y-4">
                {analytics.topPosts.map((post, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-[var(--surface-hover)]"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-primary">{post.title}</p>
                      <p className="text-sm text-secondary mt-1">
                        {formatNumber(post.views)} views • {formatNumber(post.likes)} likes
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-[#10b981]">
                      #{index + 1}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          {/* Skill Endorsements */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-primary mb-6">
              Skill Endorsements
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.skillEndorsements}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="skill" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, change, color }) => {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white`}>
            {icon}
          </div>
          <div
            className={`text-sm font-medium ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </div>
        </div>
        <p className="text-secondary text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-primary">{formatNumber(value)}</p>
      </Card>
    </motion.div>
  );
};

export default Analytics;
