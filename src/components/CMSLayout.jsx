import React, { useState, useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopPanel from "./TopPanel";
import Comics from "./comics/Comics";
import ContentManager from "./contents/ContentManager";
import ReferralDashboard from "./marketting/Referal";
import CouponPage from "./management/CouponPage";
import UserLogs from "./management/UserLogs";
import { can } from "./common/permissions";

// Map routes to sidebar menu names
const pathToMenu = {
  "/cms": "Dashboard",
  "/cms/dashboard": "Dashboard",
  "/cms/comics": "Comics",
  "/cms/content": "Contents",
  "/cms/coupons": "Coupons",
  "/cms/referral": "Referrals",
  "/cms/userlogs": "User Logs",
};

export default function CMSLayout({ user, useruidrole: propUserRole, onLogout, theme }) {
  const location = useLocation();
  const currentPath = location.pathname;

  // ✅ Active menu derived from URL path
  const [activeMenu, setActiveMenu] = useState(pathToMenu[currentPath] || "Dashboard");

  // ✅ Initialize useruidrole from prop or localStorage to persist on refresh
const [useruidrole, setUseruidrole] = useState(() => {
  const saved = JSON.parse(localStorage.getItem("hc_user_role"));
  return propUserRole || saved || {};
});


  // Update active menu when path changes
  useEffect(() => {
    setActiveMenu(pathToMenu[currentPath] || "Dashboard");
  }, [currentPath]);

  // Sync prop changes
  useEffect(() => {
    if (propUserRole) {
      setUseruidrole(propUserRole);
      localStorage.setItem("hc_user_role", JSON.stringify(propUserRole));
    }
  }, [propUserRole]);

  const token = typeof user?.getToken === "function" ? user.getToken() : null;
  const uid = useruidrole?.uid || null;
  const role = useruidrole?.role ? String(useruidrole.role) : "user";



  // Conditionally render page based on permissions
  const renderPage = () => {
    switch (activeMenu) {
      case "Comics":
        return <Comics user={user} userrole={role} token={token} uid={uid} /> ;
      case "Contents":
        return <ContentManager /> ;
      case "Referrals":
        return  <ReferralDashboard token={token} /> ;
      case "Coupons":
        return <CouponPage user={user} token={token} /> ;
      case "User Logs":
        return <UserLogs token={token} />;
      default:
        return (
          <div className="p-8">
            <h1 className="text-3xl font-semibold vision-text-primary">
              Hindi Comics CMS में आपका स्वागत है
            </h1>
            <p className="mt-3 vision-text-secondary text-lg">
              शुरू करने के लिए बाईं ओर के साइडबार से कोई विकल्प चुनें।
            </p>
          </div>
        );
    }
  };

  return (
    <div className="app-container flex min-h-screen">
      {/* Sidebar with active menu */}
      <Sidebar user={user} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      {/* Main panel */}
      <div className="maincontentpanel flex-1 transition-all duration-300 relative p-6">
        <TopPanel user={user} onLogout={onLogout} theme={theme} />

        {/* Render content based on permissions */}
        {renderPage()}
      </div>
    </div>
  );
}
