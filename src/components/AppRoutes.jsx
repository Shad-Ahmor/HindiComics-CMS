import React, { useState, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./CMSLogin";
import CMSLayout from "./CMSLayout";
import Comics from "./comics/Comics";
import ContentManager from "./contents/ContentManager";
import ReferralDashboard from "./marketting/Referal";
import CouponPage from "./management/CouponPage";
import UserLogs from "./management/UserLogs";

// ✅ ProtectedRoute component with permission check
function ProtectedRoute({ useruidrole,user, module, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ✅ Map paths to menu names
const pathToMenu = {
  "/cms": "Dashboard",
  "/cms/dashboard": "Dashboard",
  "/cms/comics": "Comics",
  "/cms/content": "Contents",
  "/cms/coupons": "Coupons",
  "/cms/referral": "Referrals",
  "/cms/userlogs": "User Logs",
};

export default function AppRoutes({ user, setUser, theme }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const initialMenu = pathToMenu[currentPath] || "Dashboard";
  const storedUserRole = JSON.parse(localStorage.getItem("hc_user_role")) || "";

  const [useruidrole, setUseruidRole] = useState(storedUserRole);



  // ✅ Logout handler
  const handleLogout = () => {
    if (user?.logout) user.logout();
    setUser(null);
    localStorage.removeItem("hc_user"); // clear persistent storage
      localStorage.removeItem("hc_user_role"); // Clear role

  };

  return (
    <Routes>
      {/* LOGIN ROUTE */}
      <Route path="/login" element={<Login onLogin={setUser} setUseruidRole={setUseruidRole} />} />

      {/* CMS LAYOUT with nested routes */}
      <Route path="/cms/*" element={<CMSLayout user={user} useruidrole={useruidrole} onLogout={handleLogout} theme={theme} initialMenu={initialMenu} />}>

        {/* Dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute useruidrole={useruidrole} user={user} module="Dashboard">
              <div>Dashboard</div>
            </ProtectedRoute>
          }
        />

        {/* Comics */}
        <Route
          path="comics"
          element={
            <ProtectedRoute useruidrole={useruidrole} user={user} module="Comics">
              <Comics user={user} />
            </ProtectedRoute>
          }
        />

        {/* Contents */}
        <Route
          path="content"
          element={
            <ProtectedRoute user={user} module="Contents">
              <ContentManager />
            </ProtectedRoute>
          }
        />

        {/* Referrals */}
        <Route
          path="referral"
          element={
            <ProtectedRoute useruidrole={useruidrole}  user={user} module="Referrals">
              <ReferralDashboard token={user?.token} />
            </ProtectedRoute>
          }
        />

        {/* Coupons */}
        <Route
          path="coupons"
          element={
            <ProtectedRoute useruidrole={useruidrole}  user={user} module="Coupons">
              <CouponPage user={user} token={user?.token} />
            </ProtectedRoute>
          }
        />

        {/* User Logs */}
        <Route
          path="userlogs"
          element={
            <ProtectedRoute useruidrole={useruidrole}  user={user} module="User Logs">
              <UserLogs token={user?.token} />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback Routes */}
      <Route path="/" element={<Navigate to="/cms/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/cms/dashboard" replace />} />
    </Routes>
  );
}
