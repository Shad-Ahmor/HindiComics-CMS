import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { 
  Home, BookOpen, Layers, Ticket, Share2, Activity,
  ChevronsLeft, ChevronsRight, Menu
} from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: Home, path: "/cms" },
  { name: "Comics", icon: BookOpen, path: "/cms/comics" },
  { name: "Contents", icon: Layers, path: "/cms/content" },
  { name: "Coupons", icon: Ticket, path: "/cms/coupons" },
  { name: "Referrals", icon: Share2, path: "/cms/referral" },
  { name: "User Logs", icon: Activity, path: "/cms/userlogs" },
];

export default function Sidebar({ user }) {
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
      {windowWidth <= 768 && (
        <button className="mobile-hamburger" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
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



        {navItems.map((item) => {
           
            const Icon = item.icon;
            return (
              <div className="nav-item-wrapper" key={item.path}>
                <NavLink
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""} ${collapsed ? "collapsed-link" : ""}`
                  }
                  title={collapsed ? item.name : ""}
                  onClick={() => windowWidth <= 768 && setMobileOpen(false)}
                >
                  <Icon size={20} />
                  {!collapsed && <span className="link-text">{item.name}</span>}
                </NavLink>
                {collapsed && <span className="tooltip">{item.name}</span>}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
