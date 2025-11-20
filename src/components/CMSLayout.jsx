/* CMSLayout.jsx */
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopPanel from "./TopPanel";
import { routesConfig } from "./common/routesConfig";

export default function CMSLayout({ user, useruidrole: propUserRole, onLogout, theme }) {
const location = useLocation();
const currentPath = location.pathname;

const [activeMenu, setActiveMenu] = useState(() => {
const route = routesConfig.find(r => r.path === currentPath);
return route?.name || "Dashboard";
});

const [useruidrole, setUseruidrole] = useState(() => {
const saved = JSON.parse(localStorage.getItem("hc_user_role"));
return propUserRole || saved || {};
});

useEffect(() => {
const route = routesConfig.find(r => r.path === currentPath);
setActiveMenu(route?.name || "Dashboard");
}, [currentPath]);

useEffect(() => {
if (propUserRole) {
setUseruidrole(propUserRole);
localStorage.setItem("hc_user_role", JSON.stringify(propUserRole));
}
}, [propUserRole]);

const token = typeof user?.getToken === "function" ? user.getToken() : null;
const uid = useruidrole?.uid || null;
const role = useruidrole?.role ? String(useruidrole.role) : "user";

const renderPage = () => {
const route = routesConfig.find(r => r.name === activeMenu);
if (route && route.component) {
const Component = route.component;
return (
<Component
user={user}
token={token || ""}
uid={uid || ""}
userrole={role || "user"}
designation={useruidrole?.designation || ""}
/>
);
}
return ( <div className="p-8"> <h1 className="text-3xl font-semibold vision-text-primary">
Hindi Comics CMS में आपका स्वागत है </h1> <p className="mt-3 vision-text-secondary text-lg">
शुरू करने के लिए बाईं ओर के साइडबार से कोई विकल्प चुनें। </p> </div>
);
};

return ( <div className="app-container flex min-h-screen"> 
<Sidebar role={role} user={user} activeMenu={activeMenu} setActiveMenu={setActiveMenu} /> 
<div className="maincontentpanel flex-1 transition-all duration-300 relative pt-24 p-6"> 
    <TopPanel user={user} onLogout={onLogout} theme={theme} />
{renderPage()} 
</div>
 </div>
);
}
