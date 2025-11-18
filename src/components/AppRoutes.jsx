import React, { useState, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./CMSLogin";
import CMSLayout from "./CMSLayout";
import Comics from "./comics/Comics";
import ContentManager from "./contents/ContentManager";
import ReferralDashboard from "./marketting/Referal";
import CouponPage from "./management/CouponPage";
import UserLogs from "./management/UserLogs";
import CMSDashboard from "./CMSDashboard";

export default function AppRoutes({ user, setUser, theme }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const pathToMenu = {
    "/cms": "Dashboard",
    "/cms/dashboard": "Dashboard",
    "/cms/comics": "Comics",
    "/cms/content": "Contents",
    "/cms/coupons": "Coupons",
    "/cms/referral": "Referrals",
    "/cms/userlogs": "User Logs",
  };

  const initialMenu = pathToMenu[currentPath] || "Dashboard";
  const storedUserRole = JSON.parse(localStorage.getItem("hc_user_role")) || "";
  const [useruidrole, setUseruidRole] = useState(storedUserRole);

  // Logout
  const handleLogout = () => {
    if (user?.logout) user.logout();
    setUser(null);
    localStorage.removeItem("hc_user");
    localStorage.removeItem("hc_user_role");
  };

  return (
    <Routes>
      {/* LOGIN should always be accessible */}
      <Route path="/" element={<Login onLogin={setUser} setUseruidRole={setUseruidRole} />} />

      {/* PROTECTED CMS ROUTES */}
      <Route
        path="/cms/*"
        element={
          user ? (
            <CMSLayout
              user={user}
              useruidrole={useruidrole}
              onLogout={handleLogout}
              theme={theme}
              initialMenu={initialMenu}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<CMSDashboard />} />
        <Route path="comics" element={<Comics user={user} />} />
        <Route path="content" element={<ContentManager />} />
        <Route path="referral" element={<ReferralDashboard token={user?.token} />} />
        <Route path="coupons" element={<CouponPage user={user} token={user?.token} />} />
        <Route path="userlogs" element={<UserLogs token={user?.token} />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
