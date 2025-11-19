/* AppRoutes.jsx */
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./CMSLogin";
import CMSLayout from "./CMSLayout";

export default function AppRoutes({ user, setUser, theme }) {
const storedUserRole = JSON.parse(localStorage.getItem("hc_user_role")) || {};
const [useruidrole, setUseruidRole] = useState(storedUserRole);

// Logout handler
const handleLogout = () => {
if (user?.logout) user.logout();
setUser(null);
localStorage.removeItem("hc_user");
localStorage.removeItem("hc_user_role");
};

return ( <Routes>
{/* Public Login */}
<Route
path="/"
element={<Login onLogin={setUser} setUseruidRole={setUseruidRole} />}
/>

  {/* Protected CMS Routes */}
  <Route
    path="/cms/*"
    element={
      user ? (
        <CMSLayout
          user={user}
          useruidrole={useruidrole}
          onLogout={handleLogout}
          theme={theme}
        />
      ) : (
        <Navigate to="/" replace />
      )
    }
  />

  {/* Fallback */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>


);
}
