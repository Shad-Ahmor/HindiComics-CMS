import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import CountUp from "react-countup";
import api from "./common/api";
import "../styles/Dashboard.css";

export default function CMSDashboard() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const res = await api.post("/dashboard/comicssummary", {
        user: JSON.parse(localStorage.getItem("hc_user")) || null,
      });
      setCounts(res.data.counts);
    } catch (err) {
      setError("Failed to fetch dashboard summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  if (loading)
    return (
      <div className="text-center mt-20 text-xl text-[var(--color-text-primary)]">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="text-center mt-20 text-xl text-[var(--color-delete)]">
        {error}
      </div>
    );

  const dashboardItems = [
    { title: "Comics", count: counts.comics, color: "#4f46e5" },
    { title: "Stories", count: counts.stories, color: "#8b5cf6" },
    { title: "Jokes", count: counts.jokes, color: "#10b981" },
    { title: "Shayari", count: counts.shayari, color: "#a78bfa" },
    { title: "Education Books", count: counts.educationBooks, color: "#facc15" },
    { title: "Religious Books", count: counts.religiousBooks, color: "#ef4444" },
    { title: "Coupons", count: counts.coupons, color: "#14b8a6" },
    { title: "Users", count: counts.users, color: "#6b7280" },
    { title: "Suggestions", count: counts.suggestions, color: "#f97316" },
    { title: "Content Items", count: counts.content, color: "#3b82f6" },
    { title: "Referred Users", count: counts.referredUsers, color: "#84cc16" },
    { title: "User Logs", count: counts.logs, color: "#06b6d4" },
  ];

  const cardWithMiniGraph = ({ title, count, color }) => {
    const miniData = Array.from({ length: 7 }).map((_, i) => ({
      day: `D${i + 1}`,
      value: Math.floor(Math.random() * (count || 10)),
    }));

    return (
      <motion.div
        key={title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.06, boxShadow: `0 25px 50px ${color}66` }}
        className="glass-card dashboard-card enhanced-card"
      >
        <div className="card-title">{title}</div>
        <div className="card-count">
          <CountUp start={0} end={count || 0} duration={1.5} separator="," />
        </div>
        <ResponsiveContainer width="100%" height={50}>
          <LineChart data={miniData}>
            <XAxis dataKey="day" hide />
            <YAxis hide domain={[0, Math.max(...miniData.map((d) => d.value))]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-panel-bg)",
                border: "none",
                borderRadius: "12px",
                color: "var(--color-text-primary)",
              }}
              formatter={(value) => [`Count: ${value}`]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={{ r: 4 }}
              className="glow-line"
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    );
  };

  const pieColors = ["#4f46e5", "#8b5cf6", "#10b981", "#a78bfa", "#facc15", "#ef4444", "#14b8a6"];

  const lineChartData = dashboardItems.map((item) => ({
    name: item.title,
    count: item.count || 0,
    color: item.color,
  }));

  return (
  <div className="vision-container">
        <div className="card">
          
                <div className="sparkles-bg"></div>
      <h1 className="dashboard-header">CMS Dashboard</h1>

      <div className="dashboard-grid">{dashboardItems.map(cardWithMiniGraph)}</div>

      <div className="analytics-section">
        <h2 className="analytics-header">Analytics Overview</h2>
        <div className="charts-container">
          {/* Bar Chart */}
          <motion.div className="chart-card holo-card" whileHover={{ scale: 1.02 }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboardItems}>
                <XAxis dataKey="title" stroke="var(--color-text-primary)" />
                <YAxis stroke="var(--color-text-primary)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-panel-bg)",
                    borderRadius: "12px",
                    border: "none",
                  }}
                  formatter={(value) => [`Count: ${value}`]}
                />
                <Bar dataKey="count">
                  {dashboardItems.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="pie-hover-cell"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart */}
          <motion.div className="chart-card holo-card" whileHover={{ scale: 1.02 }}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dashboardItems}
                  dataKey="count"
                  nameKey="title"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {dashboardItems.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={pieColors[index % pieColors.length]}
                      className="pie-hover-cell"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-panel-bg)",
                    borderRadius: "12px",
                    border: "none",
                  }}
                  formatter={(value) => [`Count: ${value}`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Line Chart */}
          <motion.div className="chart-card holo-card" whileHover={{ scale: 1.02 }}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineChartData}>
                <XAxis dataKey="name" stroke="var(--color-text-primary)" />
                <YAxis stroke="var(--color-text-primary)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-panel-bg)",
                    borderRadius: "12px",
                    border: "none",
                  }}
                  formatter={(value, name) => [`Count: ${value}`, name]}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  className="glow-line"
                  activeDot={{ r: 8, stroke: "#fff", strokeWidth: 3 }}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
    </div>
  );
}
