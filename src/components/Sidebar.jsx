/* Sidebar.jsx */
import React, { useState, useEffect } from "react";

import { getAllowedRoutes } from "./common/rolePermissions";

import { NavLink } from "react-router-dom";
import {
Home, BookOpen, Layers, Ticket, Share2, Activity, MessageSquare,
ChevronsLeft, ChevronsRight, Menu
} from "lucide-react";
import { routesConfig } from "./common/routesConfig";

const iconMap = {
Dashboard: Home,
Comics: BookOpen,
Contents: Layers,
Coupons: Ticket,
Referrals: Share2,
"User Logs": Activity,
Suggestions: MessageSquare,
};

export default function Sidebar({ role,user, activeMenu, setActiveMenu }) {

      const allowedRoutes = getAllowedRoutes(role);

const [collapsed, setCollapsed] = useState(false);
const [mobileOpen, setMobileOpen] = useState(false);
const [windowWidth, setWindowWidth] = useState(window.innerWidth);

useEffect(() => {
const handleResize = () => setWindowWidth(window.innerWidth);
window.addEventListener("resize", handleResize);
if (window.innerWidth <= 768) setCollapsed(true);
return () => window.removeEventListener("resize", handleResize);
}, []);

const toggleSidebar = () => {
if (windowWidth <= 768) setMobileOpen(!mobileOpen);
else setCollapsed(!collapsed);
};

return (
<>
{windowWidth <= 768 && ( <button className="mobile-hamburger" onClick={toggleSidebar}> <Menu size={24} /> </button>
)}
{windowWidth <= 768 && mobileOpen && (
<div className="mobile-overlay" onClick={() => setMobileOpen(false)}></div>
)}


  <aside className={`sidebarpanel ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
    <div className="logo-container">
      <div className="logo">
        <div className="logo-icon">
          <img
            src="/logos/hindicomics.jpg"
            alt="HindiComics Logo"
            style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
          />
        </div>
        {!collapsed && (
          <div className="brand-name">
            <span className="name">HindiComics CMS</span>
            <span className="role">{user?.role || "User"}</span>
          </div>
        )}
      </div>
      <button className="collapse-btn" onClick={toggleSidebar}>
        {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
      </button>
    </div>

    <nav className="nav-items">
         {allowedRoutes.map((route) => {
        const Icon = iconMap[route.name] || Home;
        return (
          <div className="nav-item-wrapper" key={route.path}>
            <NavLink
              to={route.path}
              end
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""} ${collapsed ? "collapsed-link" : ""}`
              }
              title={collapsed ? route.name : ""}
              onClick={() => {
                if (windowWidth <= 768) setMobileOpen(false);
                setActiveMenu(route.name);
              }}
            >
              <Icon size={20} />
              {!collapsed && <span className="link-text">{route.name}</span>}
            </NavLink>
            {collapsed && <span className="tooltip">{route.name}</span>}
          </div>
        );
      })}
    </nav>
  </aside>
</>


);
}
