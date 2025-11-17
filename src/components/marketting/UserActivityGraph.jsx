import React, { useEffect, useState, useMemo } from "react";
import { Chart } from "react-google-charts";
import api from "../common/api";
import { LucideClock } from "lucide-react";

export default function UserActivityGraph({token}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Time filter limits (static constant)
  const filterToTimeLimit = {
    all: 0,
    active: 5 * 60 * 1000,
    today: 24 * 60 * 60 * 1000,
    yesterday: 48 * 60 * 60 * 1000,
    this_week: 7 * 24 * 60 * 60 * 1000,
    this_month: 30 * 24 * 60 * 60 * 1000,
    this_year: 365 * 24 * 60 * 60 * 1000,
  };

  // ================================================
  // SINGLE API CALL — triggered only when filter changes
  // ================================================
  useEffect(() => {
    async function fetchLogs() {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        setLoading(true);

        const { data } = await api.get("/userlogs/referredbyme", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            filter,
            timeLimit: filterToTimeLimit[filter] ?? 0,
          },
        });

        const safeArray = Array.isArray(data) ? data : [];

        const formatted = safeArray.map((log, index) => ({
          id: `log-${index}`,
          email: log.email ?? "",
          date: log.date ?? "",
          isActive: Boolean(log.isActive),
        }));

        setLogs(formatted);
      } catch (err) {
        console.error("Error fetching user logs:", err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [filter]);

  // ================================================
  // SAFE MEMO — Prepares graph data
  // ================================================
  const chartData = useMemo(() => {
    if (!logs.length) {
      return [["Date", "Active Users", "Inactive Users"]];
    }

    const grouped = {};

    logs.forEach((log) => {
      if (!log.date) return;

      if (!grouped[log.date]) {
        grouped[log.date] = { active: new Set(), inactive: new Set() };
      }

      if (log.isActive) grouped[log.date].active.add(log.email);
      else grouped[log.date].inactive.add(log.email);
    });

    const rows = [["Date", "Active Users", "Inactive Users"]];

    Object.keys(grouped)
      .sort()
      .forEach((date) => {
        rows.push([
          date,
          grouped[date].active.size,
          grouped[date].inactive.size,
        ]);
      });

    return rows;
  }, [logs]);

  const options = {
    chart: {
      title: "यूज़र गतिविधि अवलोकन",
      subtitle: "प्रति दिन सक्रिय बनाम निष्क्रिय यूज़र",
    },
    isStacked: true,
    chartArea: { width: "85%", height: "65%" },
    legend: { position: "top" },
    backgroundColor: "transparent",
  };

  return (
    <div className="w-full">
      {/* Filter Dropdown */}
      <div className="flex items-center mb-4 gap-3">
        <LucideClock className="w-4 h-4 text-indigo-400" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="vision-input vision-select"
        >
          <option value="all">कुल समय</option>
          <option value="active">वर्तमान सक्रिय</option>
          <option value="today">आज</option>
          <option value="yesterday">कल</option>
          <option value="this_week">इस सप्ताह</option>
          <option value="this_month">इस माह</option>
          <option value="this_year">इस वर्ष</option>
        </select>
      </div>

      {/* Chart */}
      <div
        className="vision-panel glass-card p-4 flex justify-center items-center"
        style={{ minHeight: 420 }}
      >
        {loading ? (
          <div className="text-center vision-text-secondary">
            <div className="w-8 h-8 border-4 border-t-4 border-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>
            <p>ग्राफ़ लोड हो रहा है...</p>
          </div>
        ) : chartData.length > 1 ? (
          <Chart
            chartType="Bar"
            data={chartData}
            options={options}
            width="100%"
            height="400px"
            loader={<div>Loading...</div>}
          />
        ) : (
          <p className="vision-text-secondary text-center py-6">
            कोई यूज़र गतिविधि उपलब्ध नहीं है।
          </p>
        )}
      </div>
    </div>
  );
}
